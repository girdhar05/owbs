const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    number: {
        type: String,
        require: true
    },
    fullAddress: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('user', userSchema);