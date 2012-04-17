var child_process = require('child_process')
  , xml2js        = require("xml2js");

var SVNDiffer = function(opts) {
  this.repository = opts.repository;  
  this.username   = opts.username;  
  this.password   = opts.password;
  this.paths      = [];
};

SVNDiffer.prototype.getSummary = function (old_target, new_target, callback) {
  var old_url = this.repository + old_target;
  var new_url = this.repository + new_target;
  var cmd = 'svn diff --summarize --xml';
  cmd += ' --old=' + old_url;
  cmd += ' --new=' + new_url;
  cmd += this._common_options();

  var that = this;

  child_process.exec(cmd, { }, function(error, stdout, stderr) {
    if (error || stderr) {
    console.log("error: " + error + " : " + stderr);
      callback({
        paths: [],
        old_url: old_url,
        new_url: new_url,
        error:  error || stderr,
      });
    }

    var parser = new xml2js.Parser({
    });

    parser.parseString(stdout, function (err, result) {
      var paths   = [];
      var ext     = '';
      var kind    = '';
      for (var n in result.paths) {
        for (var i in result.paths[n]) {
          var node = result.paths[n][i];
          kind  = node['@']['kind'];
          if (kind == 'file') {
            ext   = (node['#'].split(".")).pop().toLowerCase();
            if (ext == 'gif' || ext == 'jpg' || ext == 'png') {
              kind = 'image';
            } else if (ext == 'swf') {
              kind = 'swf';
            }
          }
          paths.push({
            item:  node['@']['item'],
            props: node['@']['props'],
            kind:  kind,
            path:  node['#'].replace(old_url, '').replace(new_url, ''),
          });
        }
      }
      callback({
        paths:   paths,
        old_url: old_url,
        new_url: new_url,
        error:   err,
      });
    });
  });
}

SVNDiffer.prototype._common_options = function() {
  var options =  ' --username ' + this.username;
  if (this.password) {
    options += ' --password ' + this.password;
  }
  options += ' --no-auth-cache --non-interactive --trust-server-cert'; 
  return options;
}

exports.SVNDiffer = SVNDiffer;
