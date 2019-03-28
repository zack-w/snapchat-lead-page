
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
import { InvalidRequestError, EmailInUseError, CampaignDoesNotExistError } from '../errors';
import User from '../models/user.relational';
import { AppError } from '../errors/app.error';
import { wrap } from '../middleware';
import Campaign from '../models/campaign.relational';
import Submission from '../models/submission.relational';
import SubmissionValue from '../models/submission-value.relational';

/*
  Add campaign submission
*/

export interface ISubmission {
  params: {[index: string]: string},
  values: {[index: string]: (string|number)}
}

server.post("/campaigns/:campaignId/submissions", wrap(async function (req, res) {
  let params: ISubmission = req.body as ISubmission;

  // Locate the campaign
  let campaign: Campaign = await Campaign.findOne({where: {id: req.params.campaignId}});

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
  let campaign: Campaign = await Campaign.findOne({where: {id: req.params.campaignId}});

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
