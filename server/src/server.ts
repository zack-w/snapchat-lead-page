
const bodyParser = require('body-parser');
const argon2 = require('argon2');

import express = require('express');
import { join } from 'path';

require('dotenv').config()

// Init express
export const server: express.Application = express();
server.use(bodyParser.json());

// Config vars
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Setup core modules
import "./core/sequelize";
import { InvalidRequestError, EmailInUseError } from '../errors';
import User from '../models/user.relational';
import { AppError } from '../errors/app.error';
import { wrap } from '../middleware';

export interface ICreateAccountArgs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

server.post('/user', wrap(async function (req, res) {
  let params: ICreateAccountArgs = req.body as ICreateAccountArgs;

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
    password: argon2.hash(params.password)
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
