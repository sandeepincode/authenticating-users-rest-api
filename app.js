var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

/* Connecting to the database */
mongoose.connect('mongodb://localhost/YoDataBase');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('database connection has been opened');
});

/* using the user session */
app.use(session({
  secret: 'this should be the secret key',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

/* parse incoming requests */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/* include routes */
var routes = require('./server/siteRouter');
app.use('/', routes);

/* 404 handler */
app.use(function (req, res, next) {
  var date = new Date();
  return res.send({
    msg : '404 : Page does not exist',
    dateNtime : date
  });
});
/* Forward to error handler*/
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  var date = new Date();
   res.send({
    msg : err.message,
    dateNtime : date
  });
});

app.listen(3000, function () {
  console.log('Launching on port 3000');
});
