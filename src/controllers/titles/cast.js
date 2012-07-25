module.exports.index = function(req, res) {
  res.json({
    result: req.title.cast
  });
};
