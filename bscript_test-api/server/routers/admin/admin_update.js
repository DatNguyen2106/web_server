const express = require('express');
const admin_update_router = express.Router();
const verifyTokenAdmin = require('../../middleware/verifyTokenAdmin');
const verifyToken = require('../../middleware/verifyTokenAdmin');
const db = require('../../db/connectDB');
const io = require('../.././socketServer');
admin_update_router.put('/lecturer/:id', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var emailFormat = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
    var paramId;
    var userName = req.body.username;
    var bio = (req.body.bio === "" || req.body.bio === bio) ? null : req.body.bio;
    var title = (req.body.title === "" || req.body.title === undefined) ? null : req.body.title;
    var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
    var email;
    email = checkTypeToUpdate(req.body.email, emailFormat);
    var supervisor = (req.body.supervisor === "" || req.body.supervisor === undefined) ? null : req.body.supervisor;
    var maximumTheses = (req.body.maximumTheses === "" || req.body.maximumTheses === undefined) ? 0 : req.body.maximumTheses;
    if (req.username) {
        if (role) {
            if (req.params.id === undefined || req.params.id === "") {
                res.status(404).send("Invalid username with that id")
            } else if (!(req.params.id)) {
                res.status(404).send("Need a number Parameter Id");
            } else {
                paramId = req.params.id;
                if (userName === null || userName === undefined || userName === "") {
                    res.status(404).send("need a valid user name");
                }
                else {
                    if (email === null || email === '') {
                        res.status(404).send("unvalid email with that");
                    }
                    else {
                        const updateQuery = "UPDATE lecturers SET lecturer_user_name = ? , title = ?, email = ? , supervisor = ?, signature = ?, maximum_of_theses = ?, bio = ? WHERE  lecturer_id = ?";
                        const queryParams = [userName, title, email, supervisor, signature, maximumTheses, bio, paramId]
                        const results = await executeQuery(res, updateQuery, queryParams);
                        const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendParams = [`Admin update lecturer`, req.userId, req.params.id, "Admin has updated your account's information"];
                        const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                        const notificationReceived = await getNotificationReceived(res, req.params.id);
                        const socket1 = await getSocketById(res, req.params.id);
                        const socketReceiver1Id = socket1[0].socket_id;

                        if (socket1 === null || socket1 === undefined) {
                            console.log("no socketId from database");
                        }
                        else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                        res.send(results);
                    }
                }
            }

        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})



admin_update_router.put('/student/:id', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var emailFormat = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
    var paramId;
    var userName = req.body.username;
    var fullName = (req.body.fullname === "" || req.body.fullname === undefined) ? null : req.body.fullname;
    var intake = (req.body.intake === "" || req.body.intake === undefined) ? null : req.body.intake;
    var ects = (req.body.ects === "" || req.body.ects === undefined) ? null : req.body.ects;
    var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
    var email;
    email = checkTypeToUpdate(req.body.email, emailFormat);
    if (req.username) {
        if (role) {
            if (req.params.id === undefined || req.params.id === "") {
                res.status(404).send("Invalid username with that id")
            } else if (!(req.params.id)) {
                res.status(404).send("Need a number Parameter Id");
            } else {
                paramId = req.params.id;
                if (userName === null || userName === undefined || userName === "") {
                    res.status(404).send("need a valid user name");
                }
                else {
                    if (email === null || email === '') {
                        res.status(404).send("unvalid email with that");
                    }
                    else {
                        var updateQuery = "UPDATE students SET student_user_name = ? , fullname = ? , intake = ?, email = ? , ects = ?, signature = ? WHERE student_id = ?";
                        const results = await new Promise((resolve) => {
                            db.query(updateQuery, [userName, fullName, intake, email, ects, signature, paramId], (err, result) => {
                                if (err) { res.status(500).send(err.message); }
                                else { resolve(JSON.parse(JSON.stringify(result))) }
                            })
                        })
                        const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                        const sendParams = [`Admin update student`, req.userId, req.params.id, "An admin has updated your account's information"];
                        const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                        const notificationReceived = await getNotificationReceived(res, req.params.id);
                        const socket1 = await getSocketById(res, req.params.id);
                        const socketReceiver1Id = socket1[0].socket_id;
                        if (socket1 === null || socket1 === undefined) {
                        }
                        else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                        res.send(results);
                    }
                }
            }

        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})

admin_update_router.put('/thesis/:thesisId', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    const dateFormat = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    var thesisTopic = (req.body.thesisTopic === "" || req.body.thesisTopic === undefined) ? null : (req.body.thesisTopic);
    var thesisField = (req.body.thesisField === "" || req.body.thesisField === undefined) ? null : (req.body.thesisField);
    var activateRegistration = (req.body.activateRegistration === undefined || req.body.activateRegistration === null || req.body.activateRegistration === "") ? false : (req.body.activateRegistration);
    var activateDefense = (req.body.activateDefense === "" || req.body.activateDefense === undefined || req.body.activateDefense === "") ? false : req.body.activateDefense;
    var numberOfHardCopies = (req.body.numberOfHardCopies === "" || req.body.numberOfHardCopies === undefined) ? null : req.body.numberOfHardCopies;
    var printRequirements = (req.body.printRequirements === undefined || req.body.printRequirements === null) ? null : req.body.printRequirements;
    var templateFiles = (req.body.templateFiles === undefined || req.body.templateFiles === null) ? null : (req.body.templateFiles);
    var submissionDeadline = (req.body.submissionDeadline === undefined || req.body.submissionDeadline === null || req.body.submissionDeadline === "") ? null : (req.body.submissionDeadline);
    if (req.username) {
        if (role) {
            if (req.params.thesisId === undefined || req.params.thesisId === "") {
                res.status(404).send("Invalid username with that id")
            } else if (!(req.params.thesisId)) {
                res.status(404).send("Need a number Parameter Id");
            } else {
                paramId = req.params.thesisId;
                const getThesisInfoQuery = "call getThesisInfoById(?)";
                const getThesisInfoQueryParams = [paramId];
                const getThesisInfoQueryResults = await executeQuery(res, getThesisInfoQuery, getThesisInfoQueryParams);
                if (getThesisInfoQueryResults) {
                    if ((getThesisInfoQueryResults[0][0].submissionDeadline === null || getThesisInfoQueryResults[0][0].submissionDeadline === undefined) && submissionDeadline !== null) {
                        // set step thesis = 4
                        const updateThesisQuery = "UPDATE theses SET thesis_topic = ?, thesis_field = ?, activate_registration = ?, activate_defense = ?, number_hard_copies = ?, print_requirements = ?, template_files = ?, submission_deadline = ?, step = ? where thesis_id = ?"
                        const queryParams = [thesisTopic, thesisField, activateRegistration, activateDefense, numberOfHardCopies, printRequirements, templateFiles, submissionDeadline, 4, paramId];
                        const results = await executeQuery(res, updateThesisQuery, queryParams);
                    }
                    // submissionDeadline = null, we do later.
                    else {
                        const updateThesisQuery = "UPDATE theses SET thesis_topic = ?, thesis_field = ?, activate_registration = ?, activate_defense = ?, number_hard_copies = ?, print_requirements = ?, template_files = ?, submission_deadline = ? where thesis_id = ?"
                        const queryParams = [thesisTopic, thesisField, activateRegistration, activateDefense, numberOfHardCopies, printRequirements, templateFiles, null, paramId];
                        const results = await executeQuery(res, updateThesisQuery, queryParams);
                    }

                    if (getThesisInfoQueryResults[0][0].activate_registration === 0 && activateRegistration === true) {
                        for (var i = 0; i < getThesisInfoQueryResults[0].length; i++) {
                            var insertRegistrationBachelorQuery = "INSERT INTO registrations_for_bachelor_thesis(student_id, step) VALUES (?,?)";
                            var insertRegistrationBachelorQueryParams = [getThesisInfoQueryResults[0][i].student_id, 0];
                            var insertRegistrationBachelorQueryResults = await executeQuery(res, insertRegistrationBachelorQuery, insertRegistrationBachelorQueryParams)
                        }
                    }
                    // activate Registration = false
                    else {

                    }
                    if (getThesisInfoQueryResults[0][0].activate_defense === 0 && activateDefense === true) {
                        for (var i = 0; i < getThesisInfoQueryResults[0].length; i++) {
                            var insertRegistrationDefenseQuery = "INSERT INTO registrations_for_oral_defense(student_id, step) VALUES (?,?)";
                            var insertRegistrationDefenseQueryParams = [getThesisInfoQueryResults[0][i].student_id, 0];
                            var insertRegistrationDefenseQueryResults = await executeQuery(res, insertRegistrationDefenseQuery, insertRegistrationDefenseQueryParams)

                        }
                    }
                    // activate defense = false
                    else {

                    }
                    for (var i = 0; i < getThesisInfoQueryResults[0].length; i++) {
                        if (getThesisInfoQueryResults[0][i].lecturer1_id !== null) {
                            if (getThesisInfoQueryResults[0][i].student_id !== null) {
                                const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                const sendParams = [`Admin update thesis`, req.userId, getThesisInfoQueryResults[0][i].lecturer1_id, `An admin has updated the information of your thesis "${thesisTopic}" with the student id "${getThesisInfoQueryResults[0][i].student_id}"`];
                                const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                                const notificationReceived = await getNotificationReceived(res, getThesisInfoQueryResults[0][i].lecturer1_id);
                                //lecturer 1
                                const socket1 = await getSocketById(res, getThesisInfoQueryResults[0][i].lecturer1_id);
                                const socketReceiver1Id = socket1[0].socket_id;

                                if (socketReceiver1Id === null || socketReceiver1Id === undefined) {
                                }
                                else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };

                            } else {
                                const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                const sendParams = [`Admin update thesis`, req.userId, getThesisInfoQueryResults[0][i].lecturer1_id, `An admin has updated the information of your thesis "${thesisTopic}" with no student`];
                                const notification = await sendNotification(res, sendNotificationQuery, sendParams);

                                const notificationReceived = await getNotificationReceived(res, getThesisInfoQueryResults[0][i].lecturer1_id);
                                // lecturer1
                                var socket1 = await getSocketById(res, getThesisInfoQueryResults[0][i].lecturer1_id);
                                var socketReceiver1Id = socket1[0].socket_id;
                                if (socketReceiver1Id === null || socketReceiver1Id === undefined) {
                                }
                                else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                            }
                        }
                        else { console.log("no sup 1") }
                        if (getThesisInfoQueryResults[0][i].lecturer2_id !== null) {
                            if (getThesisInfoQueryResults[0][i].student_id !== null) {
                                const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                const sendParams = [`Admin update thesis`, req.userId, getThesisInfoQueryResults[0][i].lecturer2_id, `An admin has updated the information of your thesis "${thesisTopic}" with the student id "${getThesisInfoQueryResults[0][i].student_id}"`];
                                const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                                //lecturer 2
                                const notificationReceived = await getNotificationReceived(res, getThesisInfoQueryResults[0][i].lecturer2_id);

                                const socket1 = await getSocketById(res, getThesisInfoQueryResults[0][i].lecturer2_id);
                                const socketReceiver1Id = socket1[0].socket_id;
                                if (socketReceiver1Id === null || socketReceiver1Id === undefined) {
                                }
                                else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                            } else {
                                const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                                const sendParams = [`Admin update thesis`, req.userId, getThesisInfoQueryResults[0][i].lecturer2_id, `An admin has updated the information of your thesis "${thesisTopic}" with no student`];
                                const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                                //lecturer 2
                                const notificationReceived = await getNotificationReceived(res, getThesisInfoQueryResults[0][i].lecturer2_id);
                                const socket1 = await getSocketById(res, getThesisInfoQueryResults[0][i].lecturer2_id);
                                const socketReceiver1Id = socket1[0].socket_id;
                                if (socketReceiver1Id === null || socketReceiver1Id === undefined) {
                                }
                                else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                            }
                        } else { console.log("no sup 2") };
                        if (getThesisInfoQueryResults[0][i].student_id !== null) {
                            const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                            const sendParams = [`Admin update thesis`, req.userId, getThesisInfoQueryResults[0][i].student_id, `An admin has updated the information of your thesis`];
                            const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                            //student
                            const notificationReceived = await getNotificationReceived(res, getThesisInfoQueryResults[0][i].student_id);
                            const socket1 = await getSocketById(res, getThesisInfoQueryResults[0][i].student_id);
                            const socketReceiver1Id = socket1[0].socket_id;
                            if (socketReceiver1Id === null || socketReceiver1Id === undefined) {
                            }
                            else { io.to(socketReceiver1Id).emit("notificationReceived", (notificationReceived)) };
                        }
                    }
                    res.send({ "result": "done" });
                } else { console.log("invalid thesis id") }
            }

        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
})

admin_update_router.put('/student/:id/registrationBachelorThesis', verifyTokenAdmin, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var dateOfBirth = (req.body.dateOfBirth === "" || req.body.dateOfBirth === undefined) ? null : req.body.dateOfBirth;
        var placeOfBirth = (req.body.placeOfBirth === "" || req.body.placeOfBirth === undefined) ? null : req.body.placeOfBirth;
        var student_date = (req.body.student_date === "" || req.body.student_date === undefined) ? null : req.body.student_date;
        var titleBachelorThesis = (req.body.titleBachelorThesis === "" || req.body.titleBachelorThesis === undefined) ? null : req.body.titleBachelorThesis;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ? null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ? null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_date = (req.body.supervisor1_date === "" || req.body.supervisor1_date === undefined) ? null : req.body.supervisor1_date;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_date = (req.body.supervisor2_date === "" || req.body.supervisor2_date === undefined) ? null : req.body.supervisor2_date;
        var issued = (req.body.issued === "" || req.body.issued === undefined) ? null : req.body.issued;
        var deadlineCopy = (req.body.deadlineCopy === "" || req.body.deadlineCopy === undefined) ? null : req.body.deadlineCopy;
        var extensionGranted = (req.body.extensionGranted === "" || req.body.extensionGranted === undefined) ? null : req.body.extensionGranted;
        var chairmanOfExamination = (req.body.chairmanOfExamination === "" || req.body.chairmanOfExamination === undefined) ? null : req.body.chairmanOfExamination;
        var dateOfIssue = (req.body.dateOfIssue === "" || req.body.dateOfIssue === undefined) ? null : req.body.dateOfIssue;
        if (req.username) {
            if (role) {
                // if(req.body.matriculationNumber === undefined  || req.body.matriculationNumber === ''){
                //     res.status(500).send("Undefined matriculation number for add");
                // } else if (typeof(req.body.matriculationNumber) != 'number'){
                //     res.status(500).send("Invalid Type for matriculation number, need a number")
                // }
                // else {
                //     matriculationNumber = req.body.matriculationNumber;
                if (req.params.id === undefined || req.params.id === '') {
                    res.status(500).send("Undefined id for add")
                }
                else {
                    studentId = req.params.id;
                    const getStudentInfoQuery = "CALL getAccountByStudentId(?)";
                    const getStudentInfoParams = [studentId];
                    const getStudentInfoResults = await executeQuery(res, getStudentInfoQuery, getStudentInfoParams);

                    const getThesisFromStudentIdQuery = "CALL getExactThesisFromStudentId(?)"; 
                    const getThesisFromStudentIdParams = [studentId];
                    const getThesisFromStudentResults = await executeQuery(res, getThesisFromStudentIdQuery, getThesisFromStudentIdParams);
                    
                    const getSupervisor1InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor1InfoParams = [getThesisFromStudentResults[0][0].lecturer1_id];
                    const getSupervisor1InfoResults = await executeQuery(res, getSupervisor1InfoQuery, getSupervisor1InfoParams);

                    const getSupervisor2InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor2InfoParams = [getThesisFromStudentResults[0][0].lecturer2_id];
                    const getSupervisor2InfoResults = await executeQuery(res, getSupervisor2InfoQuery, getSupervisor2InfoParams);
                    
                    const query = "UPDATE registrations_for_bachelor_thesis SET surname = ?, forename = ?, date_of_birth = ?, place_of_birth = ?, signature = ?, student_date = ?, title_bachelor_thesis = ?, thesis_type = ?, further_participants = ?, supervisor1_title = ?, supervisor1_signature = ?, supervisor1_date = ?, supervisor2_title = ?, supervisor2_signature = ?, supervisor2_date = ?, issued = ?, deadline_copy = ?, extension_granted = ?, chairman_of_examination = ?, date_of_issue = ? where student_id = ?";
                    const queryParams = [surName, foreName, dateOfBirth, placeOfBirth, getStudentInfoResults[0][0].signature , student_date, titleBachelorThesis, thesisType, furtherParticipants, supervisor1_title, getSupervisor1InfoResults[0][0].signature, supervisor1_date, supervisor2_title, getSupervisor2InfoResults[0][0].signature, supervisor2_date, issued, deadlineCopy, extensionGranted, chairmanOfExamination, dateOfIssue, studentId]
                    const dbResults = await executeQuery(res, query, queryParams);
                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${req.params.id}`, req.userId, req.params.id, "update Student Registration Bachelor Thesis of " + req.params.id + " successfully"];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                    res.send(dbResults);
                }
                // }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error " + error.message);
    }

})
admin_update_router.put('/student/:id/registrationOralDefense', verifyTokenAdmin, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
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
                if (req.params.id === undefined || req.params.id === '') {
                    res.status(500).send("Undefined id for add")
                }
                else {
                    studentId = req.params.id;
                    const query = "UPDATE registrations_for_oral_defense SET surname = ?, forename = ?, supervisor1_title = ?, supervisor2_title = ?, spectators_present = ?, weekdate = ?, proposed_date = ?, proposed_time = ?, room = ?, concerned_agreed = ?, date_receive = ?, date_submission = ? where student_id = ?";
                    const queryParams = [surName, foreName, supervisor1_title, supervisor2_title, spectatorsPresent, weekDate, proposedDate, proposedTime, room, concernedAgreed, dateReceive, dateSubmission, studentId]
                    const dbResults = await executeQuery(res, query, queryParams);
                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${req.params.id}`, req.userId, req.params.id, "update student Registration Oral Defense of " + req.params.id + " successfully"];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                    res.send(dbResults);
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
admin_update_router.put('/student/:id/assessmentBachelorThesis', verifyTokenAdmin, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ? null : req.body.surName;
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ? null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ? null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ? null : req.body.supervisor1_title;
        var supervisor1_grade = (req.body.supervisor1_grade === "" || req.body.supervisor1_grade === undefined) ? null : req.body.supervisor1_grade;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ? null : req.body.supervisor2_title;
        var supervisor2_grade = (req.body.supervisor2_grade === "" || req.body.supervisor2_grade === undefined) ? null : req.body.supervisor2_grade;
        var assessmentThesis = (req.body.assessmentThesis === "" || req.body.assessmentThesis === undefined) ? null : req.body.assessmentThesis;
        var assessmentDate = (req.body.assessmentDate === "" || req.body.assessmentDate === undefined) ? null : req.body.assessmentDate;

        if (req.username) {
            if (role) {
                if (req.params.id === undefined || req.params.id === '') {
                    res.status(500).send("Undefined id for add")
                }
                else {
                    studentId = req.params.id;
                    const getThesisFromStudentIdQuery = "CALL getExactThesisFromStudentId(?)"; 
                    const getThesisFromStudentIdParams = [studentId];
                    const getThesisFromStudentResults = await executeQuery(res, getThesisFromStudentIdQuery, getThesisFromStudentIdParams);
                    
                    const getSupervisor1InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor1InfoParams = [getThesisFromStudentResults[0][0].lecturer1_id];
                    const getSupervisor1InfoResults = await executeQuery(res, getSupervisor1InfoQuery, getSupervisor1InfoParams);

                    const getSupervisor2InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor2InfoParams = [getThesisFromStudentResults[0][0].lecturer2_id];
                    const getSupervisor2InfoResults = await executeQuery(res, getSupervisor2InfoQuery, getSupervisor2InfoParams);
                    
                    const query = "UPDATE assessment_for_bachelor_thesis SET surname = ?, forename = ?, thesis_type = ?, further_participants = ?, supervisor1_title = ?, supervisor1_grade = ?, supervisor2_title = ?, supervisor2_grade = ?, assessment_thesis = ?, assessment_date = ?, supervisor1_signature = ?, supervisor2_signature = ? where student_id = ?";
                    const queryParams = [surName, foreName, thesisType, furtherParticipants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessmentThesis, assessmentDate, getSupervisor1InfoResults[0][0].signature, getSupervisor2InfoResults[0][0].signature, studentId];
                    const dbResults = await executeQuery(res, query, queryParams);
                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${req.params.id}`, req.userId, req.params.id, "update Student Assessment Bachelor Thesis of " + req.params.id + " successfully"];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                    res.send(dbResults);
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
admin_update_router.put('/student/:id/assessmentOralDefense', verifyTokenAdmin, async (req, res) => {
    try {
        var role = req.role;
        var studentId;
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

        if (req.username) {
            if (role) {
                if (req.params.id === undefined || req.params.id === '') {
                    res.status(500).send("Undefined id for add")
                }
                else {
                    studentId = req.params.id;
                    const getThesisFromStudentIdQuery = "CALL getExactThesisFromStudentId(?)"; 
                    const getThesisFromStudentIdParams = [studentId];
                    const getThesisFromStudentResults = await executeQuery(res, getThesisFromStudentIdQuery, getThesisFromStudentIdParams);
                    
                    const getSupervisor1InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor1InfoParams = [getThesisFromStudentResults[0][0].lecturer1_id];
                    const getSupervisor1InfoResults = await executeQuery(res, getSupervisor1InfoQuery, getSupervisor1InfoParams);

                    const getSupervisor2InfoQuery = "CALL getBasicInfoLecturerByLecturerId(?)";
                    const getSupervisor2InfoParams = [getThesisFromStudentResults[0][0].lecturer2_id];
                    const getSupervisor2InfoResults = await executeQuery(res, getSupervisor2InfoQuery, getSupervisor2InfoParams);
                    
                    const query = "UPDATE assessment_for_oral_defense SET surName = ?, foreName = ?, date_defense = ?, place_defense = ?, start_date = ?, finish_date = ?, state_of_health = ?, supervisor1_title = ?, supervisor1_grade = ?, supervisor2_title = ?, supervisor2_grade = ?, record = ?, assessment_date = ?, supervisor1_signature = ?, supervisor2_signature = ? where student_id = ?";
                    const queryParams = [surName, foreName, dateDefense, placeDefense, startDate, finishDate, stateOfHealth, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, record, assessmentDate, getSupervisor1InfoResults[0][0].signature, getSupervisor2InfoResults[0][0].signature, studentId]
                    const dbResults = await executeQuery(res, query, queryParams);

                    const sendNotificationQuery = "INSERT INTO notifications (title, sender, receiver, content) VALUES (?, ?, ?, ?)";
                    const sendParams = [`Update from ${req.userId} to ${req.params.id}`, req.userId, req.params.id, "update Student Assessment Bachelor Thesis of " + req.params.id + " successfully"];
                    const notification = await sendNotification(res, sendNotificationQuery, sendParams);
                    const notificationSent = await getNotificationSent(res, req.userId);
                    const notificationReceived = await getNotificationReceived(res, req.userId);
                    const socket = await getSocketById(res, req.userId);
                    const socketId = socket[0].socket_id;
                    if (socketId === null || socketId === undefined) {
                        console.log("no socketId from database");
                    }
                    else { io.to(socketId).emit("notificationReceived", (notificationReceived)) };
                    res.send(dbResults);
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
admin_update_router.post('/signature', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var signature = req.body.signature;
    if (req.username) {
        if (role) {
            if (req.userId === undefined || req.userId === '') {
                res.status(500).send("Undefined id for add");
            }
            else {
                const updateSignatureQuery = "UPDATE admins SET signature = ? WHERE admin_id = ?";
                const updateSignatureQueryParams = [signature, req.userId];
                const results = await executeQuery(res, updateSignatureQuery, updateSignatureQueryParams);
                res.send(results);
            }
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
});


admin_update_router.put('/signature', verifyTokenAdmin, async (req, res) => {
    var role = req.role;
    var signature = req.body.signature;
    if (req.username) {
        if (role) {
            if (req.userId === undefined || req.userId === '') {
                res.status(500).send("Undefined id for add");
            }
            else {
                const updateSignatureQuery = "UPDATE admins SET signature = ? WHERE admin_id = ?";
                const updateSignatureQueryParams = [signature, req.userId];
                const results = await executeQuery(res, updateSignatureQuery, updateSignatureQueryParams);
                res.send(results);
            }
        }
        else res.status(405).send("You are not allowed to access, You are not admin")
    }
    else res.status(404).send("No user with that username");
});
admin_update_router.put('/lecturer', (req, res) => {
    res.send("Default routes for admin/update/lecturer");
})
admin_update_router.put('/student', (req, res) => {
    res.send("Default routes for admin/update/student");
})
admin_update_router.put('/thesis', (req, res) => {
    res.send("Default routes for admin/update/thesis");
})
// use for email
function checkTypeToUpdate(value, type) {
    if (value === "" || value === undefined) {
        return null;
    } else if (!value.toString().match(type)) {
        return '';
    }
    else { return value; }
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
const executeQuery = (res, query, queryParams) => {
    const results = new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if (err) { res.status(500).send(err.message) }
            else { resolve(JSON.parse(JSON.stringify(result))) }
        })
    })
    return results;
}
module.exports = admin_update_router;