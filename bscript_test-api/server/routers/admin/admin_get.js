const express = require('express');
const admin_get_router = express.Router();
const verifyTokenAdmin = require('../../middleware/verifyTokenAdmin');
const verifyToken = require('../../middleware/verifyTokenAdmin');
const db = require('../../db/connectDB');
const io = require('../.././socketServer');
admin_get_router.get('/test', verifyToken, (req, res) => {
    if(req.username) {
        switch (req.role){
            case 'admin':
                {
                    var testQuery = "SELECT * FROM posts";
                    db.query(testQuery, function(err, results) {
                        {
                            if(err) {res.send(err);}
                            else res.json(results);
                        }
                    })
                }
                break;
            case 'lecturer1':
                {
                    console.log("You are the lecturer1, cannot access full, u can only access lecturer1 posts")
                    var testQuery = "SELECT * FROM posts where username = ?";
                    db.query(testQuery,[req.username], function(err, results) {
                        {
                            if(err) {res.send(err);}
                            else res.json(results);
                        }
                    })
                }
                break;
            case 'lecturer2':
                {
                    console.log("You are the lecturer2, cannot access this, only you can access lecturer2 post") 
                    var testQuery = "SELECT * FROM posts where username = ?";
                    db.query(testQuery,[req.username], function(err, results) {
                        {
                            if(err) {res.send(err);}
                            else res.json(results);
                        }
                    })
                }    
                break;
            case 'student':
                {
                    res.send("You are the student, cannot access this")
                }    
                break; 
            default : {console.log("this is default")}   
        }
    }
});

