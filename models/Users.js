const mongoose = require('mongoose')

const Schema = mongoose.Schema


const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    forgotPasswordToken:{
        type:String,
        default:null
    },
    forgotPasswordTokenTime:{
        type:String,
        default:null
    },
    userAddress:[
        {
            type:mongoose.Types.ObjectId,
            required:true,
            ref:'UserAddress'
        }
    ]
})

module.exports = mongoose.model('User',userSchema)