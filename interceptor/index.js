var AdminModel = require('../model').AdminModel;
var jwt = require('jwt-simple');
var GLOBAL_CONFIG = require('../config');
var _getMe = function(req, res, next){
	var token = req.query['x-access-token'] || req.body['x-access-token'] || req.headers['x-access-token'] || null;
	if(!token){
		req.user = {};
		req.isLogin = false;
		req.token = null;
		return next();
	}
	var _userID = jwt.decode(token, GLOBAL_CONFIG.TOKEN_SECRET).iss;
	AdminModel.findById({_id:_userID}, function(err, doc){
		console.log(err)
		if(err){
			return next(500);
		}
		if(!doc){
			req.user = {};
			req.isLogin = false;
		}

		req.user = doc;
		req.isLogin = true;
		next();
	});
}
exports.getMe = _getMe;