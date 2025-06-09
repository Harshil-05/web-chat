const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  password: String, // Note: hash in production!
});
module.exports = mongoose.model('User', UserSchema);
