var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TitleModel;
var Title = new Schema({
  name: {
    type: String,
    required: true
  },
  cast: [String]
});

Title.index({
  name: 1
}, {
  unique: true
});

Title.statics.ensureCast = function(name, castName, callback) {
  var conditions = {
    name: name
  };
  var update = {
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
