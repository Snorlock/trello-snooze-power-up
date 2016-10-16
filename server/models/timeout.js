var mongoose = require('mongoose');

module.exports = mongoose.model('timeout', {
  unix: String,
  user: String,
	card: String,
  expireAt: Date
});
