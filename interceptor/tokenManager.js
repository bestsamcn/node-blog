var redisClient = require('../model/connect').redisClient;
var 
var _setToken = function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
}