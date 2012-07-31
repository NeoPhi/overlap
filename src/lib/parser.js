var _ = require('underscore');

var TABS = /\t+/;

/*jshint regexp:false */
var BILLING = / {2}<([^>]+)>$/;
var CHARACTER = / {2}\[([^\]]+)\]$/;
var NOTE = / {2}\(([^0-9?][^\)]+)\)$/;
var SUSPENDED = / \{\{SUSPENDED\}\}$/;
var EPISODE = /\{([^{}]+)\}$/;
var TYPE = /\((TV|V|VG)\)$/;
var YEAR = /\(([0-9?]+(\/[^\)]+)?)\)$/;

var TITLE = /^(.*?) \(([0-9?]+(\/[^)]+)?)\)( \((TV|V|VG)\))?/;

var TYPE_LOOKUP = {
  TV: 'TV Movie',
  V: 'Video',
  VG: 'Video Game'
};

var title = function(data) {
  var result = {};
  var titleParts = TITLE.exec(data);
  if (!titleParts) {
    throw new Error('Unable to parse ' + data);
  }
  var name = titleParts[1];

  var type = titleParts[5];
  if (_.isUndefined(type)) {
    if (name.charAt(0) === '"') {
      type = 'TV Show';
      name = name.substring(1, name.length - 1);
    } else {
      type = 'Movie';
    }
  } else {
    type = TYPE_LOOKUP[type];
  }

  var year = titleParts[2];

  if (_.isUndefined(name) || _.isUndefined(type) || _.isUndefined(year)) {
    throw new Error('Unable to parse ' + data);
  }
  return {
    title: [name, year,  type].join('\t'),
    name: name,
    year: year,
    type: type
  };
  /*
  var billingParts = BILLING.exec(name);
  if (billingParts) {
    name = name.substring(0, name.length - billingParts[1].length - 4);
  }
  var characterParts = CHARACTER.exec(name);
  if (characterParts) {
    name = name.substring(0, name.length - characterParts[1].length - 4);
  }
  var noteParts = NOTE.exec(name);
  if (noteParts) {
    name = name.substring(0, name.length - noteParts[1].length - 4);
  }
  if (SUSPENDED.test(name)) {
    result.suspended = true;
    name = name.substring(0, name.length - 14);
  }
  var episodeParts = EPISODE.exec(name);
  if (episodeParts) {
    result.episode = episodeParts[1];
    name = name.substring(0, name.length - episodeParts[1].length - 3);
  }
  var type;
  var typeParts = TYPE.exec(name);
  if (typeParts) {
    if (_.has(typeParts, typeParts[1])) {
      throw new Error('Bad type: ' + name + '|' + data);
    }
    type = TYPE_LOOKUP[typeParts[1]];
    name = name.substring(0, name.length - typeParts[1].length - 3);
  }
  var yearParts = YEAR.exec(name);
  if (!yearParts) {
    throw new Error('Bad year: ' + name + '|' + data);
  }
  result.year = yearParts[1];
  name = name.substring(0, name.length - yearParts[1].length - 3);
  if (_.isUndefined(type)) {
    if (name.charAt(0) === '"') {
      type = 'TV Show';
      name = name.substring(1, name.length - 1);
    } else {
      type = 'Movie';
    }
  }
  result.name = name;
  result.type = type;
  result.title = [name, result.year,  type].join('\t');
  return result;
  */
};

var line = function(data) {
  var parts = data.split(TABS);
  var result = {
    title: parts[1]
  };
  if (parts[0] !== '') {
    result.cast = parts[0];
  }
  return result;
};

module.exports.title = title;
module.exports.line = line;
