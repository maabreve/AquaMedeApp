var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WaterSensorSchema = new Schema({
    boardId: String,
    timestamp: Date,
    liters: Number
});

module.exports = mongoose.model('WaterSensor', WaterSensorSchema);