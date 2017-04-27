var express = require('express');
var router = express.Router();
var articleService = require('./article.service');
var interceptor = require('../../interceptor');


router.post('/add', interceptor.valifyToken, interceptor.checkAdminLogin, articleService.add);

module.exports = router;