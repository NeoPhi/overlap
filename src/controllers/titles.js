var models = require('../models/');
var Title = models.Title;

var load = function(id, callback) {
  Title.findByName(id, callback);
};

module.exports.load = load;
