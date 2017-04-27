var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');
var interceptor = require('../../interceptor');
router.post('/create', adminService.create);
router.post('/login', interceptor.valifyToken, adminService.login);
router.get('/logout', interceptor.valifyToken, adminService.logout);

module.exports = router;
