const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userAddressSchema = new Schema({
    fullname:{
        type:String,
        required:true
    },
    mobilenumber:{
        type:String,
        required:true
    },
    flatno:{
        type:String,
        required:true
    },
    area:{
        type:String,
        required:true
    },
    towncity:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    state:{
        type:mongoose.Types.ObjectId,
        ref:'UserState',
        required:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
})

module.exports = mongoose.model('UserAddress',userAddressSchema)