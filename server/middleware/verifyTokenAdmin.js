const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyTokenAdmin = (req,res,next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);
    
    try {
        console.log(process.env.ACCESS_TOKEN_SECRET);
        const decoded =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded);
        // req.role = JSON.parse(decoded.role);
        if(decoded.role.indexOf("admin") > -1){
            req.userId = decoded.id;
            req.username = decoded.username;
            req.role = decoded.role;
            next();
        } 
        else {console.log("You are not admin, cannot execute this API (checked in middleware)")}
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
}
module.exports = verifyTokenAdmin;