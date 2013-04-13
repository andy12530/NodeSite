
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
  , http = require('http')
  , path = require('path')
  , config = require('./config').config
  , fs = require('fs');

var accessLog = fs.createWriteStream('./logs/access.log', {flags: 'a'})
  , errorLog = fs.createWriteStream('./logs/error.log', {flags: 'a'});
    

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger({stream: accessLog}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.session_secret
  }));

  app.use(function(req, res, next){
    if (req.session && req.session.user) {
      res.locals.userPhone = req.session.user.phone;
    }
    next();
  });
  
  app.use('/static', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(function(err, req, res, next) {
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
  });

  app.use(express.errorHandler());
  app.locals.pretty = true;
});

routes(app);

var server = module.exports = http.createServer(app);

if (!module.parent) {
  server.listen(3000, function() {
    console.log("Express server listening on port 3000");
  });
}
