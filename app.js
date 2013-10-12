
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./app/routes')
  , ws = require('./app/routes/ws')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/saveVars', ws.save);
app.get('/saveConfig', function(req, res){
  var file = __dirname + '/app/sass/theme/config/_config.scss';
  res.download(file); // Set disposition and send it.
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
