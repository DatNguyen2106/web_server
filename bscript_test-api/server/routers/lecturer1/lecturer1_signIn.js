const { request } = require('express');
const express = require('express');
const lecturer1_signIn_router = express.Router();
const db = require('../../db/connectDB');
const getThesesLecturer1 = require('../../middleware/getThesesLecturer1');
const verifyTokenLecturer1 = require('../../middleware/verifyTokenLecturer1');
const io = require('../.././socketServer');

lecturer1_signIn_router.post('/registrationBachelorThesisAsSup1', verifyTokenLecturer1, async (req, res) => {
    try {
        var role = req.role;
        var studentId = (req.body.studentId === undefined || req.body.studentId === null || req.body.studentId === "") ? null : req.body.studentId;
        var confirmSignature = req.body.confirmSignature;
        if (req.username && req.userId) {
            if (role) {
                const getBasicInfoLecturerByLecturerIdQuery = "call getBasicInfoLecturerByLecturerId(?)";
                const getBasicInfoLecturerByLecturerIdParams = [req.userId];
                const basicInfoLecturerResults = await executeQuery(res, getBasicInfoLecturerByLecturerIdQuery, getBasicInfoLecturerByLecturerIdParams);
                const lecturerTitle = basicInfoLecturerResults[0][0].title;
                if (confirmSignature === true) {
                    const query = "UPDATE registrations_for_bachelor_thesis SET step = ? WHERE student_id = ?";
                    const queryParams = [2, studentId];
                    const result = await executeQuery(res, query, queryParams);

                    const insertSignatureToRegistrationBachelor = 'UPDATE registrations_for_bachelor_thesis SET supervisor1_signature = ? WHERE student_id = ?';
                    const insertSignatureToRegistrationBachelorParams = [basicInfoLecturerResults[0][0].signature, studentId];
                    const insertSignatureToRegistrationBachelorResults = await executeQuery(res, insertSignatureToRegistrationBachelor, insertSignatureToRegistrationBachelorParams);
                    const getExactThesisFromStudentIdQuery = "call getExactThesisFromStudentId(?)";
                    const getExactThesisFromStudentIdParams = [studentId];
                    const getExactThesisFromStudentIdResults = await executeQuery(res, getExactThesisFromStudentIdQuery, getExactThesisFromStudentIdParams);
                    console.log(getExactThesisFromStudentIdResults)
                    if (getExactThesisFromStudentIdResults[0]) {
                        if (getExactThesisFromStudentIdResults[0][0].studentId !== null && getExactThesisFromStudentIdResults[0][0].lecturer2_title !== null) {
                            const sendNotificationAnotherSupQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationAnotherSupParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].lecturer2_id, `${lecturerTitle} has signed the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}" from the student ${studentId}`];
                            const sendNotificationAnotherSup = await sendNotification(res, sendNotificationAnotherSupQuery, sendNotificationAnotherSupParams);

                            const notificationReceivedAnotherSup = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].lecturer2_id);
                            const socketSup = await getSocketById(res, req.userId);
                            const socketSupId = socketSup[0].socket_id;
                            if (socketSup === null || socketSup === undefined) {
                            }
                            else { io.to(socketSupId).emit("notificationReceived", (notificationReceivedAnotherSup)) };
                            const sendNotificationStudentQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationStudentParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].student_id, `${lecturerTitle} has signed the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}"`];
                            const sendNotificationStudent = await sendNotification(res, sendNotificationStudentQuery, sendNotificationStudentParams);
                            const notificationReceivedStudent = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudent = await getSocketById(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudentId = socketStudent[0].socket_id;
                            if (socketStudent === null || socketStudent === undefined) {
                            }
                            else { io.to(socketStudentId).emit("notificationReceived", (notificationReceivedStudent)) };
                        }
                    } else {getExactThesisFromStudentIdResults[0][0].lecturer2_title === null}{
                        console.log("no sup 2 for that student");
                    }

                    res.send(result);
                }
                else if (confirmSignature === false) {
                    const query = "UPDATE registrations_for_bachelor_thesis SET step = ? WHERE student_id = ?";
                    const queryParams = [0, studentId];
                    const result = await executeQuery(res, query, queryParams);

                    const getExactThesisFromStudentIdQuery = "call getExactThesisFromStudentId(?)";
                    const getExactThesisFromStudentIdParams = [studentId];
                    const getExactThesisFromStudentIdResults = await executeQuery(res, getExactThesisFromStudentIdQuery, getExactThesisFromStudentIdParams);
                    if (getExactThesisFromStudentIdResults[0]) {
                        if (getExactThesisFromStudentIdResults[0][0].studentId !== null && getExactThesisFromStudentIdResults[0][0].lecturer2_title !== null) {
                            const sendNotificationAnotherSupQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationAnotherSupParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].lecturer2_id, `${lecturerTitle} has rejected the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}" from the student ${studentId}`];
                            const sendNotificationAnotherSup = await sendNotification(res, sendNotificationAnotherSupQuery, sendNotificationAnotherSupParams);

                            const notificationReceivedAnotherSup = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].lecturer2_id);
                            const socketSup = await getSocketById(res, req.userId);
                            const socketSupId = socketSup[0].socket_id;
                            if (socketSup === null || socketSup === undefined) {
                            }
                            else { io.to(socketSupId).emit("notificationReceived", (notificationReceivedAnotherSup)) };
                            const sendNotificationStudentQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationStudentParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].student_id, `${lecturerTitle} has rejected the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}"`];
                            const sendNotificationStudent = await sendNotification(res, sendNotificationStudentQuery, sendNotificationStudentParams);
                            const notificationReceivedStudent = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudent = await getSocketById(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudentId = socketStudent[0].socket_id;
                            if (socketStudent === null || socketStudent === undefined) {
                            }
                            else { io.to(socketStudentId).emit("notificationReceived", (notificationReceivedStudent)) };
                        } else {getExactThesisFromStudentIdResults[0][0].lecturer2_title === null}{
                        console.log("no sup 2 for that student");
                        }
                    }
                    res.send(result);
                }
                else {
                    res.send("invalid confirm signature");
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})

