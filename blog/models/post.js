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
    pv: { type: Number, default: 0 }
});


exports.Post = mongoose.model('posts',postSchema,'posts');