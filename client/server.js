const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;

require('dotenv').config()

//Static file declaration
app.use(express.static(path.join(__dirname, 'dist')));

//production mode
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  //
  app.get('*', (req, res) => {
    res.sendfile(path.join(__dirname = 'dist/index.html'));
  })
}
//build mode
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/dist/index.html'));
})

//start server
app.listen(port, (req, res) => {
  console.log( `server listening on port: ${port}`);
});
