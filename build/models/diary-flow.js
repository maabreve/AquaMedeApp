var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiaryFlowSchema = new Schema({
    idLeitura: Number,
    idSensor: Number,
    vazaoInstantanea: Number,
    volumeTotalAcumulado: Number,
    volumeDiaAcumulado: Number,
    dataHora: Date
});

module.exports = mongoose.model('DiaryFlow', DiaryFlowSchema);