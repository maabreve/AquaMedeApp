// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var mongooseCloud = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./src/config/config.js');
var configDB = require('./src/config/database.js');
var port = process.env.PORT || config.port;

// db connection ===============================================================
mongoose.connect(configDB.urlCloud, { useMongoClient: true }).then(
  console.log('Success local database connection')
).catch(err => {
  console.log('Local database connection error - ', err)
});

require('./src/config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser('macaco vermeio')); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/build'));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', __dirname + '/build/views');

// required for passport
app.use(session({
  secret: 'macacovermeio', // session secret
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, expires: new Date(Date.now() + 60 * 10000),
    maxAge: 60 * 10000
  }
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes.js')(app, passport, mongoose); 

// launch ======================================================================
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});

// socket io
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  //socket.emit('counter', 10);
  console.log('socket connected!!!');
});