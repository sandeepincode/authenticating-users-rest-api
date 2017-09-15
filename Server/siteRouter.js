var express = require('express');
var siteRouter = express.Router();
var User = require('../Schemas/user');


/* GET route : if the user session is open then we proceed to the page otherwise we will send them to the login */
siteRouter.get('/', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        var date = new Date();
        return res.send({
          msg : error,
          dateNtime : date
        });
      } else {
        /* user does not exist to login plz ;) */
        if (user === null)
          /* you have the option here to send index.html instead which will allow you to test this DB */
          return res.redirect(/* This is where you want to redirect them to the login page*/);
        } else {
          return res.redirect(/*This is where you want to redirect the user to if the session already exists */);
        }
      }
    });
});


/* POST route sending the data from login/register */
siteRouter.post('/', function (req, res, next) {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf &&
    req.body.firstname &&
    req.body.secondname) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      secondname: req.body.secondname
    }

    User.create(userData, function (error, user) {
      if (error) {
        var date = new Date();
        return res.send({
          msg : error,
          dateNtime : date
        });
      } else {
        req.session.userId = user._id;
        return res.redirect(/* user has been registered so redirect to homepage*/);
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var date = new Date();
        return res.send({
          msg : 'Incorrect password', /* Since we have server side vaildation for the email and I would reccomend using Required in your frontend html*/
          dateNtime : date
        });
      } else {
        req.session.userId = user._id;
        return res.redirect(/* user has login in and the session has been created */);
      }
    });
  } else {
    var date = new Date();
    return res.send({
      msg : 'looks like you are missing a few fields',
      dateNtime : date
    });
  }
})

// GET route after registering
siteRouter.get(/* make this route for your homepage */, function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          /* You can either force them to be redirected to the login page, note that
          they will not have access to the server information in the first place since
          the session does exist! REMEMBER!!!! Check the user session first before doing anything else */
          return res.redirect('/');
        } else {
          return res.redirect(/* redirect them to corresponding page, or do res.send and send them the files */);
        }
      }
    });
});

// GET for terminating the session
siteRouter.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = siteRouter;
