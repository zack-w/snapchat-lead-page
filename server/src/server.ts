
const bodyParser = require('body-parser');
const argon2 = require('argon2');
var cors = require('cors');

import express = require('express');
import { join } from 'path';

require('dotenv').config()

// Init express
export const server: express.Application = express();
server.use(bodyParser.json());
server.use(cors());


/*
  Create a request context we can pass around
*/

class RequestContext {
	[key: string]: any;
  public isAuthenticated = false;
  public _alreadyAuthenticated = false;
	public user?: User;
}

declare global {
	namespace Express {
		interface Request {
			context: RequestContext;
		}
	}
}

server.use((req, res, next) => {
  req.context = new RequestContext();
  next();
});

// Config vars
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Setup core modules
import "./core/sequelize";
import { InvalidRequestError, EmailInUseError, CampaignDoesNotExistError, NotAuthenticatedError, CampaignFieldDoesNotExistError } from '../errors';
import User from '../models/user.relational';
import { AppError } from '../errors/app.error';
import { wrap } from '../middleware';
import Campaign from '../models/campaign.relational';
import Submission from '../models/submission.relational';
import SubmissionValue from '../models/submission-value.relational';
import { authenticate } from '../middleware/authenticate.middleware';
import BackgroundStyle from '../models/background-style.relational';
import CampaignField from '../models/campaign-field.relational';

/*
  Get the authenticated user
*/
server.get("/me", authenticate(), wrap(async function (req, res) {
  if (!req.context.user) {
    throw Error("unreachable");
  }

  res.status(200).json(req.context.user._toJSON({
    requestingUser: req.context.user
  }));
}));

server.get("/me/campaigns", authenticate(), wrap(async function (req, res) {
  if (!req.context.user) {
    throw Error("unreachable");
  }

  res.status(200).json(await req.context.user.getFlatCampaigns());
}));

/*
  Add campaign submission
*/

export interface ISubmission {
  params: {[index: string]: string},
  values: {[index: string]: (string|number)}
}

server.get("/campaigns/:campaignId", authenticate(true), wrap(async function (req, res) {
  let params: ISubmission = req.body as ISubmission;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    throw new NotAuthenticatedError();
  }

  res.status(200).json(await campaign.flatten(full));
}));

server.put("/campaigns/:campaignId", authenticate(true), wrap(async function (req, res) {
  let params: any = req.body;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    throw new NotAuthenticatedError();
  }

  // Update the campaign
  await Campaign.update(
    {
      name: (params.name ? params.name : campaign.name),
      styling: (params.styling ? (typeof params.styling == "object" ? JSON.stringify(params.styling) : params.styling) : campaign.styling)
    }, {
      where: {
        id: campaign.id
      }
    }
  );

  res.status(200).json({success: true});
}));

export interface ICampaignCreateField {
  niceName: string;
}

server.post("/campaigns/:campaignId/field", authenticate(true), wrap(async function (req, res) {
  let params: ICampaignCreateField = req.body as ICampaignCreateField;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    // throw new NotAuthenticatedError();
  }

  // Create the field
  let field = new CampaignField({
    campaignId: campaign.id,
    niceName: params.niceName,
    key: params.niceName.toLowerCase().replace(" ", ""),
    type: "string"
  });

  await field.save();

  res.status(200).json(field);
}));

export interface ICampaignUpdateBackgroundStyleArgs {
  image: string;
  color: string;
};

// let newField = await axios.put(`${API_URL}/campaigns/${this.state.campaignId}/field/${fieldId}`, values);

export interface ICampaignFieldUpdateArgs {
  niceName: string;
  key: string;
  type: string;
};

server.put("/campaigns/:campaignId/field/:fieldId", authenticate(true), wrap(async function (req, res) {
  let params: ICampaignFieldUpdateArgs = req.body as ICampaignFieldUpdateArgs;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    throw new NotAuthenticatedError();
  }

  // Get the field
  let field: (CampaignField | null) = await CampaignField.findOne({
    where: {
      id: req.params.fieldId,
      campaignId: campaign.id
    }
  });

  // If the field doesn't exist
  if (!field) {
    throw new CampaignFieldDoesNotExistError();
  }

  // Update the field
  field.niceName = (params.niceName ? params.niceName : field.niceName);
  field.key = (params.key ? params.key : field.key);
  field.type = (params.type ? params.type : field.type);
  await field.save();

  res.status(200).json(field._toJSON());
}));

