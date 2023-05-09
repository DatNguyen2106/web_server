require('dotenv').config();
require('./prototype.js');
const db = require('./db/connectDB.js')
// const bcrypt = require('bcrypt');
const express = require('express');
const verifyToken = require('./middleware/auth');
const cors = require('cors');
const app = express();
const adminRoute = require('./routers/admin');
const studentRoute = require('./routers/student')
const lecturer1Route = require('./routers/lecturer1');
const lecturer2Route = require('./routers/lecturer2');
const bodyParser = require('body-parser');
app.use(cors());
app.use(express.json({ limit: '50mb' })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit : '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// Dùng userRoute cho tất cả các route bắt đầu bằng '/users'
app.use('/admin', adminRoute);
app.use('/student', studentRoute);
app.use('/lecturer1', lecturer1Route);
app.use('/lecturer2', lecturer2Route);
app.get('/getNotifications', verifyToken, async (req, res) =>{
    // because of unique id value, so this api just returns 1 or no value.
        try {
            var role = req.role;
            if(req.username){
                var id = req.userId;
                const query = "SELECT * FROM notifications WHERE receiver = ?";
                const queryParams = [id];
                const dbResults = await executeQuery(res, query, queryParams); 
                res.send(dbResults);
                // for (let i = 0; i < dbResults.length; i++){
                //     res.send({
                //         "notificationId" : dbResults[i].notification_id,
                //         "title" : dbResults[i].title12,
                //         "author" : dbResults[i].author,
                //         "content" : dbResults[i].content,
                //         "createAt" : dbResults[i].created_at,
                //         })
                //     }
            }
        } catch (error) {
            console.log(error.message);
            res.status(404).send("You got an error" + error.message);
        }
        
    })

const executeQuery = (res, query, queryParams) => {
    const results =  new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if(err) {res.status(500).send(err.message)}
            else
            {  resolve(JSON.parse(JSON.stringify(result)))}
        })
        })
    return results;
}
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`running on port ${PORT}`));
