
const express = require('express');
const student_assessmentOralDefense_router = express.Router();
const readStudentMiddleware = require('../../middleware/readStudentMiddleware');
const verifyTokenStudent = require('../../middleware/verifyTokenStudent');
const db = require('../../db/connectDB');

student_assessmentOralDefense_router.post('/', verifyTokenStudent, async (req, res) => {
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
                        console.log(dbResults);
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
module.exports = student_assessmentOralDefense_router;
