var express = require('express');
var expressResource = require('express-resource');
var mongoose = require('mongoose');

var app = express.createServer();

var titles = app.resource('api/titles', require('./controllers/titles'));
var cast = app.resource('cast', require('./controllers/titles/cast'));
titles.add(cast);

app.use(express['static']('./public'));

app.listen(3000, function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server started');
});

mongoose.connect('mongodb://localhost/imdb', function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Connected to Mongo');
});
