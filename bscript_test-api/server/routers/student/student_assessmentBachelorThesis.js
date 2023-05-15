
const express = require('express');
const student_assessmentBachelorThesis_router = express.Router();
const readStudentMiddleware = require('../../middleware/readStudentMiddleware');
const verifyTokenStudent = require('../../middleware/verifyTokenStudent');
const db = require('../../db/connectDB');

student_assessmentBachelorThesis_router.post('/', verifyTokenStudent, async (req, res) =>{        
    try {
        var role = req.role;
        var studentId;
        var matriculationNumber;
        var surName = (req.body.surName === "" || req.body.surName === undefined) ?  null : req.body.surName;    
        var foreName = (req.body.foreName === "" || req.body.foreName === undefined) ? null : req.body.foreName;
        var thesisType = (req.body.thesisType === "" || req.body.thesisType === undefined) ?  null : req.body.thesisType;
        var furtherParticipants = (req.body.furtherParticipants === "" || req.body.furtherParticipants === undefined) ?  null : req.body.furtherParticipants;
        var supervisor1_title = (req.body.supervisor1_title === "" || req.body.supervisor1_grade === undefined) ?  null : req.body.supervisor1_title;
        var supervisor1_grade = (req.body.supervisor1_grade === "" || req.body.supervisor1_signature === undefined) ?  null : req.body.supervisor1_grade;
        var supervisor2_title = (req.body.supervisor2_title === "" ||req.body.supervisor2_title === undefined) ?  null : req.body.supervisor2_title;
        var supervisor2_grade = (req.body.supervisor2_grade === "" || req.body.supervisor2_grade === undefined) ?  null : req.body.supervisor2_grade;
        var assessmentThesis = (req.body.assessmentThesis === "" || req.body.assessmentThesis === undefined)  ?  null : req.body.assessmentThesis;
        var assessmentDate = (req.body.assessmentDate === "" || req.body.assessmentDate === undefined)  ?  null : req.body.assessmentDate;
        var supervisor1_signature = (req.body.supervisor1_signature === "" ||req.body.supervisor1_signature === undefined) ?  null : req.body.supervisor1_signature;
        var supervisor2_signature = (req.body.supervisor2_signature === "" || req.body.supervisor2_signature === undefined) ?  null : req.body.supervisor2_signature;

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
                    var query = "INSERT INTO assessment_for_bachelor_thesis(student_id, matriculation_number, surname, forename, thesis_type, further_participants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessment_thesis, assessment_date, supervisor1_signature, supervisor2_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"
                    var queryParams = [studentId, matriculationNumber, surName, foreName, thesisType, furtherParticipants, supervisor1_title, supervisor1_grade, supervisor2_title, supervisor2_grade, assessmentThesis, assessmentDate, supervisor1_signature, supervisor2_signature]
                    var dbResults = await executeQuery(res, query, queryParams);
                    console.log(dbResults);  
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
module.exports = student_assessmentBachelorThesis_router;
