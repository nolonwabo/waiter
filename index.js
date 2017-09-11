"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var shiftModel = require('./model');
// console.log(shiftModel);
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
var massege = '';
app.get('/waiters/:username', function(req, res, next) {
  var username = req.params.username;
  massege = 'Please select your days ' + username;
  res.render('index', {
    username: massege
  });
  console.log(username);
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

app.post('/waiters/:username', function(req, res) {
  var output = 'Your shifts has been updated';
  var shift = "Your shift has been added";
  var days = req.body.days;
  var daysObj = {};
  // console.log(days);
  var username = req.params.username;
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
            console.log('lulo');
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
app.get('/days', function(req, res) {
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
var port = process.env.PORT || 3002
var server = app.listen(port, function() {
  console.log("Started app on port : " + port)
});
