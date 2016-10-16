var mongoose = require('mongoose');

module.exports = mongoose.model('users', {
  id: String,
  token: String
});
