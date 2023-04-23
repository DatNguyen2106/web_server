const express = require('express');
const lecturer1_modify_router = express.Router();
const db = require('../../db/connectDB');
const verifyTokenLecturer1 = require('../../middleware/verifyTokenLecturer1');
const moment = require('moment');
lecturer1_modify_router.put('/thesis', verifyTokenLecturer1, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var thesisField = (req.body.thesisField === "" || req.body.thesisField === undefined || req.body.thesisField === null) ? null : req.body.thesisField;
        var thesisTopic = (req.body.thesisTopic === "" || req.body.thesisTopic === undefined || req.body.thesisTopic === null) ? null : req.body.thesisTopic;
        var thesisId = (req.body.thesisId === "" || req.body.thesisId === undefined || req.body.thesisId === null) ? null : req.body.thesisId;

        if (req.username && req.userId) {
            if (role) {
                console.log(thesisId);
                const modifyThesisQuery = "UPDATE theses SET thesis_topic = ?, thesis_field = ? WHERE thesis_id = ?";
                const modifyThesisParams = [thesisTopic, thesisField, thesisId];
                const modifyThesisResults = await executeQuery(res, modifyThesisQuery, modifyThesisParams);
                res.send(modifyThesisResults);
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
module.exports = lecturer1_modify_router;
