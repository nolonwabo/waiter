const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Routes = require('./index');
const Waiters = require('./model');
const MongoURL = Waiters(process.env.MONGO_DB_URL || "mongodb://localhost/waiters");
const exportRoute = Routes(model);
const app = express();

app.engine('.handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', function(req, res){
  res.redirect('/waiters')
});
app.get('/waiters',exportRoute.inputWaiterName);
  app.get('/waiters/:username', exportRoute.days);
  app.post('/waiters/:username', exportRoute.selectedDays);
  app.get('/days', exportRoute.waiterDays);
  app.post('/reset', exportRoute.reset);

const port = process.env.PORT || 3002
app.listen(port, function() {
  console.log("Started app on port : " + port)
});
