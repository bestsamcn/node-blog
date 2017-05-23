var express = require('express');
var router = express.Router();
var adminService = require('./admin.service');
var interceptor = require('../../interceptor');
//生产环境移除用户创建入口
// router.post('/create', adminService.create);
router.post('/login', interceptor.valifyToken, adminService.login);
router.get('/logout', interceptor.valifyToken, adminService.logout);
router.get('/getAccessList', interceptor.valifyToken, adminService.getAccessList);
router.get('/delAccess', interceptor.valifyToken, adminService.delAccess);
router.get('/getPreviewTotal', interceptor.valifyToken, adminService.getPreviewTotal);

module.exports = router;
