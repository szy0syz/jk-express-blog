var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var format = require('date-format');

var commentSchema = new Schema({
    postId: Schema.Types.ObjectId,
    commentName: String,
    commentEmail: String,
    commentWebsite: String,
    commentContent: String,
    createDate: { type: String, default: format.asString('yyyy-MM-dd hh:mm',this.dft) }
});

exports.Comment = mongoose.model('commetns',commentSchema,'commetns');