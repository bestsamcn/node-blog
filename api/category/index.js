var express = require('express');
var router = express.Router();
var categoryService = require('./category.service');
var interceptor = require('../../interceptor');


router.post('/add', interceptor.valifyToken, interceptor.checkAdminLogin, categoryService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, categoryService.delete);
router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, categoryService.edit);
router.get('/getList', categoryService.getList);

module.exports = router;