admin_get_router.post('/lecturers', verifyTokenAdmin, async (req, res) =>{
    try {
        var chunkForPage = 5;
        var emailFormat = /^[a-zA-Z0-9_.+]*[a-zA-Z][a-zA-Z0-9_.+]*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        var page = (req.body.page === "" || req.body.page === undefined) ?  1 : req.body.page;
        var id  = (req.body.id === "" || req.body.id === undefined) ?  '%' : ('%' +req.body.id +'%');
        var title = (req.body.title === "" || req.body.title === undefined) ? '%' : ('%' + req.body.title + '%');
        var userName = (req.body.username === "" || req.body.username === undefined) ?  '%' : ('%' + req.body.username  + '%');
        var email;
        var maximumTheses = (req.body.maximumTheses === "" || req.body.maximumTheses === undefined) ? '%' : ('%' + req.body.maximumTheses + '%');
        console.log(emailFormat);
        if(req.body.email === "" || req.body.email === undefined){
             email =  '%';
        }
        else { email = (
            '%' +req.body.email +'%')}
        console.log(email);
        var supervisor = (req.body.supervisor === "" || req.body.supervisor === undefined) ?  '%' : req.body.supervisor;
        var role = req.role;
        if(req.username) {
            if(role){
                {   console.log(id);
                    console.log("userName = " + userName);
                    var filterQuery = "SELECT * FROM lecturers where lecturer_id LIKE ? AND lecturer_user_name LIKE ? AND title LIKE ? AND email LIKE ? AND supervisor LIKE ? AND maximum_of_theses LIKE ?;";
                    const results = await new Promise((resolve) => {
                        db.query(filterQuery, [id, userName, title, email, supervisor, maximumTheses], (err, result) => {
                            if(err) {res.send(err);}
                          else
                          {  
                            resolve(JSON.parse(JSON.stringify(result)))
                          }
                        })
                      })
                    console.log(results);
                    console.log(results.chunk(page)[page-1]);
                    console.log("TotalPage " + results.chunk(chunkForPage).length);
                    const getAllLecturersInProjectByAdminQuery = "call getAllLecturersInProjectByAdmin()";
                    const getAllLecturersInProjectByAdminResults = await executeQuery(res, getAllLecturersInProjectByAdminQuery);
                    console.log(getAllLecturersInProjectByAdminResults[0]);
                    const getAllLecturersInProjectByAdminArray = [];
                    for(var i = 0; i < getAllLecturersInProjectByAdminResults[0].length; i++){
                        getAllLecturersInProjectByAdminArray.push(getAllLecturersInProjectByAdminResults[0][i].lecturer_id);
                        getAllLecturersInProjectByAdminArray.push(getAllLecturersInProjectByAdminResults[0][i].lecturer2);
                    }
                    const getAllLecturersInProjectByAdminArrayWithoutNull = getAllLecturersInProjectByAdminArray.filter(element => {
                        return element !== null;
                      });
                    console.log(results[0])
                    console.log(getAllLecturersInProjectByAdminArrayWithoutNull);
                    for(var i = 0; i < results.length; i++){
                        var inProject = false;
                        if((getAllLecturersInProjectByAdminArrayWithoutNull.includes(results[i].lecturer_id))){
                            results[i]["inProject"] = true;
                        } else {
                            results[i]["inProject"] = false;
                        }
                    }
                    io.emit("getLecturers", results);
                    if(page > results.chunk(chunkForPage).length){
                        res.send({
                            "totalPage" : results.chunk(chunkForPage).length,
                            "list" : []
                        })
                    }
                    else {res.send({
                        "totalPage" : results.chunk(chunkForPage).length,
                        "list" : results.chunk(chunkForPage)[page-1]
                    })}
                }

            }
            else res.send("You are not allowed to access, You are not admin")
        }   
    } catch (error) {
        res.status(404).send(error.message);
    }
    
})
admin_get_router.get('/lecturer/:id', verifyTokenAdmin, async (req, res) =>{
// because of unique id value, so this api just returns 1 or no value.
    try {
        var role = req.role;
        if(req.username) {
            if(role){
                const id  =  req.params.id;
                if(!id || typeof(id) === 'undefined') {
                    res.send("No user params");
                } else {
                    {
                        var filterQuery = "SELECT * FROM lecturers where lecturer_id = ?";
                        const results = await new Promise((resolve) => {
                            db.query(filterQuery, [id], (err, result) => {
                                if(err) {res.send(err);}
                                else
                                {  resolve(JSON.parse(JSON.stringify(result)))}
                            })
                            })
                        if( results.length === 0 || results === null || results === undefined || results === [])
                        { res.send(results)}
                        else {
                            // case return number of objects > 1
                            // but in this case the number of results are only 1 and 0.
                            if(results.length === 1){
                            res.send({
                                "id" : results[0].lecturer_id,
                                "userName" : results[0].lecturer_user_name,
                                "email" : results[0].email,
                                "supervisor" : results[0].supervisor,
                                "title" : results[0].title,
                                "signature" : results[0].signature,
                                "numberOFTheses" : results[0].number_of_theses,
                                "maximumOfTheses" : results[0].maximum_of_theses,
                                "bio" : results[0].bio
                                })
                            }
                        }
                    }
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
admin_get_router.post('/students', verifyTokenAdmin, async (req, res) =>{
    try {
        var chunkForPage = 5;
        const emailFormat = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
        // yyyy - mm - dd
        const ectsFormat = /^\d+$/;
        var page = (req.body.page === "" || req.body.page === undefined) ?  1 : req.body.page;
        var id  = (req.body.id === "" || req.body.id === undefined) ?  '%' : ('%' + req.body.id +'%');
        var userName = (req.body.username === "" || req.body.username === undefined) ?  '%' : ('%' + req.body.username  + '%');
        var fullName = (req.body.fullname === "" || req.body.fullname === undefined) ?  '%' :  ('%' + req.body.fullname  + '%');
        var intake = (req.body.intake === "" || req.body.intake === undefined) ? '%' : ('%' +  req.body.intake + '%'); 
        var email = (req.body.email === "" || req.body.email === undefined) ? '%' : ('%' + req.body.email + '%');
        var ects  = (req.body.etcs === "" || req.body.ects === undefined) ? '%' : ('%' +  req.body.ects + '%'); 
        var signature = (req.body.signature === "" || req.body.signature === undefined) ?  '%' : ('%' + req.body.signature + '%');        
        var role = req.role;
        if(req.username) {
            if(role){
                {  
                    var filterQuery = "SELECT * FROM students where student_id LIKE ? AND student_user_name LIKE ? AND fullname LIKE ? AND intake LIKE ? AND email LIKE ? AND ects LIKE ?;";
                    const results = await new Promise((resolve) => {
                        db.query(filterQuery, [id, userName, fullName, intake, email, ects, signature], (err, result) => {
                          if(err) {res.send(err);}
                          else
                          {  
                            resolve(JSON.parse(JSON.stringify(result)))
                          }
                        })
                      })
                    const getAllStudentsInProjectByAdminQuery = "call getAllStudentsInProjectByAdmin()";
                    const getAllStudentsInProjectByAdminResults = await executeQuery(res, getAllStudentsInProjectByAdminQuery);
                    console.log(typeof(getAllStudentsInProjectByAdminResults[0]));
                    const getAllStudentsInProjectByAdminArray = [];
                    for(var i = 0; i < getAllStudentsInProjectByAdminResults[0].length; i++){
                        getAllStudentsInProjectByAdminArray.push(getAllStudentsInProjectByAdminResults[0][i].student_id);
                    }
                    console.log(results[0])
                    console.log(getAllStudentsInProjectByAdminArray);
                    for(var i = 0; i < results.length; i++){
                        var inProject = false;
                        if((getAllStudentsInProjectByAdminArray.includes(results[i].student_id))){
                            results[i]["inProject"] = true;
                        } else {
                            results[i]["inProject"] = false;
                        }
                    }
                    if(page > results.chunk(chunkForPage).length){
                        res.send({
                            "totalPage" : results.chunk(chunkForPage).length,
                            "list" : []
                        })
                    }
                    else {res.send({
                        "totalPage" : results.chunk(chunkForPage).length,
                        "list" : results.chunk(chunkForPage)[page-1]
                    })}
                }
            }
            else res.send("You are not allowed to access, You are not admin")
        }   
    } catch (error) {
        res.status(404).send(error.message);
    }
})


admin_get_router.get('/signature', verifyTokenAdmin, async (req, res) =>{
    try {
        var role = req.role;
        if(req.username) {
            if(role){
                {  
                    const getAdminSignatureQuery = "SELECT admin_id, signature from admins WHERE admin_id = ?"
                    const getAdminSignatureQueryParams = [req.userId];
                    const results = await executeQuery(res, getAdminSignatureQuery, getAdminSignatureQueryParams);
                    res.send(results);
                }
            }
            else res.send("You are not allowed to access, You are not admin")
        }   
    } catch (error) {
        res.status(404).send(error.message);
    }
})
// admin_get_router.get('/student/:id', verifyTokenAdmin, async (req, res) =>{
//     // because of unique id value, so this api just returns 1 or no value.
//         try {
//             var role = req.role;
//             if(req.username) {
//                 if(role){
//                     const id  =  req.params.id;
//                     if(!id || typeof(id) === 'undefined') {
//                         res.send("No user params");
//                     } else {
//                         {
//                             var filterQuery = "SELECT * FROM students where student_id = ?";
//                             const results = await new Promise((resolve) => {
//                                 db.query(filterQuery, [id], (err, result) => {
//                                     if(err) {res.send(err);}
//                                     else
//                                     {  resolve(JSON.parse(JSON.stringify(result)))}
//                                 })
//                                 })
//                             if( results.length === 0 || results === null || results === undefined || results === [])
//                             { res.send(results)}
//                             else {
//                                 // case return number of objects > 1
//                                 // but in this case the number of results are only 1 and 0.
//                                 if(results.length === 1){
//                                 res.send({
//                                     "id" : results[0].student_id,
//                                     "userName" : results[0].student_user_name,
//                                     "fullName" : results[0].fullname,
//                                     "intake" : results[0].intake,
//                                     "email" : results[0].email,
//                                     "ects" : results[0].ects,
//                                     "signature" : results[0].signature
//                                     })
//                                 }
//                             }
//                         }
//                     }        
//                 }
//                 else res.status(405).send("You are not allowed to access, You are not admin")
//             }
//             else res.status(404).send("No user with that username");    
//         } catch (error) {
//             console.log(error.message);
//             res.status(404).send("You got an error" + error.message);
//         }
//     })
admin_get_router.get('/student/:id', verifyTokenAdmin, async (req, res) =>{
    // because of unique id value, so this api just returns 1 or no value.
        try {
            var role = req.role;
            if(req.username) {
                if(role){
                    const id  =  req.params.id;
                    if(!id || typeof(id) === 'undefined') {
                        res.send("No user params");
                    } else {
                        {   
                            const studentQuery = "SELECT * FROM students WHERE student_id = ?";
                            const registrationBachelorThesisQuery = "SELECT * FROM registrations_for_bachelor_thesis WHERE student_id = ?";
                            const assessmentBachelorThesisQuery = "SELECT * FROM assessment_for_bachelor_thesis WHERE student_id = ?";
                            const registrationOralDefenseQuery = "SELECT * FROM registrations_for_oral_defense WHERE student_id = ?";
                            const assessmentOralDefenseQuery = "SELECT * FROM assessment_for_oral_defense WHERE student_id = ?";
                            const queryParams = [id];
                            const studentResults = await executeQuery(res, studentQuery, queryParams);
                            const registrationBachelorThesisResults = await executeQuery(res, registrationBachelorThesisQuery, queryParams);
                            const assessmentBachelorThesisResults = await executeQuery(res, assessmentBachelorThesisQuery, queryParams);
                            const registrationOralDefenseResults  = await executeQuery(res, registrationOralDefenseQuery, queryParams);
                            const assessmentOralDefenseResults = await executeQuery(res, assessmentOralDefenseQuery, queryParams);
                            res.send(
                                {studentResults, registrationBachelorThesisResults, assessmentBachelorThesisResults, registrationOralDefenseResults, assessmentOralDefenseResults})  
                        }
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

admin_get_router.post('/theses', verifyTokenAdmin, async (req, res) =>{
    try {
        var chunkForPage = 5;
        var page = (req.body.page === "" || req.body.page === undefined) ?  1 : req.body.page;
        var thesisId  = (req.body.thesisId === "" || req.body.thesisId === undefined) ?  '%' : ('%' + req.body.thesisId +'%');
        var slot = (req.body.slot === "" || req.body.slot === undefined) ?  '%' : ('%' + req.body.slot  + '%');
        var slotMaximum = (req.body.slotMaximum === "" || req.body.slotMaximum === undefined) ?  '%' : ('%' + req.body.slotMaximum  + '%');
        var thesisTopic = (req.body.thesisTopic === "" || req.body.thesisTopic === undefined) ?  '%' : ('%' + req.body.thesisTopic  + '%');
        var lecturer1_id = (req.body.lecturer1_id === "" || req.body.lecturer1_id === undefined) ? '%' : ('%' + req.body.lecturer1_id + '%');
        var lecturer2_id = (req.body.lecturer2_id === "" || req.body.lecturer2_id === undefined) ? '%' : ('%' + req.body.lecturer2_id + '%');
        var lecturer1_title = (req.body.lecturer1_title === "" || req.body.lecturer1_title === undefined) ? '%' : ('%' + req.body.lecturer1_title + '%');
        var lecturer2_title = (req.body.lecturer2_title === "" || req.body.lecturer2_title === undefined) ? '%' : ('%' + req.body.lecturer2_title + '%');
        var role = req.role;
        if(req.username) {
            if(role){
                {  
                    var filterQuery = "CALL getTheses(?, ?, ?, ?, ?, ?, ?, ?)";
                    const results = await new Promise((resolve) => {
                        db.query(filterQuery, [thesisId, thesisTopic, lecturer1_id, lecturer2_id, slot, slotMaximum, lecturer1_title, lecturer2_title], (err, result) => {                            if(err) {res.send(err);}
                            else
                            {  
                            resolve(JSON.parse(JSON.stringify(result)))
                            }
                        })
                        })
                     //return status server response
                    var dbResults = results.pop();
                    for (let i = 0; i < dbResults.length; i++) {
                        results[i]["thesis_id"].toString();
                    }
                    console.log(results);
                    if(page > results[0].chunk(chunkForPage).length){
                        res.send({
                            "totalPage" : results[0].chunk(chunkForPage).length,
                            "list" : []
                        })
                    }
                    else {res.send({
                        "totalPage" : results[0].chunk(chunkForPage).length,
                        "list" : results[0].chunk(chunkForPage)[page-1]
                    })}
                }
            }
            else res.send("You are not allowed to access, You are not admin")
        }   
    } catch (error) {
        res.status(404).send(error.message);
    }
})
admin_get_router.get('/thesis/:id', verifyTokenAdmin, async (req, res) =>{
    // because of unique id value, so this api just returns 1 or no value.
        try {
            var role = req.role;
            if(req.username) {
                if(role){
                    const thesisId  =  req.params.id;
                    if(!thesisId || typeof(thesisId) === 'undefined') {
                        res.send("No thesis params");
                    } else {
                        {
                            var filterQuery = "call getThesisInfoById(?)";
                            const results = await new Promise((resolve) => {
                                db.query(filterQuery, [thesisId], (err, result) => {
                                    if(err) {res.send(err);}
                                    else
                                    {  resolve(JSON.parse(JSON.stringify(result)))}
                                })
                                })
                            var dbResults = results.pop();
                            res.send(results[0]);
                        }
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
admin_get_router.get('/testForm/:id', verifyTokenAdmin, async (req, res) =>{
// because of unique id value, so this api just returns 1 or no value.
    try {
        var studentId = req.params.id;
        var role = req.role;
        if(req.username && req.userId) {
            if(role){
                if(req.userId === undefined || req.userId === ""){
                    res.status(404).send("Invalid username with that id")
                } else if(!(req.userId) === "number"){
                    res.status(404).send("Need a number Parameter Id");
                } else {
                    const query = "CALL getThesisFromStudentId(?)";
                    const queryParams = [studentId];
                    const results = await executeQuery(res, query, queryParams);
                    const registrationBachelorThesisQuery = "SELECT * FROM registrations_for_bachelor_thesis WHERE student_id  = ?";
                    const queryParamsRegistrationBachelorThesis = [studentId]
                    const registrationBachelorThesisResults = await executeQuery(res, registrationBachelorThesisQuery,  queryParamsRegistrationBachelorThesis);
                    
                    const assessmentBachelorThesisQuery = "SELECT * FROM assessment_for_bachelor_thesis WHERE student_id  = ?";
                    const queryParamsAssessmentBachelorThesisQuery = [studentId];
                    const assessmentBachelorThesisResults = await executeQuery(res, assessmentBachelorThesisQuery, queryParamsAssessmentBachelorThesisQuery);

                    const registrationOralDefenseQuery = "SELECT * FROM registrations_for_oral_defense WHERE student_id  = ?";
                    const queryParamsRegistrationOralDefense = [studentId]
                    const registrationOralDefenseResults = await executeQuery(res, registrationOralDefenseQuery,  queryParamsRegistrationOralDefense);  
                    
                    
                    const assessmentOralDefenseQuery = "SELECT * FROM assessment_for_oral_defense WHERE student_id  = ?";
                    const queryParamsAssessmentOralDefense = [studentId]
                    const assessmentOralDefenseResults = await executeQuery(res, assessmentOralDefenseQuery,  queryParamsAssessmentOralDefense);  
                    results.pop();
                    var studentList = [];
                    for(var i = 0; i < results[0].length; i++){
                        // var studentList = {"student_id" : results[0][i].student_id, "fullName" : results[0][i].fullname, "intake" : results[0][i].intake, "email" : results[0][i].email, "confirmSup1" : results[0][i].confirm_sup1}
                        studentList.push({"student_id" : results[0][i].student_id, "fullName" : results[0][i].fullname, "intake" : results[0][i].intake, "email" : results[0][i].email, "confirmSup1" : results[0][i].confirm_sup1});
                        results[0][i]["student_list"] = studentList;
                        delete results[0][i]["student_id"];
                        delete results[0][i]["fullname"];
                        delete results[0][i]["intake"];
                        delete results[0][i]["student_id"];
                        delete results[0][i]["confirm_sup1"];
                    }
                    results[0]["student_list"] = studentList;
                    res.send({"student_id" : studentId, "list" : results[0], registrationBachelorThesisResults, registrationOralDefenseResults, assessmentBachelorThesisResults, assessmentOralDefenseResults});
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

admin_get_router.get('/lecturer', (req, res) => {
    res.send("Default routes for admin/get/lecturer");
})
admin_get_router.get('/student', (req, res) => {
    res.send("Default routes for admin/get/student");
})
admin_get_router.get('/thesis', (req, res) => {
    res.send("Default routes for admin/get/thesis");
})



function checkTypeToSearch (value) {
    if( value === "" || value === undefined){
        return '%';
   }
   else { return ('%' + value +'%')}
}
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
// Exports cho biến admin_router
module.exports = admin_get_router;
