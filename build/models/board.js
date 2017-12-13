var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BoardSchema = new Schema({
    code: String,
    email: String,
    dateRegister: Date,
    initialRegister: Number,
    currentRegister: Number,
    peoplesInHouse: Number,
    saveTarget: Number
});

module.exports = mongoose.model('Board', BoardSchema);  