var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    postName: String,
    postTitle: String,
    postBody: String,
    createDate: { type: Date, default: Date.now },
    modifyDate: { type: Date, default: Date.now }
});

/* global db ????? */
// module.export = db.model('user',userSchema,'user');
exports.Post = mongoose.model('posts',postSchema,'posts');