lecturer1_signIn_router.post('/registrationBachelorThesisAsSup2', verifyTokenLecturer1, async (req, res) => {
    try {
        var role = req.role;
        var studentId = (req.body.studentId === undefined || req.body.studentId === null || req.body.studentId === "") ? null : req.body.studentId;
        var confirmSignature = req.body.confirmSignature;
        if (req.username && req.userId) {
            if (role) {
                const getBasicInfoLecturerByLecturerIdQuery = "call getBasicInfoLecturerByLecturerId(?)";
                const getBasicInfoLecturerByLecturerIdParams = [req.userId];
                const basicInfoLecturerResults = await executeQuery(res, getBasicInfoLecturerByLecturerIdQuery, getBasicInfoLecturerByLecturerIdParams);
                const lecturerTitle = basicInfoLecturerResults[0][0].title;
                if (confirmSignature === true) {
                    const changeStepRegistrationBachelorThesisQuery = "Update registrations_for_bachelor_thesis SET step = ? where student_id = ?";
                    const changeStepRegistrationBachelorThesisQueryParams = [3, studentId];
                    const changeStepRegistrationBachelorThesisResults = await executeQuery(res, changeStepRegistrationBachelorThesisQuery, changeStepRegistrationBachelorThesisQueryParams);

                    const getThesisIdByStudentIdQuery = " call getThesisIdByStudentId(?)";
                    const getThesisIdByStudentIdQueryParams = [studentId];
                    const getThesisIdByStudentIdResults = await executeQuery(res, getThesisIdByStudentIdQuery, getThesisIdByStudentIdQueryParams);
                    const thesisId = getThesisIdByStudentIdResults[0][0].thesis_id;

                    const getExactThesisFromStudentIdQuery = "call getExactThesisFromStudentId(?)";
                    const getExactThesisFromStudentIdParams = [studentId];
                    const getExactThesisFromStudentIdResults = await executeQuery(res, getExactThesisFromStudentIdQuery, getExactThesisFromStudentIdParams);

                    const insertSignatureToRegistrationBachelor = 'UPDATE registrations_for_bachelor_thesis SET supervisor2_signature = ? WHERE student_id = ?';
                    const insertSignatureToRegistrationBachelorParams = [basicInfoLecturerResults[0][0].signature, studentId];
                    const insertSignatureToRegistrationBachelorResults = await executeQuery(res, insertSignatureToRegistrationBachelor, insertSignatureToRegistrationBachelorParams);
                    if (getExactThesisFromStudentIdResults[0]) {
                        if (getExactThesisFromStudentIdResults[0][0].studentId !== null && getExactThesisFromStudentIdResults[0][0].lecturer1_title !== null) {
                            const sendNotificationAnotherSupQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationAnotherSupParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].lecturer1_id, `${lecturerTitle} has signed the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}" from the student ${studentId}`];
                            const sendNotificationAnotherSup = await sendNotification(res, sendNotificationAnotherSupQuery, sendNotificationAnotherSupParams);

                            const notificationReceivedAnotherSup = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].lecturer1_id);
                            const socketSup = await getSocketById(res, getExactThesisFromStudentIdResults[0][0].lecturer1_id);
                            const socketSupId = socketSup[0].socket_id;
                            if (socketSup === null || socketSup === undefined) {
                            }
                            else { io.to(socketSupId).emit("notificationReceived", (notificationReceivedAnotherSup)) };

                            const sendNotificationStudentQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationStudentParams = [`Lecturer sign-in registration bachelor`, req.userId, getExactThesisFromStudentIdResults[0][0].student_id, `${lecturerTitle} has signed the registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}"`];
                            const sendNotificationStudent = await sendNotification(res, sendNotificationStudentQuery, sendNotificationStudentParams);

                            const notificationReceivedStudent = await getNotificationReceived(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudent = await getSocketById(res, getExactThesisFromStudentIdResults[0][0].student_id);
                            const socketStudentId = socketStudent[0].socket_id;
                            if (socketStudent === null || socketStudent === undefined) {
                            }
                            else { io.to(socketStudentId).emit("notificationReceived", (notificationReceivedStudent)) };
                            // admin notifications
                            const getAllAdmin = "call getAllAdmin()";
                            const getAllAdminResults = await executeQuery(res, getAllAdmin);
                            console.log(getAllAdminResults[0]);
                            for (let j = 0; j < getAllAdminResults[0].length; j++){
                                const sendNotificationForAdminQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                const sendNotificationForAdminParams = [`Lecturer1 sign in registration bachelor thesis as sup 2` , req.userId, getAllAdminResults[0][j].id, `The registration bachelor thesis form for the thesis "${getExactThesisFromStudentIdResults[0][0].thesis_topic}" from the student ${getExactThesisFromStudentIdResults[0][0].student_id} has been completed`];
                                const sendNotificationForAdminResults = await executeQuery(res, sendNotificationForAdminQuery, sendNotificationForAdminParams);
                                let notificationReceivedAdmin = await getNotificationReceived(res, getAllAdminResults[0][j].id);
                                let adminSocket = await getSocketById(res, getAllAdminResults[0][j].id);
                                let adminSocketId = adminSocket[0].socket_id;
                                if(adminSocket === null || adminSocket === undefined){
                                    }
                                else { io.to(adminSocketId).emit("notificationReceived", (notificationReceivedAdmin))};
                            }
                        }
                    }
                    const changeStep3InThesesQuery = " call updateStep3OnThesesByThesisId(?)";
                    const changeStep3InThesesQueryParams = [thesisId];
                    const changeStep3InThesesResults = await executeQuery(res, changeStep3InThesesQuery, changeStep3InThesesQueryParams);
                    //final results
                    res.send(changeStep3InThesesResults);
                }
                else if (confirmSignature === false) {
                    // do something here 
                    const changeStepRegistrationBachelorThesisQuery = "Update registrations_for_bachelor_thesis SET step = ? where student_id = ?";
                    const changeStepRegistrationBachelorThesisQueryParams = [0, studentId];
                    const changeStepRegistrationBachelorThesisResults = await executeQuery(res, changeStepRegistrationBachelorThesisQuery, changeStepRegistrationBachelorThesisQueryParams);
                }
                else {
                    res.send("invalid confirmSignature")
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1")
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
module.exports = lecturer1_signIn_router;
