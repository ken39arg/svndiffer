
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , opts   = require('opts')
  , config = require('./lib/config');

opts.parse([
{
    "long": "port",
    "short": "p",
    "description": "listening port",
    "value": true,
    "required": false
},
{
    "long": "username",
    "short": "U",
    "description": "svn username",
    "value": true,
    "required":false
},
{
    "long": "password",
    "short": "P",
    "description": "svn password",
    "value": true,
    "required": false 
},
{
    "long": "repository",
    "short": "R",
    "description": "svn repository url",
    "value": true,
    "required": false 
},
]);

config.username = opts.get('username') || config.username;
config.password = opts.get('password') || config.password;
config.repository = opts.get('repository') || config.repository;

var app = module.exports = express.createServer();
var port = opts.get("port") || 3000;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/diff', routes.diff);

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
