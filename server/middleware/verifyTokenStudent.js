const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyTokenStudent = (req,res,next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);
    
    try {
        const decoded =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded);
        // req.role = JSON.parse(decoded.role);
        if(decoded.role.indexOf("student") > -1){
            req.userId = decoded.id;
            req.username = decoded.username;
            req.role = decoded.role;
            next();
        } 
        else {console.log("You are not student, cannot execute this API (checked in middleware)")}
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
}
module.exports = verifyTokenStudent;