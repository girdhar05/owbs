const mongoose = require('mongoose');

let workerSchema = mongoose.Schema({
    worker_type: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('workerType', workerSchema)