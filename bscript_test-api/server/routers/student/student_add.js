const express = require('express');
const student_add_router = express.Router();
const db = require('../../db/connectDB');
const io = require('../.././socketServer');

const verifyTokenStudent = require('../../middleware/verifyTokenStudent');
student_add_router.post('/confirmSup1', verifyTokenStudent, async (req, res) => {
    try {
        var role = req.role;
        var thesisId = (req.body.thesisId === null || req.body.thesisId === undefined) ? null : req.body.thesisId;
        var studentId;
        if (req.username && req.userId) {
            if (role) {
                if (req.userId === undefined || req.userId === '') {
                    res.status(500).send("Undefined id for update")
                }
                else {
                    studentId = req.userId;

                    const query = "INSERT INTO students_theses(student_id, thesis_id, confirm_sup1) VALUES (?,?,?)";
                    const queryParams = [studentId, thesisId, 0];
                    const results = await executeQuery(res, query, queryParams);

                    const getThesisInfoById = "call getThesisInfoById(?)";
                    const getThesisInfoByIdParams = [thesisId];
                    const getThesisInfoByIdResults = await executeQuery(res, getThesisInfoById, getThesisInfoByIdParams);

                    if (getThesisInfoByIdResults) {
                        for (var i = 0; i < getThesisInfoByIdResults[0].length; i++) {
                            if (getThesisInfoByIdResults[0][i].lecturer1_id !== null) {
                                socketReceiver1 = getThesisInfoByIdResults[0][i].lecturer1_id;
                                if (studentId === getThesisInfoByIdResults[0][i].student_id) {
                                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                    const sendParams = [`Student apply thesis`, req.userId, getThesisInfoByIdResults[0][i].lecturer1_id, `A Student ${studentId} applied to your thesis "${getThesisInfoByIdResults[0][i].thesis_topic}"`];
                                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                                    const notificationReceived = await getNotificationReceived(res, getThesisInfoByIdResults[0][i].lecturer1_id);
                                    const socketReceiver1 = await getSocketById(res, getThesisInfoByIdResults[0][i].lecturer1_id);

                                    if (socketReceiver1 === null || socketReceiver1 === undefined) {
                                    }
                                    else {
                                        io.to(socketReceiver1[0].socket_id).emit("notificationReceived", (notificationReceived))
                                    };
                                }
                            }
                        }
                    }

                    res.send(results);
                }
            }
            else res.status(405).send("You are not allowed to access, You are not student")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
    }

})
//test
student_add_router.post('/registrationBachelorThesis', verifyTokenStudent, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var dateOfBirth = (req.body.dateOfBirth === "" || req.body.dateOfBirth === undefined) ? null : req.body.dateOfBirth;
        var placeOfBirth = (req.body.placeOfBirth === "" || req.body.placeOfBirth === undefined) ? null : req.body.placeOfBirth;
        var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
        var student_date = (req.body.student_date === "" || req.body.student_date === undefined) ? null : req.body.student_date;
        var titleBachelorThesis = (req.body.titleBachelorThesis === "" || req.body.titleBachelorThesis === undefined) ? null : req.body.titleBachelorThesis;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ? null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ? null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_signature = (req.body.supervisor1_signature === "" || req.body.supervisor1_signature === undefined) ? null : req.body.signature;
        var supervisor1_date = (req.body.supervisor1_date === "" || req.body.supervisor1_date === undefined) ? null : req.body.supervisor1_date;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_signature = (req.body.supervisor2_signature === "" || req.body.supervisor2_signature === undefined) ? null : req.body.supervisor2_signature;
        var supervisor2_date = (req.body.supervisor2_date === "" || req.body.supervisor2_date === undefined) ? null : req.body.supervisor2_date;
        var issued = (req.body.issued === "" || req.body.issued === undefined) ? null : req.body.issued;
        var deadlineCopy = (req.body.deadlineCopy === "" || req.body.deadlineCopy === undefined) ? null : req.body.deadlineCopy;
        var extensionGranted = (req.body.extensionGranted === "" || req.body.extensionGranted === undefined) ? null : req.body.extensionGranted;
        var chairmanOfExamination = (req.body.chairmanOfExamination === "" || req.body.chairmanOfExamination === undefined) ? null : req.body.chairmanOfExamination;
        var dateOfIssue = (req.body.dateOfIssue === "" || req.body.dateOfIssue === undefined) ? null : req.body.dateOfIssue;
        if (req.username) {
            if (role) {
                if (req.body.matriculationNumber === undefined || req.body.matriculationNumber === '') {
                    res.status(500).send("Undefined matriculation number for add");
                } else if (typeof (req.body.matriculationNumber) != 'number') {
                    res.status(500).send("Invalid Type for matriculation number, need a number")
                }
                else {
                    matriculationNumber = req.body.matriculationNumber;
                    if (req.userId === undefined || req.userId === '') {
                        res.status(500).send("Undefined id for add")
                    }
                    else if (typeof (req.userId) != 'number') {
                        res.status(500).send("Invalid Type for id, need a number")
                    }
                    else {
                        studentId = req.userId;
                        var query = "INSERT INTO registrations_for_bachelor_thesis (student_id, matriculation_number, surname, forename, date_of_birth, place_of_birth , signature, student_date, title_bachelor_thesis, thesis_type, further_participants, supervisor1_title, supervisor1_signature, supervisor1_date, supervisor2_title, supervisor2_signature, supervisor2_date, issued , deadline_copy, extension_granted, chairman_of_examination ,date_of_issue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                        var queryParams = [studentId, matriculationNumber, surName, foreName, dateOfBirth, placeOfBirth, signature, student_date, titleBachelorThesis, thesisType, furtherParticipants, supervisor1_title, supervisor1_signature, supervisor1_date, supervisor2_title, supervisor2_signature, supervisor2_date, issued, deadlineCopy, extensionGranted, chairmanOfExamination, dateOfIssue]
                        var dbResults = await executeQuery(res, query, queryParams);
                        res.send("done");
                    }
                }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
    }

})
student_add_router.post('/registrationOralDefense', verifyTokenStudent, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var spectatorsPresent = (req.body.spectatorsPresent === "" || req.body.spectatorsPresent === undefined) ? null : req.body.spectatorsPresent;
        var weekDate = (req.body.weekDate === "" || req.body.weekDate === undefined) ? null : req.body.weekDate;
        var proposedDate = (req.body.proposedDate === "" || req.body.proposedDate === undefined) ? null : req.body.proposedDate;
        var proposedTime = (req.body.proposedTime === "" || req.body.proposedTime === undefined) ? null : req.body.proposedTime;
        var room = (req.body.room === "" || req.body.room === undefined) ? null : req.body.room;
        var concernedAgreed = (req.body.concernedAgreed === "" || req.body.concernedAgreed === undefined) ? null : req.body.concernedAgreed;
        var dateReceive = (req.body.dateReceive === "" || req.body.dateReceive === undefined) ? null : req.body.dateReceive;
        var dateSubmission = (req.body.dateSubmission === "" || req.body.dateSubmission === undefined) ? null : req.body.dateSubmission;
        if (req.username) {
            if (role) {
                if (req.body.matriculationNumber === undefined || req.body.matriculationNumber === '') {
                    res.status(500).send("Undefined matriculation number for add");
                } else if (typeof (req.body.matriculationNumber) != 'number') {
                    res.status(500).send("Invalid Type for matriculation number, need a number")
                }
                else {
                    matriculationNumber = req.body.matriculationNumber;
                    if (req.body.studentId === undefined || req.body.studentId === '') {
                        res.status(500).send("Undefined id for add")
                    }
                    else if (typeof (req.body.studentId) != 'number') {
                        res.status(500).send("Invalid Type for id, need a number")
                    }
                    else {
                        studentId = req.body.studentId;
                        var query = "INSERT INTO registrations_for_oral_defense (student_id, matriculation_number, surname, forename, supervisor1_title, supervisor2_title, spectators_present, weekdate, proposed_date, proposed_time, room, concerned_agreed, date_receive, date_submission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                        var queryParams = [studentId, matriculationNumber, surName, foreName, supervisor1_title, supervisor2_title, spectatorsPresent, weekDate, proposedDate, proposedTime, room, concernedAgreed, dateReceive, dateSubmission]
                        var dbResults = await executeQuery(res, query, queryParams);
                        res.send("done");
                    }
                }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
    }

})

student_add_router.post('/assessmentOralDefense', verifyTokenStudent, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
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
        var supervisor1_signature = (req.body.supervisor1_signature === "" || req.body.supervisor1_signature === undefined) ? null : req.body.supervisor1_signature;
        var supervisor2_signature = (req.body.supervisor2_signature === "" || req.body.supervisor2_signature === undefined) ? null : req.body.supervisor1_signature;

        if (req.username) {
            if (role) {
                if (req.body.matriculationNumber === undefined || req.body.matriculationNumber === '') {
                    res.status(500).send("Undefined matriculation number for add");
                } else if (typeof (req.body.matriculationNumber) != 'number') {
                    res.status(500).send("Invalid Type for matriculation number, need a number")
                }
                else {
                    matriculationNumber = req.body.matriculationNumber;
                    if (req.body.studentId === undefined || req.body.studentId === '') {
                        res.status(500).send("Undefined id for add")
                    }
                    else if (typeof (req.body.studentId) != 'number') {
                        res.status(500).send("Invalid Type for id, need a number")
                    }
                    else {
                        studentId = req.body.studentId;
                        var query = "INSERT INTO assessment_for_oral_defense (student_id, matriculation_number, surname, forename, date_defense, place_defense, start_date, finish_date, state_of_health, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, record, assessment_date, supervisor1_signature, supervisor2_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                        var queryParams = [studentId, matriculationNumber, surName, foreName, dateDefense, placeDefense, startDate, finishDate, stateOfHealth, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, record, assessmentDate, supervisor1_signature, supervisor2_signature]
                        var dbResults = await executeQuery(res, query, queryParams);
                        res.send("done");
                    }
                }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
    }

})
student_add_router.post('/assessmentBachelorThesis', verifyTokenStudent, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ? null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ? null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_grade === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_grade = (req.body.supervisor1_grade === "" || req.body.supervisor1_signature === undefined) ? null : req.body.supervisor1_grade;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_grade = (req.body.supervisor2_grade === "" || req.body.supervisor2_grade === undefined) ? null : req.body.supervisor2_grade;
        var assessmentThesis = (req.body.assessmentThesis === "" || req.body.assessmentThesis === undefined) ? null : req.body.assessmentThesis;
        var assessmentDate = (req.body.assessmentDate === "" || req.body.assessmentDate === undefined) ? null : req.body.assessmentDate;
        var supervisor1_signature = (req.body.supervisor1_signature === "" || req.body.supervisor1_signature === undefined) ? null : req.body.supervisor1_signature;
        var supervisor2_signature = (req.body.supervisor2_signature === "" || req.body.supervisor2_signature === undefined) ? null : req.body.supervisor2_signature;

        if (req.username) {
            if (role) {
                if (req.body.matriculationNumber === undefined || req.body.matriculationNumber === '') {
                    res.status(500).send("Undefined matriculation number for add");
                } else if (typeof (req.body.matriculationNumber) != 'number') {
                    res.status(500).send("Invalid Type for matriculation number, need a number")
                }
                else {
                    matriculationNumber = req.body.matriculationNumber;
                    if (req.body.studentId === undefined || req.body.studentId === '') {
                        res.status(500).send("Undefined id for add")
                    }
                    else if (typeof (req.body.studentId) != 'number') {
                        res.status(500).send("Invalid Type for id, need a number")
                    }
                    else {
                        studentId = req.body.studentId;
                        var query = "INSERT INTO assessment_for_bachelor_thesis(student_id, matriculation_number, surname, forename, thesis_type, further_participants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessment_thesis, assessment_date, supervisor1_signature, supervisor2_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                        var queryParams = [studentId, matriculationNumber, surName, foreName, thesisType, furtherParticipants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessmentThesis, assessmentDate, supervisor1_signature, supervisor2_signature]
                        var dbResults = await executeQuery(res, query, queryParams);
                        res.send("done");
                    }
                }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
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
const findSocketIdByLecturerId = (res, id) => {
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
module.exports = student_add_router;
