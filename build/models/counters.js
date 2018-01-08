var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CountersSchema = new Schema({
    serialNumber: String, 
    diaryCounter: Number,
    monthlyCounter: Number
});

module.exports = mongoose.model('Counters', CountersSchema);