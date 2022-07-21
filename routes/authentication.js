const express = require('express')
const {check} = require('express-validator')

const authController = require('../Controllers/authentication')

const tokenVerify = require('../middleware/verifyToken')

const router = express.Router()

router.post('/signup',[
    check('email').isEmail()
    .withMessage('Please enter a valid email'),
    check('password').isLength({min:6}).withMessage('Password should be minimum 6 characters'),
    check('name').isLength({min:1}).withMessage('Name should not be empty'),
    check('lastname').isLength({min:1}).withMessage('Lastname is required')
],authController.signup)

router.get('/resendverificationmail/:email', authController.resendVerificationMail)

router.post('/login',[check('email').isEmail()
.withMessage('Please enter a valid email'),
check('password').isLength({min:6}).withMessage('Password should be minimum 6 characters')],authController.login)

router.get('/verify',tokenVerify,authController.verifyAccount)

router.get('/reset/:email',authController.getUserEmail)

router.get('/tokenverification/:email/:token',authController.verifyUserToken)

router.post('/forgotpassword',[check('password').custom((value,{req}) => {
    if(value !== req.body.confirmPassword){
        throw new Error('Password and Confirm Password are mis-matching')
    }
    return true
})],authController.ForgotPassword)

router.post('/changePassword',[
    check('oldPassword').custom((value,{req}) => {
        if(value === req.body.newpassword){
            throw new Error('your new password should not be same as old password')
        }
        return true
    }),
    check('newpassword').isLength({min:6}).withMessage('password should be minimum 6 characters'),
    check('confirm').custom((value,{req}) => {
        if(value !== req.body.newpassword){
            throw new Error('password mismatch')
        }
        return true
    })
],tokenVerify,authController.changePassword)

module.exports = router