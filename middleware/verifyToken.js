
const jwt = require('jsonwebtoken')

const tokenVerify = (req,res,next) => {
    
    try{
        console.log(req.headers)
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            const error = new Error('The provide token is invalid')
            error.status = 500
            next(error)
        }
        const decodedToken = jwt.verify(token,'Dont dare to touch me')
        req.userData = {userId:decodedToken.userId,email:decodedToken.email}
        next()
    }
    catch(err){
        const error = new Error('Verifying token failed')
        error.status = 500
        next(error)
    }


}

module.exports = tokenVerify