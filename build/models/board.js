var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BoardSchema = new Schema({
    serialNumber: String,
    macAddress: String,
    dateBoardRegister: Date,
    dateUserRegister: Date,
    mainEmail: String,
    initialHydrometer: Number,
    peoplesInTheHouse: Number
});

module.exports = mongoose.model('Board', BoardSchema);  