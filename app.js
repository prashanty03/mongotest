
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , gumball = require('./routes/gumball')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/gumball', gumball.findAll);
app.get('/getDetails/:id', gumball.findById);
app.post('/getDetails/:id', gumball.updategumball);
app.get('/gumball/:id', gumball.findById);
app.post('/gumball', gumball.addgumball);
app.put('/gumball/:id', gumball.updategumball);
app.del('/gumball/:id', gumball.deletegumball);

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var address =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
app.listen(port, address);
