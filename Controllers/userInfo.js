const mongoose = require('mongoose')

//local
const Useraddress = require('../models/UserAddress')
const User = require('../models/Users')
const States = require('../models/States')

exports.adduserAddress = async (req,res,next) => {
    const {fullname,mobilenumber,flatno,area,towncity,landmark,pincode,state} = req.body
    const {userId} = req.userData
    let existingUser
    try{
        existingUser = await User.findById(userId)
    }
    catch(err){
        const error = new Error('Fetching user data went wrong')
        error.status = 500
        return next(error)
    }

    if(!existingUser){
        const error = new Error('User Info not found')
        error.status = 500
        return next(error)
    }


    let existingState
    try{
        existingState = await States.findOne({State:state})
    }
    
    catch(err){
        const error = new Error('Finding state went wrong')
        error.status = 500
        return next(error)
    }

    

    let userAddress

    try{
        const session = await mongoose.startSession()
        session.startTransaction()
        userAddress = new Useraddress({
            fullname,
            mobilenumber,
            flatno,
            area,
            towncity,
            landmark,
            pincode,
            state:existingState,
            user:existingUser
        })
        await userAddress.save({session:session})
        existingUser.userAddress.push(userAddress)
        await existingUser.save({session:session})
        await session.commitTransaction()

    }
    catch(err){
        console.log(err)
        const error = new Error('Saving User address went wrong, please try again later')
        error.status = 500
        return next(error)
    }

    res.status(201).json({message:userAddress.toObject({getters:true})})
    
}

exports.getAllAddress = async (req,res,next) => {
    
    const {userId} = req.userData
    let existingUser
    try{
        existingUser = await User.findById(userId)
    }
    catch(err){
        console.log(err)
        const error = new Error('Fetching user data went wrong')
        error.status = 500
        return next(error)
    }

    if(!existingUser){
        const error = new Error('User Info not found')
        error.status = 500
        return next(error)
    }
    let address
    try{
        address = await Useraddress.find({user:existingUser}).populate('state','-_id')
    }
    catch(err){
        const error = new Error('Retrieving address went wrong')
        error.status = 500
        return next(error)
    }

    if(!address.length){
        const error = new Error('No address found, please start adding address')
        error.status = 500
        return next(error)
    }
    res.status(200).json({address})
}