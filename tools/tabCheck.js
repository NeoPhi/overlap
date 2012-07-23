var fs = require('fs');
var _ = require('underscore');
var wrench = require('wrench');
var path = require('path');

var EXT_TEST = /\.js$/;
var TAB_TEST = /\t/;

function extFilter(name) {
  return EXT_TEST.test(name);
}

function testForTabs(file) {
  var data = fs.readFileSync(file).toString();
  return TAB_TEST.test(data);
}

console.log('Checking files for tabs');
var filesWithTabs = [];
_.each(['src', 'test', 'tools'], function(dir) {
  var chain = _.chain([dir]);
  chain = chain.filter(fs.existsSync);
  chain = chain.map(wrench.readdirSyncRecursive);
  chain = chain.flatten();
  chain = chain.map(function(file) {
    return path.join(dir, file);
  });
  chain = chain.filter(extFilter);
  chain = chain.filter(testForTabs);
  filesWithTabs = filesWithTabs.concat(chain.value());
});

if (filesWithTabs.length > 0) {
  console.log('*** ERROR Files with tabs:');
  console.log(filesWithTabs.join('\n'));
  process.exit(1);
}
