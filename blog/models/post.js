var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var format = require('date-format');

var postSchema = new Schema({
    postName: String,
    postTitle: String,
    postBody: String,
    createDate: {
        dft:{ type: Date, default: Date.now },
        std:{ type: String, default: format.asString('yyyy-MM-dd hh:mm',this.dft) }
    },
    modifyDate: { 
        dft:{ type: Date, default: Date.now },
        std:{ type: String, default: format.asString('yyyy-MM-dd hh:mm',this.dft) }
    },
    pv: { type: Number, default: 0 },
    postTags: [] //标签字符串数组
});

// oh yeah ~ 我用上bluebi了~~~~
var Post = mongoose.model('posts', postSchema,'posts');
var promiseObj = require('bluebird');
promiseObj.promisifyAll(Post);
promiseObj.promisifyAll(Post.prototype);

exports.Post = Post;