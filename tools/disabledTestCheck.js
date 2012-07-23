var fs = require('fs');
var _ = require('underscore');
var wrench = require('wrench');
var path = require('path');

var EXT_TEST = /\.spec\.js$/;
var DISABLED_TEST = /^\s*(xdescribe|xit)\s*\(/m;

function extFilter(name) {
  return EXT_TEST.test(name);
}

function testForDisabled(file) {
  var data = fs.readFileSync(file).toString();
  return DISABLED_TEST.test(data);
}

console.log('Checking files for disabled tests');
var filesWithDisabledTests = [];
_.each(['test', 'integration'], function(dir) {
  var chain = _.chain([dir]);
  chain = chain.filter(fs.existsSync);
  chain = chain.map(wrench.readdirSyncRecursive);
  chain = chain.flatten();
  chain = chain.map(function(file) {
    return path.join(dir, file);
  });
  chain = chain.filter(extFilter);
  chain = chain.filter(testForDisabled);
  filesWithDisabledTests = filesWithDisabledTests.concat(chain.value());
});

if (filesWithDisabledTests.length > 0) {
  console.log('*** ERROR Files with disabled tests:');
  console.log(filesWithDisabledTests.join('\n'));
  process.exit(1);
}
