var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiaryFlowSchema = new Schema({
    boardSerialNumber: String,
    timestamp: Date,
    liters: Number
});

module.exports = mongoose.model('DiaryFlow', DiaryFlowSchema);