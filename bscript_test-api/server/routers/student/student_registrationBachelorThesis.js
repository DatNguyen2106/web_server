
const express = require('express');
const student_registrationBachelorThesis_router = express.Router();
const readStudentMiddleware = require('../../middleware/readStudentMiddleware');
const verifyTokenStudent = require('../../middleware/verifyTokenStudent');
const db = require('../../db/connectDB');

student_registrationBachelorThesis_router.post('/', verifyTokenStudent, async (req, res) =>{        
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ?  null : req.body.surName;    
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var dateOfBirth = (req.body.dateOfBirth === "" || req.body.dateOfBirth === undefined) ?  null : req.body.dateOfBirth;
        var placeOfBirth = (req.body.placeOfBirth === "" || req.body.placeOfBirth === undefined) ?  null : req.body.placeOfBirth;
        var signature = (req.body.signature === "" || req.body.signature === undefined) ? null : req.body.signature;
        var titleBachelorThesis = (req.body.titleBachelorThesis === "" || req.body.titleBachelorThesis === undefined) ?  null : req.body.titleBachelorThesis;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ?  null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ?  null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_title === undefined) ?  null : req.body.supervisor1_title;
        var supervisor1_signature = (req.body.supervisor1_signature === "" || req.body.supervisor1_signature === undefined) ?  null : req.body.signature;
        var supervisor1_date = (req.body.supervisor1_date === "" || req.body.supervisor1_date === undefined) ?  null : req.body.supervisor1_date;
        var supervisor2_title = (req.body.supervisor2_title === "" ||req.body.supervisor2_title === undefined) ?  null : req.body.supervisor2_title;
        var supervisor2_signature = (req.body.supervisor2_signature === "" || req.body.supervisor2_signature === undefined) ?  null : req.body.supervisor2_signature;
        var supervisor2_date = (req.body.supervisor2_date === "" || req.body.supervisor2_date === undefined) ?  null : req.body.supervisor2_date;
        var issued = (req.body.issued === "" || req.body.issued === undefined) ?  null : req.body.issued;
        var deadlineCopy = (req.body.deadlineCopy === "" || req.body.deadlineCopy === undefined) ?  null : req.body.deadlineCopy;
        var extensionGranted = (req.body.extensionGranted === "" || req.body.extensionGranted === undefined) ?  null : req.body.extensionGranted;
        var chairmanOfExamination = (req.body.chairmanOfExamination === "" || req.body.chairmanOfExamination === undefined) ?  null : req.body.chairmanOfExamination;
        var dateOfIssue = (req.body.dateOfIssue === "" || req.body.dateOfIssue === undefined) ?  null : req.body.dateOfIssue;
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
                    var query = "INSERT INTO registrations_for_bachelor_thesis (student_id, matriculation_number, surname, forename, date_of_birth, place_of_birth , signature, title_bachelor_thesis, thesis_type, further_participants, supervisor1_title, supervisor1_signature, supervisor1_date, supervisor2_title, supervisor2_signature, supervisor2_date, issued , deadline_copy, extension_granted, chairman_of_examination ,date_of_issue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                    var queryParams = [studentId, matriculationNumber, surName, foreName, dateOfBirth, placeOfBirth, signature, titleBachelorThesis, thesisType, furtherParticipants, supervisor1_title, supervisor1_signature, supervisor1_date, supervisor2_title, supervisor2_signature, supervisor2_date, issued, deadlineCopy, extensionGranted, chairmanOfExamination, dateOfIssue]
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
    const results =  new Promise((resolve) => {
        db.query(query, queryParams, (err, result) => {
            if(err) {res.status(500).send(err.message)}
            else
            {  resolve(JSON.parse(JSON.stringify(result)))}
        })
        })
    return results;
}
module.exports = student_registrationBachelorThesis_router;
