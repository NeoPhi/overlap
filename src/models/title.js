var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TitleModel;
var Title = new Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  cast: [String]
});

Title.statics.ensureTitleAndCast = function(id, name, year, type, castName, callback) {
  // Ensure we don't get any id collisions
  var conditions = {
    _id: id,
    name: name
  };
  var update = {
    $set: {
      name: name,
      year: year,
      type: type
    },
    $addToSet: {
      cast: castName
    }
  };
  var options = {
    upsert: true
  };
  TitleModel.update(conditions, update, options, callback);
};

TitleModel = mongoose.model('Title', Title);

module.exports = {
  model: TitleModel,
  schema: Title
};
