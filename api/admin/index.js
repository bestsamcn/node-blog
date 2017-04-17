var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');

router.post('/createAdmin', adminService.createAdmin);

module.exports = router;
