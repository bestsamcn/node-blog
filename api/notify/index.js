var express = require('express');
var router = express.Router();
var notifyService = require('./notify.service');
var interceptor = require('../../interceptor');

router.post('/add', interceptor.valifyToken, interceptor.checkAdminLogin, notifyService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, notifyService.delete);
router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, notifyService.edit);
router.get('/getList', notifyService.getList);
router.get('/getLatestActive', notifyService.getLatestActive);

module.exports = router;