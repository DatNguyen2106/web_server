const express = require('express');
const lecturer2_update_router = express.Router();
const db = require('../../db/connectDB');
const verifyTokenLecturer2 = require('../../middleware/verifyTokenLecturer2');
const moment = require('moment');
const io = require('../.././socketServer');

lecturer2_update_router.put('/assessmentBachelor', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber = req.body.matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var thesisTitle = (req.body.thesisTitle === "" || req.body.thesisTitle === undefined) ? null : req.body.thesisTitle;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ? null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ? null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_grade = (req.body.supervisor1_grade === "" || req.body.supervisor1_grade === undefined) ? null : req.body.supervisor1_grade;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_grade = (req.body.supervisor2_grade === "" || req.body.supervisor2_grade === undefined) ? null : req.body.supervisor2_grade;
        var assessmentThesis = (req.body.assessmentThesis === "" || req.body.assessmentThesis === undefined) ? null : req.body.assessmentThesis;
        var assessmentDate = (req.body.assessmentDate === "" || req.body.assessmentDate === undefined) ? null : req.body.assessmentDate;

        if (req.username && req.userId) {
            if (role) {
                studentId = req.body.studentId;
                const getBeforeAssessmentBachelorThesisQuery = "SELECT * FROM assessment_for_bachelor_thesis where student_id = ?";
                const getBeforeAssessmentBachelorThesisParams = [studentId];
                const getBeforeAssessmentBachelorThesisResults = await executeQuery(res, getBeforeAssessmentBachelorThesisQuery, getBeforeAssessmentBachelorThesisParams);
                const getBasicInfoLecturerByLecturerIdQuery = "call getBasicInfoLecturerByLecturerId(?)";
                const getBasicInfoLecturerByLecturerIdParams = [req.userId];
                const basicInfoLecturerResults = await executeQuery(res, getBasicInfoLecturerByLecturerIdQuery, getBasicInfoLecturerByLecturerIdParams);
                if (getBeforeAssessmentBachelorThesisResults === null || getBeforeAssessmentBachelorThesisResults === undefined) {
                    res.send("not found bachelor thesis results");
                }
                else {
                    const updateAssessmentBachelorThesisQuery = "UPDATE assessment_for_bachelor_thesis SET matriculation_number = ?, surname = ?, forename = ?, thesis_title = ?, thesis_type = ?, further_participants = ?, supervisor1_title = ?, supervisor1_grade = ?, supervisor2_title = ?, supervisor2_grade = ?, assessment_thesis = ?, assessment_date = ?, supervisor2_signature = ?, step = ? WHERE student_id = ?"
                    const updateAssessmentBachelorThesisParams = [matriculationNumber, surName, foreName, thesisTitle, thesisType, furtherParticipants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessmentThesis, assessmentDate, basicInfoLecturerResults[0][0].signature, 2, studentId];
                    const updateAssessmentBachelorThesisResults = await executeQuery(res, updateAssessmentBachelorThesisQuery, updateAssessmentBachelorThesisParams);
                }

                const lecturerTitle = basicInfoLecturerResults[0][0].title;

                const getExactThesisFromStudentIdQuery = "call getExactThesisFromStudentId(?)";
                const getExactThesisFromStudentParams = [studentId];
                const getExactThesisFromStudentResults = await executeQuery(res, getExactThesisFromStudentIdQuery, getExactThesisFromStudentParams);

                if (getExactThesisFromStudentResults[0]) {
                    if (getExactThesisFromStudentResults[0].studentId !== null && getExactThesisFromStudentResults[0][0].lecturer1_id !== null) {
                        const sendNotificationAnotherSupQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendNotificationAnotherSupParams = [`Lecturer2 update assessment bachelor`, req.userId, getExactThesisFromStudentResults[0][0].lecturer1_id, `${lecturerTitle} has completed assessment bachelor thesis form for the thesis "${getExactThesisFromStudentResults[0][0].thesis_topic}" for the student "${getExactThesisFromStudentResults[0][0].student_id}"`];
                        const sendNotificationAnotherSup = await sendNotification(res, sendNotificationAnotherSupQuery, sendNotificationAnotherSupParams);
                        const notificationReceived = await getNotificationReceived(res, getExactThesisFromStudentResults[0][0].lecturer1_id);

                        const socket = await getSocketById(res, getExactThesisFromStudentResults[0][0].lecturer1_id);
                        const socketId = socket[0].socket_id;
                        if (socketId === null || socketId === undefined) {
                        }
                        else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                        // admin notifications
                        const getAllAdmin = "call getAllAdmin()";
                        const getAllAdminResults = await executeQuery(res, getAllAdmin);
                        console.log(getAllAdminResults[0]);
                        for (let j = 0; j < getAllAdminResults[0].length; j++){
                            const sendNotificationForAdminQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationForAdminParams = [`Lecturer2 update assessment registration bachelor form` , req.userId, getAllAdminResults[0][j].id, `${lecturerTitle} has completed the assessment bachelor thesis from the thesis  "${getExactThesisFromStudentResults[0][0].thesis_topic}" for the student "${getExactThesisFromStudentResults[0][0].student_id}"`];
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


                res.send({ "result": "done" });
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1.1")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_update_router.put('/assessmentOralDefense', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber = req.body.matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var dateDefense = (req.body.dateDefense === "" || req.body.dateDefense === undefined) ? null : req.body.dateDefense;
        var placeDefense = (req.body.placeDefense === "" || req.body.placeDefense === undefined) ? null : req.body.placeDefense;
        var startDate = (req.body.startDate === "" || req.body.startDate === undefined) ? null : req.body.startDate;
        var finishDate = (req.body.finishDate === "" || req.body.finishDate === undefined) ? null : req.body.finishDate;
        var stateOfHealth = (req.body.stateOfHealth === "" || req.body.stateOfHealth === undefined) ? null : req.body.stateOfHealth;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_grade = (req.body.supervisor1_grade === "" || req.body.supervisor1_grade === undefined) ? null : req.body.supervisor1_grade;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_grade = (req.body.supervisor2_grade === "" || req.body.supervisor2_grade === undefined) ? null : req.body.supervisor2_grade;
        var record = (req.body.record === "" || req.body.record === undefined) ? null : req.body.record;
        var assessmentDate = (req.body.assessmentDate === "" || req.body.assessmentDate === undefined) ? null : req.body.assessmentDate;

        if (req.username && req.userId) {
            if (role) {
                studentId = req.body.studentId;
                const getBeforeAssessmentOralDefenseQuery = "SELECT * FROM assessment_for_oral_defense where student_id = ?";
                const getBeforeAssessmentOralDefenseParams = [studentId];
                const getBeforeAssessmentOralDefenseResults = await executeQuery(res, getBeforeAssessmentOralDefenseQuery, getBeforeAssessmentOralDefenseParams);
                const getBasicInfoLecturerByLecturerIdQuery = "call getBasicInfoLecturerByLecturerId(?)";
                const getBasicInfoLecturerByLecturerIdParams = [req.userId];
                const basicInfoLecturerResults = await executeQuery(res, getBasicInfoLecturerByLecturerIdQuery, getBasicInfoLecturerByLecturerIdParams);

                if (getBeforeAssessmentOralDefenseResults === null || getBeforeAssessmentOralDefenseResults === undefined) {
                    console.log("not found")
                }
                else {
                    const updateAssessmentOralDefenseQuery = "UPDATE assessment_for_oral_defense SET matriculation_number = ?, surname = ?, forename = ?, date_defense = ?, place_defense = ?, start_date = ?, finish_date = ?, state_of_health = ?, supervisor1_title = ?, supervisor1_grade = ?, supervisor2_title = ?, supervisor2_grade = ?, record = ?, assessment_date = ?, supervisor2_signature = ?, step = ? WHERE student_id = ?"
                    const updateAssessmentOralDefenseParams = [matriculationNumber, surName, foreName, dateDefense, placeDefense, startDate, finishDate, stateOfHealth, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, record, assessmentDate, basicInfoLecturerResults[0][0].signature, 2, studentId];
                    const updateAssessmentOralDefenseResults = await executeQuery(res, updateAssessmentOralDefenseQuery, updateAssessmentOralDefenseParams);
                }

                const lecturerTitle = basicInfoLecturerResults[0][0].title;

                const getExactThesisFromStudentIdQuery = "call getExactThesisFromStudentId(?)";
                const getExactThesisFromStudentParams = [studentId];
                const getExactThesisFromStudentResults = await executeQuery(res, getExactThesisFromStudentIdQuery, getExactThesisFromStudentParams);

                if (getExactThesisFromStudentResults[0]) {
                    if (getExactThesisFromStudentResults[0].studentId !== null && getExactThesisFromStudentResults[0][0].lecturer1_id !== null) {
                        const sendNotificationAnotherSupQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendNotificationAnotherSupParams = [`Lecturer2 update assessment oral defense`, req.userId, getExactThesisFromStudentResults[0][0].lecturer1_id, `${lecturerTitle} has completed assessment oral defense form for the thesis "${getExactThesisFromStudentResults[0][0].thesis_topic}" for the student "${getExactThesisFromStudentResults[0][0].student_id}"`];
                        const sendNotificationAnotherSup = await sendNotification(res, sendNotificationAnotherSupQuery, sendNotificationAnotherSupParams);
                        const notificationReceivedAnotherSup = await getNotificationReceived(res, getExactThesisFromStudentResults[0][0].lecturer1_id);
                        const socketSup = await getSocketById(res, getExactThesisFromStudentResults[0][0].lecturer1_id);
                        const socketSupId = socketSup[0].socket_id;
                        if (socketSup === null || socketSup === undefined) {
                        }
                        else { io.to(socketSupId).emit("notificationReceived", (notificationReceivedAnotherSup)) };
                        // admin notifications
                        const getAllAdmin = "call getAllAdmin()";
                        const getAllAdminResults = await executeQuery(res, getAllAdmin);
                        console.log(getAllAdminResults[0]);
                        for (let j = 0; j < getAllAdminResults[0].length; j++){
                            const sendNotificationForAdminQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendNotificationForAdminParams = [`Lecturer2 update assessment oral defense form` , req.userId, getAllAdminResults[0][j].id, `${lecturerTitle} has completed the assessment oral defense from the thesis  "${getExactThesisFromStudentResults[0][0].thesis_topic}" for the student "${getExactThesisFromStudentResults[0][0].student_id}"`];
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
                res.send({ "result": "done" });
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1.1")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_update_router.put('/account', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var title = (req.body.title === "" || req.body.title === undefined) ? null : req.body.title;
        var email = (req.body.email === "" || req.body.email === undefined) ? null : req.body.email;
        var maximum_of_theses = (req.body.maximum_of_theses === "" || req.body.maximum_of_theses === undefined) ? null : req.body.maximum_of_theses;
        var bio = (req.body.bio === "" || req.body.bio === undefined) ? null : req.body.bio;
        var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;

        if (req.username && req.userId) {
            if (role) {
                var lecturerId = req.userId;
                const updateAccountQuery = "UPDATE lecturers SET title = ?, email = ?, maximum_of_theses = ?, bio = ?, signature = ? where lecturer_id = ?";
                const updateAccountParams = [title, email, maximum_of_theses, bio, signature, lecturerId];
                const updateAccountResults = await executeQuery(res, updateAccountQuery, updateAccountParams);
                res.send(updateAccountResults);
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1.1")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_update_router.put('/signature', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    var role = req.role;
    var signature = req.body.signature;
    if (req.username) {
        if (role) {
            if (req.userId === undefined || req.userId === '') {
                res.status(500).send("Undefined id for add");
            }
            else {
                const updateSignatureQuery = "UPDATE lecturers SET signature = ? WHERE lecturer_id = ?";
                const updateSignatureQueryParams = [signature, req.userId];
                const results = await executeQuery(res, updateSignatureQuery, updateSignatureQueryParams);
                res.send(results);
            }
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
});
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
module.exports = lecturer2_update_router;
