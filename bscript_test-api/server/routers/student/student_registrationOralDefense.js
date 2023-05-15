
const express = require('express');
const student_registrationOralDefense_router = express.Router();
const readStudentMiddleware = require('../../middleware/readStudentMiddleware');
const verifyTokenStudent = require('../../middleware/verifyTokenStudent');
const db = require('../../db/connectDB');

student_registrationOralDefense_router.post('/', verifyTokenStudent, async (req, res) =>{        
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ?  null : req.body.surName;    
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ?  null : req.body.supervisor1_title;
        var supervisor2_title = (req.body.supervisor2_title === "" || req.body.supervisor2_title === undefined) ?  null : req.body.supervisor2_title;
        var spectatorsPresent = (req.body.spectatorsPresent === "" || req.body.spectatorsPresent === undefined) ?  null : req.body.spectatorsPresent;
        var weekDate = (req.body.weekDate === "" || req.body.weekDate === undefined) ?  null : req.body.weekDate;
        var proposedDate = (req.body.proposedDate === "" || req.body.proposedDate === undefined) ?  null : req.body.proposedDate;
        var proposedTime = (req.body.proposedTime === "" || req.body.proposedTime === undefined) ?  null : req.body.proposedTime;
        var room = (req.body.room === "" || req.body.room === undefined) ?  null : req.body.room;
        var concernedAgreed = (req.body.concernedAgreed === "" || req.body.concernedAgreed === undefined) ?  null : req.body.concernedAgreed;
        var dateReceive = (req.body.dateReceive === "" || req.body.dateReceive === undefined) ?  null : req.body.dateReceive;
        var dateSubmission = (req.body.dateSubmission === "" || req.body.dateSubmission === undefined) ?  null : req.body.dateSubmission;
        if(req.username) {
            if(role){
                if(req.body.matriculationNumber === undefined  || req.body.matriculationNumber === ''){
                    res.status(500).send("Undefined matriculation number for add");
                } else if (typeof(req.body.matriculationNumber) != 'number'){
                    res.status(500).send("Invalid Type for matriculation number, need a number")
                }
                else {
                    matriculationNumber = req.body.matriculationNumber;
                    if(req.body.studentId === undefined || req.body.studentId === ''){
                        res.status(500).send("Undefined id for add")
                    }
                    else if (typeof(req.body.studentId) != 'number') {
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
            else res.status(405).send("You are not allowed to access, You are not student")
        }
        else res.status(404).send("No user with that username");

    } catch (error) {
            console.log(error.message);
            res.status(404).send("You got an error " + error.message);
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
module.exports = student_registrationOralDefense_router;
