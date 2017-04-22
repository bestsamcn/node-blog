var redisClient = require('../model/connect').redisClient;
var GLOBAL_CONFIG = require('../config');
var UserModel = require('../model').AdminModel;
var jwt = require('jwt-simple');
//将用户退出后的token保存到redis
var _expireToken = function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || null;
	if(!!token){
		redisClient.set(token, {is_expired:true});
		//单位秒
		redisClient.expire(token, GLOBAL_CONFIG.TOKEN_EXPIRE*24*60*60);
	}
	next();
}

//如果在redis中检测到token证明该用户已经退出了，当前token无效
var _valifyToken = function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || null;
	redisClient.get(token, function(err, tok){
		if(err){
			res.sendStatus(500);
			res.end();
			return;
		}
		if(tok){
			res.json({retCode:10006, msg:'权限不足', data:null});
			res.end();
			return;
		}
		var _userID = jwt.decode(token, GLOBAL_CONFIG.TOKEN_SECRET).iss;
		AdminModel.find({_id:_userID},`-password`, function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}
			if(!fdoc){
				res.json({retCode:10007, msg:'查询无该用户', data:null});
				res.end();
				return;
			}
			req.session.user = fdoc;
			next();
		});
	});
}