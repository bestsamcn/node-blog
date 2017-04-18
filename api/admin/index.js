var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');

router.post('/createAdmin', adminService.createAdmin);
router.post('/adminLogin', adminService.adminLogin);

module.exports = router;
