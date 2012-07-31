var models = require('../models/');
var Title = models.Title;
var request = require('request');
var winston = require('winston');

var index = function(req, res) {
  request({
    url: 'http://localhost:8080/',
    qs: req.query
  }, function(err, response, body) {
    if (err || response.statusCode !== 200) {
      winston.error(err, response);
      return res.json({
        err: 'Search error'
      });
    }
    res.json({
      result: JSON.parse(body)
    });
  });
};

var load = function(id, callback) {
  Title.findById(id, callback);
};

module.exports.index = index;
module.exports.load = load;
