var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: String,
    userPwd: String,
    userEmail: String,
    createDate: { type: Date, default: Date.now },
    userHead: String
});

var User = mongoose.model('users', userSchema,'users');
var promiseObj = require('bluebird');
promiseObj.promisifyAll(User);
promiseObj.promisifyAll(User.prototype);

exports.User = User;