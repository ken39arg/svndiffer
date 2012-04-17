
/*
 * GET home page.
 */
var SVNDiffer = require('../lib/svndiffer').SVNDiffer
  , config    = require('../lib/config');

exports.index = function(req, res){
  res.render('index', {
    title: 'index',
    repository: config.repository
  })
};

exports.diff = function(req, res){

  var svndiffer = new SVNDiffer({
    username:   req.query.username || config.username,
    password:   req.query.password || config.password,
    repository: req.query.repos    || config.repository,
  }); 

  var key = svndiffer.repository + ":" + req.query.old_url + ":" + req.query.new_url;

  config.memcache.client.get(key, function(error, data) {
    if (error || !data) {
      console.log("memcache error: " + error);
      svndiffer.getSummary(req.query.old_url, req.query.new_url, function (r) {
        r.title = 'diff';
        r.req   = req.query;
        r.repository = svndiffer.repository;

        config.memcache.client.set(key, JSON.stringify(r), function(error, result){
          res.render('diff', r);
        }, 3600);
      });
    } else {
      console.log("memcache get");
      res.render('diff', JSON.parse(data));
    }
  });

};
