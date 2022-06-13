const mongoose = require('mongoose')

const workerSchema = mongoose.Schema({
    worker_name: {
        type: String,
        require: true
    },
    worker_age: {
        type: String,
        require: true
    },
    worker_number: {
        type: String,
        require: true
    },
    worker_image_url: {
        type: String,
        require: true
    },
    worker_address: {
        type: String,
        require: true
    },
    worker_type: {
        type: mongoose.Types.ObjectId,
        ref: 'workerType',
        require: true
    }
})

module.exports = mongoose.model('worker', workerSchema)