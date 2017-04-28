var express = require('express');
var router = express.Router();
var tagService = require('./tag.service');
var interceptor = require('../../interceptor');


router.post('/add', interceptor.valifyToken, interceptor.checkAdminLogin, tagService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, tagService.delete);
router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, tagService.edit);
router.get('/getList', tagService.getList);

module.exports = router;