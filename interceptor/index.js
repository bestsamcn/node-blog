var AdminModel = require('../model').AdminModel;
var CountModel = require('../model').CountModel;
var redisClient = require('../model/connect').redisClient;
var jwt = require('jwt-simple');
var GLOBAL_CONFIG = require('../config');
var $$ = require('../tools');
var Q = require('q');


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
	if(!token || token === 'null' || token === 'undefined'){
		req.user = {};
		req.isLogin = false;
		req.token = null;
		return next();
	}

	redisClient.get(token, function(err, tok){
		if(err){
			console.log(err,'fffffffffffff')
			res.sendStatus(500);
			return;
		}
		//如果token已经在redis中，则该token已经无效
		if(tok){
			res.json({retCode:10006, msg:'凭证无效，请重新登录', data:null});
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

//用户访问日志
var _accessCount = function(req,res,next){
	var _url = req.path;
	var _ip = req.ip !== '::1' &&　$$.getClientIp(req).match(/\d+\.\d+\.\d+\.\d+/)[0] || '127.0.0.1';
	var token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'] || '';

	//是否是管理员
	var _isAdmin = function(){
		var defer = Q.defer();
		if(!token || token === 'null' || token === 'undefined') {
			defer.resolve();
			return defer.promise;
		};
		var _userID = jwt.decode(token, GLOBAL_CONFIG.TOKEN_SECRET).iss;
		AdminModel.findById({_id:_userID}, function(ferr, fdoc){
			if(ferr){
				return next(500);
			}
			if(!fdoc){
				return defer.resolve();
			}
			return next();
		});
		return defer.promise;
	}

	//获取地址
	var _getAddress = function(){
		var defer = Q.defer();

		$$.getIpInfo(_ip, function(err, res){
			if(err){
				console.log(err,'获取城市出错')
				return next();
			}
			var obj = {};
			if(res.ret == -1){
				obj.accessip = _ip;
				obj.apiName = _url;
				obj.address = {};
				obj.address.country = '国家';
				obj.address.province = '省份';
				obj.address.city = '城市';
				obj.address.district = '区域';
				defer.resolve(obj);
			}else{
				obj.accessip = _ip;
				obj.apiName = _url;
				obj.address.country = res.country;
				obj.address.city = res.city;
				obj.address.district = res.district;
				defer.resolve(obj);
			}
		});
		return defer.promise;
	}
	var _setInfo = function(obj){
		CountModel.create(obj ,function(err,doc){
			if(err){
				return next(err);
			}
			next();
		});
	}
	_isAdmin().then(_getAddress).then(_setInfo);
}

exports.expireToken = _expireToken;
exports.valifyToken = _valifyToken;
exports.checkAdminLogin = _checkAdminLogin;
exports.accessCount = _accessCount;