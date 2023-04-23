const express = require('express');
const lecturer2_router = express.Router();
const db = require('./../db/connectDB')
const lecturer2_get_router = require('./lecturer2/lecturer2_get');
const lecturer2_confirm_router = require('./lecturer2/lecturer2_confirm');
const lecturer2_signIn_router = require('./lecturer2/lecturer2_signIn');
const lecturer2_update_router = require('./lecturer2/lecturer2_update');
lecturer2_router.use('/get', lecturer2_get_router);
lecturer2_router.use('/update', lecturer2_update_router);
lecturer2_router.use('/confirm', lecturer2_confirm_router);
lecturer2_router.use('/signIn', lecturer2_signIn_router);
module.exports = lecturer2_router;