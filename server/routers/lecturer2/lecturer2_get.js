const express = require('express');
const lecturer2_get_router = express.Router();
const db = require('../../db/connectDB');
const getThesesLecturer2 = require('../../middleware/getThesesLecturer2');
const verifyTokenLecturer = require('../../middleware/verifyTokenLecturer');
const verifyTokenLecturer2 = require('../../middleware/verifyTokenLecturer2');
const moment = require('moment');
lecturer2_get_router.post('/theses', getThesesLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var chunkForPage = 5;
        var page = (req.body.page === "" || req.body.page === undefined) ? 1 : req.body.page;
        var thesisTopic = (req.body.thesisTopic === undefined || req.body.thesisTopic === null || req.body.thesisTopic === "") ? '%' : ('%' + req.body.thesisTopic + '%');
        var thesisField = (req.body.thesisField === undefined || req.body.thesisField === null || req.body.thesisField === "") ? '%' : ('%' + req.body.thesisField + '%');
        var lecturer1Title = (req.body.lecturer1Title === undefined || req.body.lecturer1Title === null || req.body.lecturer1Title === "") ? null : ('%' + req.body.lecturer1Title + '%');
        var step = (req.body.step === undefined || req.body.step === null || req.body.step === "") ? '%' : ('%' + req.body.step + '%');
        var slot = (req.body.slot === undefined || req.body.slot === null || req.body.slot === "") ? '%' : ('%' + req.body.slot + '%');
        var slotMaximum = (req.body.slotMaximum === undefined || req.body.slotMaximum === null || req.body.slotMaximum === "") ? '%' : ('%' + req.body.slotMaximum + '%');
        var confirmSup2 = (req.body.confirmSup2 === undefined || req.body.confirmSup2 === null || req.body.confirmSup2 === "") ? null : ('%' + req.body.confirmSup2 + '%');
        var wasDefended = (req.body.wasDefended === undefined || req.body.wasDefended === null || typeof (req.body.wasDefended) != 'boolean') ? false : req.body.wasDefended;
        if (req.username && req.userId) {
            if (role) {
                const query = "call getThesesByLecturer2ByTitle(?,?,?,?,?,?,?,?,?);"
                const queryParams = [thesisTopic, thesisField, step, slot, slotMaximum, lecturer1Title, confirmSup2, req.userId, wasDefended];
                const results = await executeQuery(res, query, queryParams);

                if (page > results[0].chunk(chunkForPage).length) {
                    res.send({
                        "totalPage": results[0].chunk(chunkForPage).length,
                        "list": []
                    })
                }
                else {
                    res.send({
                        "totalPage": results[0].chunk(chunkForPage).length,
                        "list": results[0].chunk(chunkForPage)[page - 1]
                    })
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer2")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_get_router.get('/thesis/:id', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var thesisId;
        if (req.username && req.userId) {
            if (role) {
                if (req.params.id === undefined || req.params.id === "") {
                    res.status(404).send("Invalid username with that id")
                } else {
                    thesisId = req.params.id;
                    var studentId;
                    const query = "call getThesesByThesisId(?);"
                    const queryParams = [thesisId];
                    const results = await executeQuery(res, query, queryParams);

                    for (var i = 0; i < results[0].length; i++) {
                        studentId = results[0][i].student_id;
                        const registrationBachelorThesisQuery = "SELECT * FROM registrations_for_bachelor_thesis WHERE student_id  = ?";
                        const queryParamsRegistrationBachelorThesis = [studentId]
                        const registrationBachelorThesisResults = await executeQuery(res, registrationBachelorThesisQuery, queryParamsRegistrationBachelorThesis);

                        const assessmentBachelorThesisQuery = "SELECT * FROM assessment_for_bachelor_thesis WHERE student_id  = ?";
                        const queryParamsAssessmentBachelorThesisQuery = [studentId];
                        const assessmentBachelorThesisResults = await executeQuery(res, assessmentBachelorThesisQuery, queryParamsAssessmentBachelorThesisQuery);

                        const registrationOralDefenseQuery = "SELECT * FROM registrations_for_oral_defense WHERE student_id  = ?";
                        const queryParamsRegistrationOralDefense = [studentId]
                        const registrationOralDefenseResults = await executeQuery(res, registrationOralDefenseQuery, queryParamsRegistrationOralDefense);


                        const assessmentOralDefenseQuery = "SELECT * FROM assessment_for_oral_defense WHERE student_id  = ?";
                        const queryParamsAssessmentOralDefense = [studentId]
                        const assessmentOralDefenseResults = await executeQuery(res, assessmentOralDefenseQuery, queryParamsAssessmentOralDefense);

                        results[0][i]['registrationBachelorThesis'] = registrationBachelorThesisResults;
                        results[0][i]['registrationOralDefenseResults'] = registrationOralDefenseResults;
                        results[0][i]['assessmentBachelorThesisResults'] = assessmentBachelorThesisResults;
                        results[0][i]['assessmentOralDefenseResults'] = assessmentOralDefenseResults;
                    }
                    results.id = req.userId;
                    res.send({ "lecturer_id": results.id, "list": results[0] });
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer2")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_get_router.get('/testForm/:id', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var studentId = req.params.id;
        var role = req.role;
        if (req.username && req.userId) {
            if (role) {
                if (req.userId === undefined || req.userId === "") {
                    res.status(404).send("Invalid username with that id")
                } else if (!(req.userId) === "number") {
                    res.status(404).send("Need a number Parameter Id");
                } else {
                    const query = "CALL getThesisFromStudentId(?)";
                    const queryParams = [studentId];
                    const results = await executeQuery(res, query, queryParams);
                    const registrationBachelorThesisQuery = "SELECT * FROM registrations_for_bachelor_thesis WHERE student_id  = ?";
                    const queryParamsRegistrationBachelorThesis = [studentId]
                    const registrationBachelorThesisResults = await executeQuery(res, registrationBachelorThesisQuery, queryParamsRegistrationBachelorThesis);

                    const assessmentBachelorThesisQuery = "SELECT * FROM assessment_for_bachelor_thesis WHERE student_id  = ?";
                    const queryParamsAssessmentBachelorThesisQuery = [studentId];
                    const assessmentBachelorThesisResults = await executeQuery(res, assessmentBachelorThesisQuery, queryParamsAssessmentBachelorThesisQuery);

                    const registrationOralDefenseQuery = "SELECT * FROM registrations_for_oral_defense WHERE student_id  = ?";
                    const queryParamsRegistrationOralDefense = [studentId]
                    const registrationOralDefenseResults = await executeQuery(res, registrationOralDefenseQuery, queryParamsRegistrationOralDefense);


                    const assessmentOralDefenseQuery = "SELECT * FROM assessment_for_oral_defense WHERE student_id  = ?";
                    const queryParamsAssessmentOralDefense = [studentId]
                    const assessmentOralDefenseResults = await executeQuery(res, assessmentOralDefenseQuery, queryParamsAssessmentOralDefense);
                    results.pop();
                    var studentList = [];
                    for (var i = 0; i < results[0].length; i++) {
                        // var studentList = {"student_id" : results[0][i].student_id, "fullName" : results[0][i].fullname, "intake" : results[0][i].intake, "email" : results[0][i].email, "confirmSup1" : results[0][i].confirm_sup1}
                        studentList.push({ "student_id": results[0][i].student_id, "fullName": results[0][i].fullname, "intake": results[0][i].intake, "email": results[0][i].email, "confirmSup1": results[0][i].confirm_sup1 });
                        results[0][i]["student_list"] = studentList;
                        delete results[0][i]["student_id"];
                        delete results[0][i]["fullname"];
                        delete results[0][i]["intake"];
                        delete results[0][i]["student_id"];
                        delete results[0][i]["confirm_sup1"];
                    }

                    results[0]["student_list"] = studentList;
                    res.send({ "student_id": studentId, "list": results[0], registrationBachelorThesisResults, registrationOralDefenseResults, assessmentBachelorThesisResults, assessmentOralDefenseResults });
                }
            }
            else res.status(405).send("You are not allowed to access, You are not admin")
        }
        else res.status(404).send("No user with that username");
    } catch (error) {
        console.log(error.message);
        res.status(404).send("You got an error" + error.message);
    }

})
lecturer2_get_router.get('/account', verifyTokenLecturer2, async (req, res) => {
    // because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        var thesisId;
        if (req.username) {
            if (role) {
                if (req.userId === undefined || req.userId === "") {
                    res.status(404).send("Invalid username with that id")
                } else {
                    var lecturerId = req.userId;
                    const query = "call getAccountByLecturer(?);"
                    const queryParams = [lecturerId];
                    const results = await executeQuery(res, query, queryParams);
                    if (results) {
                        res.send(results[0]);
                    }
                }
            }
            else res.status(405).send("You are not allowed to access, You are not lecturer1")
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
module.exports = lecturer2_get_router;
