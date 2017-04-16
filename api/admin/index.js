var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');

router.get('/createAdmin', adminService.createAdmin);

module.exports = router;
