const mongoose = require('mongoose')

const Schema = mongoose.Schema

const IndianStatesSchema = new Schema({
    State :{
        type:String
    }
})

module.exports = mongoose.model('UserState',IndianStatesSchema)