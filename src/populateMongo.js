var winston = require('winston');

if (process.argv.length < 3) {
  winston.warn('Usage: node import.js file1 file2 file...');
  process.exit(1);
}

var _ = require('underscore');
var async = require('async');
var iconv = require('iconv-lite');

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var parser = require('./lib/parser');
var models = require('./models');

var count = 0;
var pending = 0;
var paused = false;

var inputHandler = function(input) {
  var currentData = '';
  var currentFn;
  var currentCast;
  var currentTitles = {};

  var complete = function(err, other) {
    if (err) {
      throw err;
    }
    pending -= 1;
    if ((paused) && (pending === 0)) {
      winston.info('Resuming');
      paused = false;
      input.resume();
    }
  };

  var addToMongo = function(castName, title) {
    var shasum = crypto.createHash('sha1');
    shasum.update(title.title);
    var id = shasum.digest('hex');
    models.Title.ensureTitleAndCast(id, title.name, title.year, title.type, castName, complete);
    pending += 1;
    if (pending === 1000) {
      winston.info('Pausing');
      paused = true;
      input.pause();
    }
  };

  var noop = function(lines) {
  };

  var extractData = function(lines) {
    var length = lines.length;
    for (var index = 0; index < length; index += 1) {
      var line = lines[index];
      if (line === '-----------------------------------------------------------------------------') {
        currentFn = noop;
        return;
      }
      if (line === '') {
        continue;
      }
      var data = parser.line(line);
      if (_.has(data, 'cast')) {
        currentTitles = {};
        currentCast = data.cast;
      }
      var title = parser.title(data.title);
      if (!_.has(currentTitles, title.title)) {
        count += 1;
        if ((count % 10000) === 0) {
          winston.info(new Date(), count);
        }
        currentTitles[title.title] = true;
        addToMongo(currentCast, title);
      }
    }
  };

  var lookForStart = function(lines) {
    var length = lines.length;
    for (var index = 0; index < length; index += 1) {
      var line = lines[index];
      if (line === '----\t\t\t------') {
        currentFn = extractData;
        extractData(lines.slice(index + 1));
        return;
      }
    }
  };

  var processLines = function(lines) {
    currentFn(lines);
  };

  var onData = function(data) {
    currentData += iconv.decode(data, 'latin1');
    var lines = currentData.split('\n');
    if (lines.length === 0) {
      return;
    }
    if (currentData.charAt(currentData.length - 1) === '\n') {
      currentData = '';
    } else {
      currentData = lines.pop();
    }
    processLines(lines);
  };

  currentFn = lookForStart;

  return {
    onData: onData
  };
};

var checkDone = function() {
  if (pending === 0) {
    winston.info('DONE', count);
    process.exit(0);
  }
  process.nextTick(checkDone);
};

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/imdb', function(err) {
  if (err) {
    winston.error('MONGO', err);
    process.exit(1);
  }
  winston.info('MONGO', 'Connected');
});

async.forEachSeries(_.rest(process.argv, 2), function(file, asyncCallback) {
  winston.info('Reading file', file);

  var input = fs.createReadStream(file);
  var handler = inputHandler(input);

  input.on('data', handler.onData);

  input.on('error', asyncCallback);

  input.on('end', function() {
    winston.info('DONE READING', file, count);
    asyncCallback();
  });
}, function(err) {
  if (err) {
    throw err;
  }
  checkDone();
});
