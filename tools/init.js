var dynode = require('dynode');

dynode.auth({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

var opts = {
  hash: {
    title: String
  }
};
  
dynode.createTable('Titles', opts, console.log);
