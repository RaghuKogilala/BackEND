const User = require('../models/Users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require('express-validator')

//local
const confirmation = require('../templates/confirmmail')
const ForgotPassword = require('../templates/ForgotPasswordMail')
const rverifyemail = require('../templates/rverifymail')

const transport = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key :'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'
    }
}))


exports.signup = async (req,res,next) => {
    const {email,password,name,lastname} = req.body 
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.status = 422
        return next(error)
    }
    let existingUser;
    try{
        existingUser = await User.findOne({email:email})
    }
    catch(err){
        const error = new Error("user finding went wrong, Please try again later")
        error.status = 404
        return next(error)
    }
    
    if(existingUser){
        const error = new Error("User already exist, please try to login")
        error.status = 404
        return next(error)
    }
    let hashedPassword
    try{
        hashedPassword = await bcrypt.hash(password,12)
    }
    catch(err){
        const error = new Error("password hashing wentg wrong, please try again")
        error.status = 500
        return next(error)
    }
    const user = new User({
        email,
        password:hashedPassword,
        lastname,
        name
    })
    

    try{
        await user.save()
        token =  jwt.sign({userId:user.id,email:user.email},'Dont dare to touch me',{expiresIn:'6h'})
        
        transport.sendMail({
            to:req.body.email,
            from:'raghu.91kogilala@gmail.com',
            subject:'Welcome to Yastri!',
            html:confirmation(token)

        })
    }

    catch(err){
        const error = new Error('user info creating went wrong')
        error.status = 500
        return next(error)
    }

    return res.json({message:"user created successfully",userInfo:user.toObject({getters:true}),token})
}

exports.resendVerificationMail = async (req,res,next) => {
    const email = req.params.email
    let existingUser
    try{
        existingUser = await User.findOne({email:email})
    }
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    if(!existingUser){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    if(existingUser.verified){
        const error = new Error('User account already verified')
        error.status = 422
        return next(error)
    }
    let token
    try{
        token = jwt.sign({userId:existingUser.id,email:existingUser.email},'Dont dare to touch me',{expiresIn:'6h'})
        transport.sendMail({
            to:email,
            from:'raghu.91kogilala@gmail.com',
            subject:'Verify Your Account',
            html:rverifyemail(token)
    })
    }
    catch(err){
        const error = new Error('user token creating went wrong')
        error.status = 500
        next(error)
    }

    res.json({message:"E-mail sent successfully"}).status(200)
    
}

exports.login = async (req,res,next) => {
    
    const {email,password} = req.body
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.status = 422
        return next(error)
    }
    let user
    try{
        user = await User.findOne({email:email})
    }
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    if(!user){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }

    if(!user.verified){
        const error = new Error('User not verified, Please verify your account')
        error.status = 500
        return next(error)
    }

    let passwordMatched

    try{
        passwordMatched = await bcrypt.compare(password,user.password)
    }
    catch(err){
        const error = new Error('user password matching failed,please try again later')
        error.status = 500
        return next(error)
    }
    console.log(passwordMatched)
    if(!passwordMatched){
        const error = new Error('password mismatch, please verify your passowrd')
        error.status = 500
        return next(error)
    }

    let token

    try{
        token =  jwt.sign({userId:user.id,email:user.email},'Dont dare to touch me',{expiresIn:'6h'})
    }

    catch(err){
        const error = new Error('loggin failed, please try again later')
        error.status = 500
        return next(error)
    }

    return res.json({userId:user.id,email:user.email,token:token,userName:user.name})

}

exports.verifyAccount = async (req,res,next) => {
    const {userId,email} = req.userData
    let existingUser
    try{
        existingUser = await User.findById(userId)
    }
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }

    existingUser.verified = true

    try{
        await existingUser.save()
    }

    catch(err){
        const error = new Error('User updating went wrong')
        error.status = 500
        return next(error)
    }

    return res.json({userInfo:existingUser.toObject({getters:true})})
}

exports.getUserEmail = async (req,res,next) => {
    const email = req.params.email
    let existingUser 
    try{
        existingUser = await User.findOne({email:email})
    } 
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    if(!existingUser){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    crypto.randomBytes(32, async (err,buffer) => {
        if(err){
            const error = new Error('creating token went wrong')
            error.status = 500
            return next(error)   
        }
        const token = buffer.toString('hex')
        existingUser.forgotPasswordToken = token
        existingUser.forgotPasswordTokenTime = (Date.now() + 3600000)
        console.log(token)
        try{
           await existingUser.save() 
           res.json({message:"E-mail sent successfully"})
           transport.sendMail({
            to:email,
            from:'raghu.91kogilala@gmail.com',
            subject:'Password Reset',
            html:ForgotPassword(email,token)

            })
        }
        catch(err){
            const error = new Error('Finding user went wrong')
            error.status = 500
            return next(error)
        }
    })

}



exports.verifyUserToken = async (req,res,next) => {
    const token = req.params.token
    const email = req.params.email

    let existingUser
    try{
        existingUser = await User.findOne({email:email,forgotPasswordToken:token,forgotPasswordTokenTime:{$gt:Date.now()}})
    }
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }
    if(!existingUser){
        const error = new Error('Token might have expired. Please request for another e-mail')
        error.status = 500
        return next(error)
    }

    return res.json({tokenVerified:true})

}

exports.ForgotPassword = async (req,res,next) => {
    const {email,password,confirmPassword} = req.body

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.status = 422
        return next(error)
    }

    let existingUser
    try{
        existingUser = await User.findOne({email:email})

    }
    catch(err){
        const error = new Error('Finding user went wrong')
        error.status = 500
        return next(error)
    }

    if(!existingUser){
        const error = new Error('User not found')
        error.status = 500
        return next(error)
    }

    let hashedPassword

    try{
        hashedPassword =  await bcrypt.hash(password,12)
    }
    catch(err){
        const error = new Error("password hashing wentg wrong, please try again")
        error.status = 500
        return next(error)
    }
    
    existingUser.password = hashedPassword
    existingUser.forgotPasswordToken = null
    existingUser.forgotPasswordTokenTime = null
    try{
        await existingUser.save()
    }
    catch(err){
        const error = new Error('Upadting Password went wrong')
        error.status = 500
        return next(error)
    }

    return res.json({message:"Password changed successfully"})
}

exports.changePassword = async (req,res,next) => {
    const {oldPassword,newpassword,confirm} = req.body
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error(errors.errors[0].msg)
        error.status = 422
        return next(error)
    }
    const email = req.userData.email
    let existingUser
    try{
        existingUser = await User.findOne({email:email})
    }
    catch(err){
        const error = new Error("user not found")
        error.status = 500
        return next(error)
    }
    if(!existingUser){
        const error = new Error("user not found")
        error.status = 500
        return next(error)
    }
    let passwordmatch
    try{
        passwordmatch = await bcrypt.compare(oldPassword,existingUser.password)
    }
    catch(err){
        const error = new Error("password matching not possible, please try again later")
        error.status = 500
        return next(error)
    }

    if(!passwordmatch){
        const error = new Error("user info mismatched, please verify your old password")
        error.status = 500
        return next(error)
    }
    let modifyPassword
    try{
        modifyPassword = await bcrypt.hash(newpassword,12)
    }
    catch(err){
        const error = new Error("password hashing went wrong")
        error.status = 500
        return next(error)
    }
    try{
        existingUser.password = modifyPassword
        existingUser.save()
    }
    catch(err){
        const error = new Error("unable to update password")
        error.status = 500
        return next(error)
    }

    return res.json({message:"password updated successfully"})


}