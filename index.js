"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var shiftModel = require('./model');
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
  res.render('index', {username: massege});
  console.log(username);
});
var daysSelected = {
  monday:[],
  tuesday:[],
  wensday:[],
  thursday:[],
  friday:[],
  saturday:[],
  sunday:[]
};
app.post('/waiters/:username', function(req, res){
  var output ='Your shifts has been updated';
  var days = req.body.days;
  var daysObj = {};

  console.log(days);
  var username = req.params.username;
  // console.log(username);
  //for (var i = 0; i < days.length; i++) {
  //  var currentDay = days[i];
  //}
  if(!Array.isArray(days)){
    days=[days];
  }
  days.forEach(function(daySelected){
    daysObj[daySelected] = true

  })
  var storingWaitersNames = new model({
    username: username,
    days: daysObj
  });
  storingWaitersNames.save(function(err){
    if(err){
      console.log('Error Massage:' + err);
    }
    else{
      console.log('Saved to database');
    }
  })
  res.render('index', {output: output});
});

app.get('/days', function(req, res){
  shiftModel.find({}, function(err, names){
    if(err){
      console.log(err);
    }
    else{
      res.render('waiter',{waiter: daysObj})
    }
  })

})

var port = process.env.PORT || 3002
var server = app.listen(port, function() {
  console.log("Started app on port : " + port)
});

//
// model.storeRegNum.findOne({
//     regNum: regNum
//   },
//   function(err, platesStored) {
//     if (err) {
//       return (err);
//     } else if (platesStored) {
//       storeRegistration.push(platesStored);
//       platesStored = 1;
//       res.render('index', {
//         massege: massage
//       });
//     } else {
//
//       if (!platesStored) {
//         var storingRegPlates = new model.storeRegNum({
//           regNum: regNum
//         });
//         storeRegistration.push(platesStored);
//         storingRegPlates.save(function(err, data) {
//           if (err) {
//             return err
//           }
//           model.storeRegNum.find({}, function(err, results) {
//             if (err) {
//               return err
//             }
//             res.render('index', {
//               numberPlates: results
//             });
//
//           })
//         })
//       }
//     }
//   })
// });
