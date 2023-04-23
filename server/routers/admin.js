const express = require('express');
const admin_router = express.Router();
const admin_get_router = require('./admin/admin_get');
const admin_add_router = require('./admin/admin_add');
const admin_update_router = require('./admin/admin_update');
const admin_delete_router = require('./admin/admin_delete');
const admin_assign_router = require('./admin/admin_assign');
const db = require('../db/connectDB');
admin_router.use('/get', admin_get_router);
admin_router.use('/add', admin_add_router);
admin_router.use('/update', admin_update_router);
admin_router.use('/delete', admin_delete_router);
admin_router.use('/assign', admin_assign_router);
// Exports cho biến admin_router
module.exports = admin_router;