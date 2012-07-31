var express = require('express');
var expressResource = require('express-resource');
var mongoose = require('mongoose');
var winston = require('winston');

var app = express.createServer();

var titles = app.resource('api/titles', require('./controllers/titles'));
var cast = app.resource('cast', require('./controllers/titles/cast'));
titles.add(cast);

app.use(express['static']('./public'));

app.listen(3000, function(err) {
  if (err) {
    winston.error(err);
    process.exit(1);
  }
  winston.info('Server started');
});

mongoose.connect('mongodb://localhost/imdb', function(err) {
  if (err) {
    winston.error(err);
    process.exit(1);
  }
  winston.info('Connected to Mongo');
});
