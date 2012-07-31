var winston = require('winston');

if (process.argv.length < 3) {
  winston.warn('Usage: node createIndexFile.js titles.tsv');
  process.exit(1);
}

var exitOnError = function(err) {
  if (err) {
    winston.error(err);
    process.exit(1);
  }
};

var fs = require('fs');

var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;

var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('imdb', server);

var count = 0;

// TODO: Understand why Mongoose stream was dropping records
db.open(function(err, db) {
  exitOnError(err);
  winston.info('Connected to Mongo');
  db.collection('titles', function(err, collection) {
    exitOnError(err);
    winston.info('Connected to Titles');
    var file = fs.openSync(process.argv[2], 'w');
    var stream = collection.find({}).streamRecords();
    stream.on('data', function(title) {
      fs.writeSync(file, [title._id, title.name, title.year, title.type].join('\t') + '\n');
      count += 1;
      if ((count % 10000) === 0) {
        winston.info(new Date(), count);
      }
    });
    stream.on('error', function(err) {
      exitOnError(err);
    });
    stream.on('end', function() {
      fs.closeSync(file);
      winston.info('Read', count);
      process.exit(0);
    });
  });
});
