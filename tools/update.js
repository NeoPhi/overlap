var dynode = require('dynode');

dynode.auth({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

var opts = {
  read: 5,
  write: 160
};
  
dynode.updateTable('Titles', opts, console.log);
