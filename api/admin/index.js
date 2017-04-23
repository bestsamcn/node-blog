var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');
var interceptor = require('../../interceptor');
router.post('/createAdmin', adminService.createAdmin);
router.post('/adminLogin', adminService.adminLogin);
router.get('/adminLogout', interceptor.getMe, adminService.adminLogout);

module.exports = router;
