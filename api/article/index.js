var express = require('express');
var router = express.Router();
var articleService = require('./article.service');
var interceptor = require('../../interceptor');


router.post('/add', interceptor.valifyToken, interceptor.checkAdminLogin, articleService.add);
router.get('/delete', interceptor.valifyToken, interceptor.checkAdminLogin, articleService.delete);
router.post('/edit', interceptor.valifyToken, interceptor.checkAdminLogin, articleService.edit);
router.get('/getList', articleService.getList);
router.get('/getDetail', articleService.getDetail);
router.post('/like', articleService.like);
router.get('/getDiffArticle', articleService.getDiffArticle);
router.post('/addPoster', interceptor.valifyToken, interceptor.checkAdminLogin, articleService.addPoster);

module.exports = router;