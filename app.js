const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


//local
const authRouter = require('./routes/authentication')
const userInfoRouter = require('./routes/userInfo')

// creating the server
const app = express()

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-with,Content-Type,Accept,Authorization')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    next()
})

app.use(bodyParser.json())

//authCalling
app.use('/authentication',authRouter)
app.use('/userInfo',userInfoRouter)

app.use((err,req,res,next) => {
    return res.status(err.status || 500).json({message:err.message || 'Something Went Wrong'})
})


mongoose.connect('mongodb+srv://RaghuKogilalaYas:x1RJRdGSd8nBhzfE@yastri.iqitn.mongodb.net/yastri?retryWrites=true&w=majority')
.then(result => {
    app.listen(8000)
})
.catch(err => {
    console.log("hello")
    console.log(err)
})

