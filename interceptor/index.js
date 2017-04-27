var AdminModel = require('../model').AdminModel;
var redisClient = require('../model/connect').redisClient;
var jwt = require('jwt-simple');
var GLOBAL_CONFIG = require('../config');


//将用户退出后的token保存到redis，指定时间后自动删除
var _expireToken = function(token){
	if(!!token){
		redisClient.set(token, {is_expired:true});
		//单位秒
		redisClient.expire(token, GLOBAL_CONFIG.TOKEN_EXPIRES*24*60*60);
	}
}

//检测token,获取当前用户,如果在redis中检测到token证明该用户已经退出了，当前token无效
var _valifyToken = function(req, res, next){
	var token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'];
	if(!token){
		req.user = {};
		req.isLogin = false;
		req.token = null;
		return next();
	}

	redisClient.get(token, function(err, tok){
		if(err){
			res.sendStatus(500);
			res.end();
			return;
		}
		//如果token已经在redis中，则该token已经无效
		if(tok){
			res.json({retCode:10006, msg:'凭证无效，请重新登录', data:null});
			res.end();
			return;
		}
		var _userID = jwt.decode(token, GLOBAL_CONFIG.TOKEN_SECRET).iss;
		AdminModel.findById({_id:_userID} ,`-password`, function(ferr, fdoc){
			if(!!err){
				return next(500);
			}
			if(!fdoc){
				req.user = {};
				req.isLogin = false;
				res.json({retCode:10003, msg:'查找无该用户', data:null});
				return;
			}
			req.user = fdoc;
			req.isLogin = true;
			req.token = token;
			return next();
		});
	});
}

//查看是否是管理员登录
var _checkAdminLogin = function(req, res, next){
	if(!req.isLogin || !req.user || req.user.userType < 2){
        res.json({retCode:10009, msg:'你无权限', data:null});
        res.end();
        return;
    }
    next();
}

exports.expireToken = _expireToken;
exports.valifyToken = _valifyToken;
exports.checkAdminLogin = _checkAdminLogin;