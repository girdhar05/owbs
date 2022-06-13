const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
    workerId: {
        type: mongoose.Types.ObjectId,
        ref: 'worker',
        require: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        require: true
    },
    createdDate: {
        type: Date,
        default: Date.now,
        require: true
    }
})

module.exports = mongoose.model('booking', bookingSchema)