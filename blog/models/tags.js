var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = new Schema({
    tagName: {
        type: String, 
        unique: true, //值唯一
        required: true //非空
    },
    tagCode: String,
    tagRemark: String,
    createDate: { type: Date, default: Date.now }
});

var Tag = mongoose.model('tags', tagSchema,'tags');
var promiseObj = require('bluebird');
promiseObj.promisifyAll(Tag);
promiseObj.promisifyAll(Tag.prototype);

exports.Tags = Tag;