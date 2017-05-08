var express = require('express');
var router = express.Router();
var commentService = require('./comment.service');
var interceptor = require('../../interceptor');


router.post('/add', commentService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, commentService.delete);
// router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, commentService.edit);
router.get('/getList', commentService.getList);
router.post('/like', commentService.like);

module.exports = router;