const express = require('express')

const router = express.Router()

const userInfo = require('../Controllers/userInfo')
const tokenVerify = require('../middleware/verifyToken')

router.post('/AddAddress',tokenVerify,userInfo.adduserAddress)

router.get('/userAddress',tokenVerify,userInfo.getAllAddress)

module.exports = router