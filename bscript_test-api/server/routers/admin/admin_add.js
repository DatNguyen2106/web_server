const express = require('express');
const admin_add_router = express.Router();
const verifyTokenAdmin = require('../../middleware/verifyTokenAdmin');
const db = require('../../db/connectDB');
const io = require('../.././socketServer');
const bcrypt = require('bcrypt');
const moment = require('moment');
// api for add lecturer by id
const saltRounds = 10;
admin_add_router.post('/lecturer', verifyTokenAdmin, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    var role = req.role;
    var emailFormat = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
    var lecturerId;
    var title = (req.body.title === "" || req.body.title === undefined) ? null : req.body.title;
    var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
    var userName = req.body.username;
    var email;
    email = checkTypeToAdd(req.body.email, emailFormat);
    var supervisor = (req.body.supervisor === "" || req.body.supervisor === undefined) ? null : req.body.supervisor;
    // default maximumTheses
    var maximumTheses = 100000;
    var bio = (req.body.bio === "" || req.body.bio === undefined) ? 0 : req.body.bio;
    if (req.username) {
        if (role) {
            if (req.body.id === undefined || req.body.id === '') {
                res.status(500).send("Undefined id for add");
            } else if (typeof (req.body.id) != 'number') {
                res.status(500).send("Invalid Type for Id, need a number")
            }
            else {
                lecturerId = req.body.id;
                if (userName === null || userName === undefined || userName === "") {
                    res.status(500).send("need a valid user name");
                } else {
                    if (email === null || email === '') {
                        res.status(500).send("Unvalid email");
                    }
                    else {

                        const addQuery = "INSERT INTO lecturers (lecturer_id, lecturer_user_name, title, email, supervisor, signature, maximum_of_theses, bio) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
                        const addQueryParams = [lecturerId, userName, title, email, supervisor, signature, maximumTheses, bio];
                        const addQueryResults = await executeQuery(res, addQuery, addQueryParams);
                        if (addQueryResults) {

                            const role = req.role;
                            // default password = id of this user;
                            var password = JSON.stringify(lecturerId);
                            const roleOfUser = `["${supervisor}"]`;
                            const insertUserQuery = "INSERT INTO tbl_user (id, username, password, salt, role) VALUES (?, ?, ?, ?, ?)";
                            bcrypt.genSalt(saltRounds, function (err, salt) {
                                bcrypt.hash(password, salt, function (err, hash) {
                                    if (err) { res.send(err); }
                                    // Store hash in database here
                                    else {
                                        db.query(insertUserQuery, [lecturerId, userName, hash, salt, roleOfUser], (err, result) => {
                                            if (err) {
                                                console.log("Cannot Insert on tbl_user into database")
                                            }
                                            else res.json(result);
                                        })
                                    }
                                });
                            });
                            const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendParams = [`Update from ${req.userId} to ${req.userId}`, req.userId, req.userId, `insert new lecturer  ${lecturerId} successfully`];
                            const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                            const notificationSent = await getNotificationSent(res, req.userId);
                            const notificationReceived = await getNotificationReceived(res, req.userId);
                            const socket = await getSocketById(res, req.userId);
                            const socketId = socket[0].socket_id;
                            if (socketId === null || socketId === undefined) {
                                console.log("no socketId from database");
                            }
                            else { io.to(socketId).emit("notificationReceived", (notificationReceived)) }
                        } else { console.log("error") };

                    }
                }
            }
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})
admin_add_router.post('/student', verifyTokenAdmin, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    var role = req.role;
    var emailFormat = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
    var id;
    var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
    var userName = req.body.username;
    var intake = (req.body.intake === "" || req.body.intake === undefined) ? null : req.body.intake;
    var fullName = (req.body.fullname === "" || req.body.fullname === undefined) ? null : req.body.fullname;
    var ects = (req.body.ects === "" || req.body.ects === undefined) ? null : req.body.ects;
    var email;
    email = checkTypeToAdd(req.body.email, emailFormat);
    var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
    if (req.username) {
        if (role) {
            if (req.body.id === undefined || req.body.id === '') {
                res.status(500).send("Undefined id for add");
            } else if (typeof (req.body.id) != 'number') {
                res.status(500).send("Invalid Type for Id, need a number")
            }
            else {
                id = req.body.id;
                if (userName === null || userName === undefined || userName === "") {
                    res.status(500).send("need a valid user name");
                } else {
                    if (email === null || email === '') {
                        res.status(500).send("Unvalid email");
                    }
                    else {
                        const addQuery = "INSERT INTO students (student_id, student_user_name, fullname, intake, email, ects, signature) VALUES(?, ?, ?, ?, ?, ?, ?)";
                        const addQueryParams = [id, userName, fullName, intake, email, ects, signature];
                        const addQueryResults = await executeQuery(res, addQuery, addQueryParams);

                        if (addQueryResults) {
                            // default password = id of this user;
                            var password = JSON.stringify(id);
                            const roleOfUser = `["student"]`;
                            const insertUserQuery = "INSERT INTO tbl_user (id, username, password, salt, role) VALUES (?, ?, ?, ?, ?)";
                            bcrypt.genSalt(saltRounds, function (err, salt) {
                                bcrypt.hash(password, salt, function (err, hash) {
                                    if (err) { res.send(err); }
                                    // Store hash in database here
                                    else {
                                        db.query(insertUserQuery, [id, userName, hash, salt, roleOfUser], (err, result) => {
                                            if (err) {
                                                res.send("Cannot Insert on tbl_user into database")
                                            }
                                            else res.json(result);
                                        })
                                    }
                                });
                            });
                            const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendParams = [`Update from ${req.userId} to ${req.userId}`, req.userId, req.userId, `insert new student  ${id} successfully`];
                            const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                            const notificationReceived = await getNotificationReceived(res, req.userId);
                            const socket = await getSocketById(res, req.userId);
                            const socketId = socket[0].socket_id;
                            if (socketId === null || socketId === undefined) {
                                console.log("no socketId from database");
                            }
                            else { io.to(socketId).emit("notificationReceived", (notificationReceived)) }
                        } else { console.log("error") };
                    }
                }
            }
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})
admin_add_router.post('/thesis', verifyTokenAdmin, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    var role = req.role;
    var thesisTopic = (req.body.thePisTopic === "" || req.body.thesisTopic === undefined) ? null : req.body.thesisTopic;
    var thesisField = (req.body.thesisField === "" || req.body.thesisField === undefined) ? null : req.body.thesisField;
    var lecturer1_id = (req.body.lecturer1_id === "" || req.body.lecturer1_id === undefined) ? null : req.body.lecturer1_id;
    var lecturer2_id = (req.body.lecturer2_id === "" || req.body.lecturer2_id === undefined) ? null : req.body.lecturer2_id;
    var slotMaximum = (req.body.slotMaximum === "" || req.body.slotMaximum === undefined) ? null : req.body.slotMaximum;
    var currentTimeValue = moment().valueOf();
    if (req.username) {
        if (role && req.userId) {
            var thesisId = `${currentTimeValue}${lecturer1_id}`;
            thesisId = BigInt(thesisId);
            const insertThesesQuery = "call addNewThesis(?, ?, ?, ?, ?)";
            const queryParams = [thesisId, thesisTopic, thesisField, lecturer1_id, slotMaximum];
            const results = await executeQuery(res, insertThesesQuery, queryParams);
            const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
            const sendParams = [`admin add thesis`, req.userId, lecturer1_id, `The Thesis "${thesisTopic}" has been added to your list`];
            const notification = await sendNotification(res, sendNotificationQuery, sendParams);
            const notificationReceived = await getNotificationReceived(res, lecturer1_id);
            const socket = await getSocketById(res, lecturer1_id);
            const socketReceiverId = socket[0].socket_id;
            if (socketReceiverId === null || socketReceiverId === undefined) {
                console.log("no socketId from database");
            }
            else { io.to(socketReceiverId).emit("notificationReceived", (notificationReceived)) };
            res.send(results);
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
});
// admin_add_router.post('/signature', verifyTokenAdmin, async (req, res) =>{
//         // because of unique id value, so this api just returns 1 or no value.
//             var role = req.role;
//             var id;
//             var signature = req.params.signature;
//             if(req.username) {
//                 if(role){
//                     if(req.userId === undefined  || req.userId === ''){
//                         res.status(500).send("Undefined id for add");
//                     } 
//                     else {
//                         const insertSignatureQuery = "INSERT INTO admins(admin_id, signature) VALUES(?,?)";
//                         const insertSignatureQueryParams = [req.userId, signature];
//                         const results = await executeQuery(res, insertSignatureQuery, insertSignatureQueryParams);
//                         res.send(results);
//                     }
//                 }
//                 else res.status(405).send("You are not allowed to access, You are not admin")
//             }
//             else res.status(404).send("No user with that username");
// });

// use for email
function checkTypeToAdd(value, type) {
    if (value === "" || value === undefined) {
        return null;
    } else if (!value.toString().match(type)) {
        return '';
    }
    else { return value; }
}

const executeQuery = (res, query, queryParams) => {
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}
const getSocketById = (res, id) => {
    const query = "select socket_id from tbl_user where id = ?"
    const queryParams = [id];
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}
const getNotificationSent = (res, id) => {
    const query = "select * from notifications where sender = ?"
    const queryParams = [id];
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}
var sendNotification = (res, query, queryParams) => {
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}
const getNotificationReceived = (res, id) => {
    const query = "select * from notifications where receiver = ?"
    const queryParams = [id];
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}

// Exports cho biến admin_router
module.exports = admin_add_router;