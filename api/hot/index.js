var express = require('express');
var router = express.Router();
var hotService = require('./hot.service');
var interceptor = require('../../interceptor');


router.post('/add', hotService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, hotService.delete);
router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, hotService.edit);
router.get('/getList', hotService.getList);

module.exports = router;