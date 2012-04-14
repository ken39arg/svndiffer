
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

  svndiffer.getSummary(req.query.old_url, req.query.new_url, function (r) {
    r.title = 'diff';
    r.req   = req.body;
    r.repository = svndiffer.repository;
    res.render('diff', r)
  });
};
