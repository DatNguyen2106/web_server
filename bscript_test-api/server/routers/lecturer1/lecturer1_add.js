const express = require('express');
const lecturer1_add_router = express.Router();
const db = require('../../db/connectDB');
const addThesisLecturer11 = require('../../middleware/addThesisLecturer11');
const moment = require('moment');
lecturer1_add_router.post('/thesis', addThesisLecturer11, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var currentTimeValue = moment().valueOf();
        var thesisField = (req.body.thesisField === "" || req.body.thesisField === undefined || req.body.thesisField === null) ? null : req.body.thesisField;
        var thesisTopic = (req.body.thesisTopic === "" || req.body.thesisTopic === undefined || req.body.thesisTopic === null) ? null : req.body.thesisTopic;
        var slotMaximum = (req.body.slotMaximum === "" || req.body.slotMaximum === undefined || req.body.slotMaximum === null) ? null : req.body.slotMaximum;
        if (req.username && req.userId) {
            if (role) {
                var thesisId = `${currentTimeValue}${req.userId}`;
                thesisId = BigInt(thesisId);
                const getLecturerInfoQuery = "SELECT * FROM lecturers WHERE lecturer_id = ?";
                const getLecturerInfoQueryParams = [req.userId]
                const getLecturerInfoResults = await executeQuery(res, getLecturerInfoQuery, getLecturerInfoQueryParams);
                getLecturerInfoResults[0].number_of_theses
                if (getLecturerInfoResults[0].number_of_theses < getLecturerInfoResults[0].maximum_of_theses) {
                    const query = "INSERT INTO THESES(thesis_id, thesis_topic, thesis_field, slot_maximum) VALUES (?,?,?,?);"
                    const queryParams = [thesisId, thesisTopic, thesisField, slotMaximum];
                    const results = await executeQuery(res, query, queryParams);

                    const insertLecturersThesesQuery = "INSERT INTO lecturers_theses(lecturer_id, thesis_id, confirm_sup2) values (?, ?, ?)"
                    const insertLecturersThesesQueryParams = [req.userId, thesisId, 0];
                    const insertLecturersThesesResults = await executeQuery(res, insertLecturersThesesQuery, insertLecturersThesesQueryParams);
                    res.send(getLecturerInfoResults);
                }
                else { res.send("this lecturer is full of slot") }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1.1")
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
module.exports = lecturer1_add_router;
