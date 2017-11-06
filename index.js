"use strict";
var express = require('express');
var app = express();
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var shiftModel = require('./model');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));

app.use(session({
  secret: 'nolonwabo',
  resave: false,
  saveUninitialized: true
}))


app.set('view engine', 'handlebars');
var massage = '';
app.get('/waiters/:username',isWaiter, function(req, res, next) {
  var username = req.params.username;
  shiftModel.findOne({
    username: username
  }, function(err, waiterSelectedDay) {
    if (err) {
      return err;
    } else {
      if (waiterSelectedDay) {
        massage = 'Please update your days ' + username;
        res.render('index', {
          username: massage,
          monday: waiterSelectedDay.days.Monday,
          tuesday: waiterSelectedDay.days.Tuesday,
          wednesday: waiterSelectedDay.days.Wednesday,
          thursday: waiterSelectedDay.days.Thursday,
          friday: waiterSelectedDay.days.Friday,
          saturday: waiterSelectedDay.days.Saturday,
          sunday: waiterSelectedDay.days.Sunday
        });
      } else {
        massage = 'Please select your day(s) ' + username;
        res.render('index', {
          username: massage
        })
      }
    }
  })
});

function coloringDays(colorDay) {
  if (colorDay === 3) {
    return 'color1';
  } else if (colorDay < 3) {
    return 'color2';
  } else {
    return 'color3';
  }
}

app.post('/waiters/:username',isWaiter, function(req, res) {
  var output = 'Your shifts has been updated';
  var shift = "Your shift has been added";
  var days = req.body.days;
  var daysObj = {};
  // console.log(days);
  var username = req.params.username;
  if (!days) {
    var text = 'Please select atleast one day';
    res.render('index', {
      informText: text
    })
    return
  }
  //convert to array
  if (!Array.isArray(days)) {
    days = [days];
  }
  //loop thru
  days.forEach(function(daySelected) {
    daysObj[daySelected] = true
  })
  //find 1 and update if username exists
  shiftModel.findOneAndUpdate({
      username: username
    }, {
      days: daysObj
    },
    function(err, waiterName) {
      if (err) {
        console.log(err);
      } else {
        if (!waiterName) {
          // create new waiter
          var storingWaitersNames = new shiftModel({
            username: username,
            days: daysObj
          });
          //save the new user
          storingWaitersNames.save(function(err, waiterName) {
            if (err) {
              console.log('Error Massage:' + err);
            } else {
              res.render('index', {
                output: shift,
                monday: waiterName.days.Monday,
                tuesday: waiterName.days.Tuesday,
                wednesday: waiterName.days.Wednesday,
                thursday: waiterName.days.Thursday,
                friday: waiterName.days.Friday,
                saturday: waiterName.days.Saturday,
                sunday: waiterName.days.Sunday
              })

              console.log('Saved to database');
            }
          })
        } else {
          res.render('index', {
            output: output,
            monday: waiterName.days.Monday,
            tuesday: waiterName.days.Tuesday,
            wednesday: waiterName.days.Wednesday,
            thursday: waiterName.days.Thursday,
            friday: waiterName.days.Friday,
            saturday: waiterName.days.Saturday,
            sunday: waiterName.days.Sunday
          });
        }
      }
    });
});
app.get('/days', isAdmin, function(req, res) {
  shiftModel.find({}, function(err, avalaibleWaiters) {
    var Monday = [];
    var Tuesday = [];
    var Wednesday = [];
    var Thursday = [];
    var Friday = [];
    var Saturday = [];
    var Sunday = [];
    if (err) {
      return err;
    } else {
      for (var i = 0; i < avalaibleWaiters.length; i++) {
        var daysLoop = avalaibleWaiters[i].days;
        for (var avalaibleDay in daysLoop) {

          if (avalaibleDay === 'Monday') {
            Monday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Tuesday') {
            Tuesday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Wednesday') {
            Wednesday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Thursday') {
            Thursday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Friday') {
            Friday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Saturday') {
            Saturday.push(avalaibleWaiters[i].username)
          } else if (avalaibleDay === 'Sunday') {
            Sunday.push(avalaibleWaiters[i].username)
          }
        }
      }
    }
    res.render('waiter', {
      monday: Monday,
      color1: coloringDays(Monday.length),
      tuesday: Tuesday,
      color2: coloringDays(Tuesday.length),
      wednesday: Wednesday,
      color3: coloringDays(Wednesday.length),
      thursday: Thursday,
      color4: coloringDays(Thursday.length),
      friday: Friday,
      color5: coloringDays(Friday.length),
      saturday: Saturday,
      color6: coloringDays(Saturday.length),
      sunday: Sunday,
      color7: coloringDays(Sunday.length)
    });
  });
})
app.post('/reset', function(req, res) {
  shiftModel.remove({}, function(err, remove) {
    if (err) {
      return err;
    }
    res.render('index')
  })
});

app.get('/login',  function(req, res) {
    res.render('login');
  })

  var users ={
    "admin": "admin",
    "Temba": "waiter"
  };
app.post('/login', function(req, res){
  var username = req.body.username;
  var psw = req.body.psw;
  var userRoles = users[req.body.username];

  if(userRoles && req.body.psw === "pass123"){
    req.session.username = req.body.username;
    req.session.userRoles = userRoles;

    if (userRoles ==="waiter") {
      res.redirect("/waiters/" + username);
    }
    else if (userRoles === "admin") {
      res.redirect("/days");
    }else {
      res.redirect("/login");
    }
  }
})

app.get('/access_denied', function(req, res){
  res.render('access_denied');
})

function isWaiter(req, res, next){
  if (!req.session.username){
    return res.redirect("/login");
  }
  if (req.session.username === "admin"){
    return res.redirect("/access_denied");
  }
  next();
}
function isAdmin(req, res, next){
  if (!req.session.username){
    return res.redirect("/login");
  }
  if (req.session.username !== "admin") {
    return res.redirect("/access_denied");
  }
  next();
}

app.get('/logout', function(req, res, next){
  delete req.session.username;
  res.redirect("/login");
  next();
});




var port = process.env.PORT || 3002
var server = app.listen(port, function() {
  console.log("Started app on port : " + port)
});
