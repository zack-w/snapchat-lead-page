
import express = require('express');
import { join } from 'path';

// Init express
const server: express.Application = express();

// Config vars
const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

server.get('/', function (req, res) {
  res.send('Hello World!');
});

server.set('port', PORT);

server.listen(server.get('port'), () => {
  console.log(`Express server listening on PORT:${PORT}`);
});
