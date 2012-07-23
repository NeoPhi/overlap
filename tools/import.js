if (process.argv.length < 3) {
  console.log('Usage: node import.js file');
  process.exit(1);
}

var _ = require('underscore');

var dynode = require('dynode');

dynode.auth({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

var fs = require('fs');

var file = process.argv[2];

var pending = 0;
var count = 0;
var done = false;

var inputHandler = function() {
  var currentData = '';
  var currentFn;
  var currentName;
  var currentTitles = {};

  var TABS = /\t+/;
  var TITLE = /^("([^"]+)"|(.*?)\s\()/;

  var extractTitle = function(title) {
    var data = TITLE.exec(title);
    if (!data) {
      console.log('ERROR');
      console.log(title);
      process.exit(1);
    }
    if (_.isUndefined(data[2])) {
      return data[3];
    }
    return data[2];
  };

  var noop = function(lines) {

  };

  var complete = function(err, info) {
    if (err) {
      console.error('ERROR', err);
      process.exit(1);
    }
    count += 1;
    if ((count % 100) === 0) {
      console.log(count);
    }
    pending -= 1;
    if (pending === 0) {
      console.log('RESUME');
      input.resume();
    }
    if (done && pending === 0) {
      process.exit(0);
    }
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
      var parts = line.split(TABS);
      var title;
      if (parts[0] !== '') {
        currentTitles = {};
        var names = parts[0].split(', ');
        if (names.length === 1) {
          currentName = names[0];
        } else {
          currentName = names[1] + ' ' + names[0];
        }
        title = extractTitle(parts[1]);
      } else {
        title = extractTitle(parts[1]);
      }
      if (!_.has(currentTitles, title)) {
        currentTitles[title] = true;
        pending += 1;
        if (pending === 100) {
          console.log('PAUSE');
          input.pause();
        }
        var updates = {
          names: {
            add: [currentName]
          }
        };
        dynode.updateItem('Titles', title, updates, complete);
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
    currentData += data.toString();
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

var input = fs.createReadStream(file);
var handler = inputHandler();

input.on('data', handler.onData);

input.on('error', function(err) {
  console.error(err);
  process.exit(1);
});

input.on('end', function() {
  console.log('DONE READING');
  done = true;
  if (done && (pending === 0)) {
    process.exit(0);
  }
});
