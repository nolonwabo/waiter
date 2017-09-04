var mongoose = require('mongoose');
const MongoURL =process.env.MONGO_DB_URL || "mongodb://localhost/waiters";
mongoose.connect(MongoURL, {
  useMongoClient: true
});


var storeWaiters = mongoose.model('storeWaiters', {
  username: String,
  days: Object
 });

module.exports = storeWaiters;
