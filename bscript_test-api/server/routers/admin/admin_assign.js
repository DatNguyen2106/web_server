const express = require('express');
const admin_assign_router = express.Router();
const verifyTokenAdmin = require('../../middleware/verifyTokenAdmin');
const db = require('../../db/connectDB');
const io = require('../.././socketServer');
const { reset } = require('nodemon');

admin_assign_router.post('/lecturerToThesis', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var lecturerId = (req.body.lecturerId === "" || req.body.lecturerId === undefined) ? null : req.body.lecturerId;
    var thesisId = (req.body.thesisId === "" || req.body.thesisId === undefined) ? null : req.body.thesisId;
    var lecturer2 = (req.body.lecturer2 === "" || req.body.lecturer2 === undefined) ? null : req.body.lecturer2;

    if (req.username) {
        if (role) {
            const query = "INSERT INTO lecturers_theses (lecturer_id, thesis_id,lecturer2) VALUES (?,?,?)";
            const queryParams = [lecturerId, thesisId, lecturer2];
            const dbResults = await executeQuery(res, query, queryParams);

            const getThesisInfoQuery = "call getThesisInfoById(?)";
            const getThesisIdQueryParams = [thesisId];
            const getThesisInfoResults = await executeQuery(res, getThesisInfoQuery, getThesisIdQueryParams);

            var receiverArray = [req.userId, lecturerId, lecturer2, getThesisInfoResults[0][0].student_id];
            for (var i = 0; i < receiverArray.length; i++) {
                if (receiverArray[i] !== null) {
                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${receiverArray[i]}`, req.userId, receiverArray[i], `assign lecturer1 : ${lecturerId} and lecturer2 : ${lecturer2} into thesis ${thesisId} successfully`];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                }
            }

        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})

admin_assign_router.post('/studentToThesis', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var studentId = (req.body.studentId === "" || req.body.studentId === undefined) ? null : req.body.studentId;
    var thesisId = (req.body.thesisId === "" || req.body.thesisId === undefined) ? null : req.body.thesisId;

    if (req.username) {
        if (role) {
            const query = "INSERT INTO students_theses (student_id, thesis_id) VALUES (?,?)";
            const queryParams = [studentId, thesisId];
            const dbResults = await executeQuery(res, query, queryParams);
            const getThesisInfoQuery = "call getThesisInfoById(?)";
            const getThesisIdQueryParams = [thesisId];
            const getThesisInfoResults = await executeQuery(res, getThesisInfoQuery, getThesisIdQueryParams);

            var receiverArray = [req.userId, getThesisInfoResults[0][0].lecturer1_id, getThesisInfoResults[0][0].lecturer2_id, studentId];
            for (var i = 0; i < receiverArray.length; i++) {
                if (receiverArray[i] !== null) {
                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${receiverArray[i]} this API: studentToThesis`, req.userId, receiverArray[i], `assign student ${studentId} into thesis ${thesisId} successfully`];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                }
            }
            res.send(dbResults);
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
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
module.exports = admin_assign_router;
