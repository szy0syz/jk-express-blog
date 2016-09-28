var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: String,
    userPwd: String,
    userEmail: String,
    createDate: { type: Date, default: Date.now }
});