const express = require('express');
const lecturer2_confirm_router = express.Router();
const db = require('../../db/connectDB');
const verifyTokenLecturer2 = require('../../middleware/verifyTokenLecturer2');
const io = require('../.././socketServer');

lecturer2_confirm_router.post('/confirmThesis', verifyTokenLecturer2, async (req, res) => {
    try {
        var role = req.role;
        var thesisId = (req.body.thesisId === undefined || req.body.thesisId === "" || req.body.thesisId === null) ? null : req.body.thesisId;
        var confirmThesis = (req.body.confirmThesis === undefined || req.body.confirmThesis === null || req.body.confirmThesis === "") ? false : req.body.confirmThesis;
        if (req.username && req.userId) {
            if (role) {
                const query = "UPDATE lecturers_theses SET confirm_sup2 = ? where thesis_id = ?";
                var queryParams;
                if (confirmThesis === true) {
                    queryParams = [true, thesisId];
                    const results = await executeQuery(res, query, queryParams);

                    const getThesesByThesisIdQuery = "call getThesesByThesisId(?)";
                    const getThesesByThesisIdParams = [thesisId];
                    const getThesesByThesisIdResults = await executeQuery(res, getThesesByThesisIdQuery, getThesesByThesisIdParams);

                    if (getThesesByThesisIdResults[0][0].lecturer1_id != null) {
                        const sendNotificationSup1Query = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendNotificationSup1Params = [`Lecturer2 accept thesis`, req.userId, getThesesByThesisIdResults[0][0].lecturer1_id, `${getThesesByThesisIdResults[0][0].lecturer2_title} has accepted to join your thesis "${getThesesByThesisIdResults[0][0].thesis_topic}"`];
                        const sendNotificationSup1 = await sendNotification(res, sendNotificationSup1Query, sendNotificationSup1Params);
                        const notificationSup1Received = await getNotificationReceived(res, getThesesByThesisIdResults[0][0].lecturer1_id);
                        const socket1 = await getSocketById(res, getThesesByThesisIdResults[0][0].lecturer1_id);
                        const socketReceiver1Id = socket1[0].socket_id;
                        if (socket1 === null || socket1 === undefined) {
                        }
                        else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationSup1Received)) };
                    }
                    if (getThesesByThesisIdResults) {
                        for (var i = 0; i < getThesesByThesisIdResults[0].length; i++) {
                            if (getThesesByThesisIdResults[0][i].lecturer1_id !== null) {
                                if (getThesesByThesisIdResults[0][i].student_id !== null) {
                                    const sendNotificationStudentQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                    const sendNotificationStudentParams = [`Lecturer2 accept thesis`, req.userId, getThesesByThesisIdResults[0][i].student_id, `${getThesesByThesisIdResults[0][i].lecturer2_title} has accepted to join your thesis "${getThesesByThesisIdResults[0][i].thesis_topic}"`];
                                    const sendNotificationStudent = await sendNotification(res, sendNotificationStudentQuery, sendNotificationStudentParams);

                                    const notificationStudentReceived = await getNotificationReceived(res, getThesesByThesisIdResults[0][i].student_id);
                                    const socketStudent = await getSocketById(res, getThesesByThesisIdResults[0][i].student_id);
                                    const socketStudentId = socketStudent[0].socket_id;
                                    if (socketStudent === null || socketStudent === undefined) {
                                    }
                                    else { io.to(socketStudentId).emit("notificationReceived", (notificationStudentReceived)) };
                                }
                                else {
                                    console.log("no student for thesis");
                                }
                            }
                        }
                    } else console.log("no thesis");
                    const changeStepQuery = "UPDATE theses SET step = ? where thesis_id = ?";
                    const changeStepQueryParams = [2, thesisId];
                    const changeStepResult = await executeQuery(res, changeStepQuery, changeStepQueryParams);
                    // admin notifications
                    const getAllAdmin = "call getAllAdmin()";
                    const getAllAdminResults = await executeQuery(res, getAllAdmin);
                    console.log(getAllAdminResults[0]);
                    for (let j = 0; j < getAllAdminResults[0].length; j++){
                        const sendNotificationForAdminQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendNotificationForAdminParams = [`Lecturer2 accept thesis` , req.userId, getAllAdminResults[0][j].id, `The thesis "${getThesesByThesisIdResults[0][0].thesis_topic}" has been ready to start`];
                        const sendNotificationForAdminResults = await executeQuery(res, sendNotificationForAdminQuery, sendNotificationForAdminParams);
                        let notificationReceivedAdmin = await getNotificationReceived(res, getAllAdminResults[0][j].id);
                        let adminSocket = await getSocketById(res, getAllAdminResults[0][j].id);
                        let adminSocketId = adminSocket[0].socket_id;
                        if(adminSocket === null || adminSocket === undefined){
                            }
                        else { io.to(adminSocketId).emit("notificationReceived", (notificationReceivedAdmin))};
                    }
                    res.send(changeStepResult);
                }
                else if (confirmThesis === false) {
                    queryParams = [false, thesisId];
                    const results = await executeQuery(res, query, queryParams);
                    const getThesesByThesisIdQuery = "call getThesesByThesisId(?)";
                    const getThesesByThesisIdParams = [thesisId];
                    const getThesesByThesisIdResults = await executeQuery(res, getThesesByThesisIdQuery, getThesesByThesisIdParams);

                    if (getThesesByThesisIdResults[0][0].lecturer1_id !== null) {
                        const sendNotificationSup1Query = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendNotificationSup1Params = [`Lecturer2 reject thesis`, req.userId, getThesesByThesisIdResults[0][0].lecturer1_id, `${getThesesByThesisIdResults[0][0].lecturer2_title} has rejected to join your thesis "${getThesesByThesisIdResults[0][0].thesis_topic}"`];
                        const sendNotificationSup1 = await sendNotification(res, sendNotificationSup1Query, sendNotificationSup1Params);
                        const notificationSup1Received = await getNotificationReceived(res, getThesesByThesisIdResults[0][0].lecturer1_id);
                        const socket1 = await getSocketById(res, getThesesByThesisIdResults[0][0].lecturer1_id);
                        const socketReceiver1Id = socket1[0].socket_id;
                        if (socket1 === null || socket1 === undefined) {
                        }
                        else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationSup1Received)) };
                    }
                    if (getThesesByThesisIdResults) {
                        for (var i = 0; i < getThesesByThesisIdResults[0].length; i++) {
                            if (getThesesByThesisIdResults[0][i].lecturer1_id) {
                                if (getThesesByThesisIdResults[0][i].student_id !== null) {
                                    const sendNotificationStudentQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                    const sendNotificationStudentParams = [`Lecturer2 reject thesis`, req.userId, getThesesByThesisIdResults[0][i].student_id, `${getThesesByThesisIdResults[0][i].lecturer2_title} has rejected to join your thesis "${getThesesByThesisIdResults[0][i].thesis_topic}"`];
                                    const sendNotificationStudent = await sendNotification(res, sendNotificationStudentQuery, sendNotificationStudentParams);
                                    const notificationStudentReceived = await getNotificationReceived(res, getThesesByThesisIdResults[0][i].student_id);
                                    const socketStudent = await getSocketById(res, getThesesByThesisIdResults[0][i].student_id);
                                    const socketStudentId = socketStudent[0].socket_id;
                                    if (socketStudent === null || socketStudent === undefined) {
                                    }
                                    else { io.to(socketStudentId).emit("notificationReceived", (notificationStudentReceived)) };
                                } else {
                                    console.log("no student for thesis");
                                }
                            }
                        }
                    } else console.log("no thesis");
                    const setNullLecturer2Query = "UPDATE lecturers_theses SET lecturer2 = NULL where thesis_id = ?";
                    const setNullLecturer2QueryParams = [thesisId];
                    const setNullLecturer2Results = await executeQuery(res, setNullLecturer2Query, setNullLecturer2QueryParams);

                    const changeStepQuery = "UPDATE theses SET step = ? where thesis_id = ?";
                    const changeStepQueryParams = [2, thesisId];
                    const changeStepResult = await executeQuery(res, changeStepQuery, changeStepQueryParams);

                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                    res.send(setNullLecturer2Results);
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer2")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})

const executeQuery = (res, query, queryParams) => {
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
module.exports = lecturer2_confirm_router;
