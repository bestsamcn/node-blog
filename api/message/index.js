var express = require('express');
var router = express.Router();
var messageService = require('./message.service');
var interceptor = require('../../interceptor');

//新增留言
router.post('/add',messageService.add);
router.get('/getList', interceptor.valifyToken, interceptor.checkAdminLogin, messageService.getList);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, messageService.delete);
router.get('/getAdjoin', interceptor.valifyToken, interceptor.checkAdminLogin, messageService.getAdjoin);
router.get('/getDetail', interceptor.valifyToken, interceptor.checkAdminLogin, messageService.getDetail);
router.get('/getUnreadList', interceptor.valifyToken, interceptor.checkAdminLogin, messageService.getUnreadList);


module.exports = router;