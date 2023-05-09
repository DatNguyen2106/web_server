const express = require('express');
const lecturer1_delete_router = express.Router();
const db = require('../../db/connectDB');
const verifyTokenLecturer1 = require('../../middleware/verifyTokenLecturer1');
const moment = require('moment');
lecturer1_delete_router.delete('/thesis/:id', verifyTokenLecturer1, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var thesisId;
        if (req.username && req.userId) {
            if (role) {
                thesisId = req.params.id;
                const getThesisInfoQuery = "call getThesisInfoById(?)";
                const getThesisInfoParams =[thesisId];
                const getThesisInfoResults = await executeQuery(res, getThesisInfoQuery, getThesisInfoParams);           
                console.log(getThesisInfoResults);
                // check student
                if(getThesisInfoResults[0] !== null && getThesisInfoResults[0] !== undefined && getThesisInfoResults[0].length !== 0){
                if(getThesisInfoResults[0][0].student_id === null || getThesisInfoResults[0][0].student_id === undefined) {
                    const deleteThesisQuery = "delete from theses where thesis_id = ?"; 
                    const deleteThesisParams = [thesisId];
                    const deleteThesisResults = await executeQuery(res, deleteThesisQuery, deleteThesisParams);
                    res.send("delete successfully");
                }  else{
                    res.send("this thesis have students")
                }} 
                else {
                    res.send("no thesis found with that id")
                }
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
module.exports = lecturer1_delete_router;