server.delete("/campaigns/:campaignId/field/:fieldId", authenticate(true), wrap(async function (req, res) {
  let params: ICampaignFieldUpdateArgs = req.body as ICampaignFieldUpdateArgs;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    throw new NotAuthenticatedError();
  }

  // Get the field
  let field: (CampaignField | null) = await CampaignField.findOne({
    where: {
      id: req.params.fieldId,
      campaignId: campaign.id
    }
  });

  // If the field doesn't exist
  if (!field) {
    throw new CampaignFieldDoesNotExistError();
  }

  // Update the field
  await field.destroy();

  res.status(200).json({success: true});
}));

server.put("/campaigns/:campaignId/backgroundStyle", authenticate(true), wrap(async function (req, res) {
  let params: ICampaignUpdateBackgroundStyleArgs = req.body as ICampaignUpdateBackgroundStyleArgs;
  let full: boolean = (req.query.full !== undefined);

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Do they have access?
  if (
    full && (
      !req.context.isAuthenticated
      || !req.context.user
      || req.context.user.id !== campaign.ownerUserId
    )
  ) {
    throw new NotAuthenticatedError();
  }

  // Get the background style
  let bgStyle: (BackgroundStyle | null) = await BackgroundStyle.findOne({
    where: {
      campaignId: campaign.id
    }
  });

  if (!bgStyle) {
    throw new Error("no background style associated with campaign");
  }

  // Update it
  await bgStyle.update({
    image: params.image ? params.image : bgStyle.image,
    color: params.color ? params.color : bgStyle.color
  });

  res.status(200).json({success: true});
}));

server.post("/campaigns/:campaignId/submissions", wrap(async function (req, res) {
  let params: ISubmission = req.body as ISubmission;

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  // Validate the submission
  await campaign.validateSubmission(params);

  // Create a new submission
  let submission: Submission = new Submission({
    campaignId: campaign.id
  });

  await submission.save();

  // Add submission values
  let keys = Object.keys(params.values);

  for(let i = 0; keys.length > i; i++) {
    let submissionValue = new SubmissionValue({
      submissionId: submission.id,
      key: keys[i],
      value: params.values[keys[i]]
    });

    await submissionValue.save();
  }

  res.status(200).json({success: true});
}));

server.get("/campaigns/:campaignId/submissions", wrap(async function (req, res) {
  // TODO: Authenticate

  // Locate the campaign
  let campaign: (Campaign | null) = await Campaign.findOne({where: {id: req.params.campaignId}});

  if (!campaign) {
    throw new CampaignDoesNotExistError();
  }

  res.status(200).json(await campaign.getSubmissionsFlat());
}));

/*
  Creating new a user
*/

export interface ICreateUserArgs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

server.post('/users', wrap(async function (req, res) {
  let params: ICreateUserArgs = req.body as ICreateUserArgs;

  // Check for missing fields
  if (
    !params || !params.firstName || !params.lastName
    || !params.email || !params.password
  ) {
    throw new InvalidRequestError();
  }

  // If the email is already in use
  if ((await User.count({where: {email: params.email}})) > 0) {
    throw new EmailInUseError();
  }

  // Create a new user
  let newUser = new User({
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    password: await argon2.hash(params.password)
  });

  await newUser.save();

  // Success
  res.status(200).json(newUser._toJSON());
}));

// Pass errors off to the client
server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  let error = err;

  // Send InternalServerError for non-application errors and log for development
  if (!(err instanceof AppError)) {
    console.error(`ERROR: ${req.method} ${req.url}`, err);

    error = new Error();
  }

  let output: any = {
    message: error.message,
    stack: undefined
  };

  for (let prop in error) {
    if (error.hasOwnProperty(prop)) {
      output[prop] = error[prop];
    }
  }

  res.status(error.statusCode).json(output);
});

/*
  Start the server
*/

server.set('port', PORT);

server.listen(server.get('port'), () => {
  console.log(`Express server listening on PORT:${PORT}`);
});
