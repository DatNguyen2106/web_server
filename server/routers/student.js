const express = require('express');
const student_router = express.Router();
const db = require('./../db/connectDB')

const student_get_router = require('./student/student_get');
const student_registrationBachelorThesis_router = require('./student/student_registrationBachelorThesis')
const student_registrationOralDefense_router = require('./student/student_registrationOralDefense');
const student_assessmentBachelorThesis_router = require('./student/student_assessmentBachelorThesis');
const student_assessmentOralDefense_router = require('./student/student_assessmentOralDefense');
const student_update_router = require('./student/student_update')
const student_add_router = require('./student/student_add');
student_router.use('/get', student_get_router);
student_router.use('/update', student_update_router);
student_router.use('/add', student_add_router);
student_router.use('/registrationBachelorThesis', student_registrationBachelorThesis_router);
student_router.use('/registrationOralDefense', student_registrationOralDefense_router);
student_router.use('/assessmentBachelorThesis', student_assessmentBachelorThesis_router);
student_router.use('/assessmentOralDefense', student_assessmentOralDefense_router);
module.exports = student_router;