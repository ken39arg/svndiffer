var child_process = require('child_process');
var libxmljs = require("libxmljs");

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
    var doc     = libxmljs.parseXmlString(stdout);
    var items   = doc.find('//path');
    var paths   = [];
    var ext     = '';
    var kind    = '';
    for (var i=0;i<items.length;++i) {
      kind  = items[i].attr('kind').value();
      if (kind == 'file') {
        ext   = (items[i].text().split(".")).pop().toLowerCase();
        if (ext == 'gif' || ext == 'jpg' || ext == 'png') {
          kind = 'image';
        } else if (ext == 'swf') {
          kind = 'swf';
        }
      }
      paths.push({
        item:  items[i].attr('item').value(),
        props: items[i].attr('props').value(),
        kind:  kind,
        path:  items[i].text().replace(old_url, '').replace(new_url, ''),
      });
    }
    callback({
      paths:   paths,
      old_url: old_url,
      new_url: new_url,
      error:  error || stderr,
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
