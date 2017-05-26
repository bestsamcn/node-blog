
var AdminModel = require('../../model').AdminModel;
var crypto = require('crypto');
var Q = require('q');
var _ = require('lodash');
var $$ = require('../../tools');
var jwt = require('jwt-simple');
var GLOBAL_CONFIG = require('../../config');
var interceptor = require('../../interceptor');
var CountModel = require('../../model').CountModel;
var CommentModel = require('../../model').CommentModel;
var MessageModel = require('../../model').MessageModel;

/**
 * 创建管理员
 * @param  [string} account 用户名
 * @param  {string} password 用户密码
 * @return {object}     返回对象
 */
var _create = function(req, res){
	var _account = req.body.account;
	var _password = req.body.password;
	if(/\s/.test(_account) || /\s/.test(_password)){
		res.json({retCode:10004, msg:'用户名和密码不能有空格', data:null});
		res.end();
		return;
	}
	_account = _.trim(_account);
	_password = _.trim(_password);
	var sha1 = crypto.createHash('sha1');
	if(!_account || _account.length < 2){
		res.json({retCode:10001, msg:'用户名不能少于两位', data:null});
		res.end();
		return;
	}
	if(!_password || _password.length < 6){
		res.json({retCode:10002, msg:'密码不能少于6位', data:null});
		res.end();
		return;
	}
	//是否已经存在该用户名
	var _isExistAccount = function(){
		var defer = Q.defer();
		AdminModel.findOne({account:_account}, function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}
			if(!!fdoc){
				res.json({retCode:10003, msg:'用户名已经存在', data:null});
				res.end();
				return;
			}
			defer.resolve();
		});
		return defer.promise;
	}

	//创建用户
	var _createAccount = function(){

		_password = sha1.update(_password).digest('hex');
		var _createIp = req.ip !== '::1' &&　$$.getClientIp(req).match(/\d+\.\d+\.\d+\.\d+/)[0] || '';
		var entity = {
			account:_account,
			password:_password,
			createLog:{
				createTime:Date.now(),
				createIp:_createIp
			}
		}
		AdminModel.create(entity, function(cerr, cdoc){
			if(cerr || !cdoc){
				res.sendStatus(500);
				res.end();
				return;
			}
			res.json({retCode:0, msg:'创建成功', data:null});
			res.end();
		});
	}
	_isExistAccount().then(_createAccount)
}

/**
 * 管理员登录
 * @param  {string} account 用户名 
 * @param  {string} password  密码
 * @param  {number} expires 保持登录天数 
 * @return {object}    返回对象 
 */
var _login = function(req, res){
	var token = req.body['x-access-token'] || req.query['x-access-token'] || req.headers['x-access-token'];
	if(req.token === token){
		res.json({retCode:10008, msg:'你已登录', data:null});
		res.end();
		return;
	}
	var _account = req.body.account;
	var _password = req.body.password;
	var _expires = req.body.expires;
	_account = _.trim(_account);
	_password = _.trim(_password);
	_expires = _expires*1 || 3;
	//是否已经存在该用户名
	var _isExistAccount = function(){
		var defer = Q.defer();
		AdminModel.findOne({account:_account}, function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}
			if(!fdoc){
				res.json({retCode:10023, msg:'用户名不存在', data:null});
				res.end();
				return;
			}
			defer.resolve(fdoc);
		});
		return defer.promise;
	}

	//对比密码
	var _isEqualToPassword = function(fdoc){
		var defer = Q.defer();
		var sha1 = crypto.createHash('sha1');
		_password = sha1.update(_password).digest('hex');
		if(fdoc.userType < 2){
			res.json({
				retCode:10009,
				msg:'你无登录权限',
				data:null
			});
			res.end();
			return;
		}
		if(_password !== fdoc.password){
			res.json({retCode:10005, msg:'密码错误', data:null});
			res.end();
			return;
		}
		defer.resolve(fdoc);
		return defer.promise;
	}

	//更新最后登录时间，并返回token
	var _updateAndReturn = function(fdoc){
		var oneDay = 1000*60*60*24;
		_expires = new Date().getTime() + _expires * oneDay;
		var _userID = fdoc._id.toString();
		var _token = jwt.encode({iss:_userID, exp:_expires}, GLOBAL_CONFIG.TOKEN_SECRET);
		res.json({retCode:0, msg:'登录成功', token:_token, expires:_expires, data:fdoc});
		res.end();
	}
	_isExistAccount().then(_isEqualToPassword).then(_updateAndReturn);
}

/**
 * 退出登录
 */
var _logout = function(req, res){
	var token = req.token;
	interceptor.expireToken(token);
	req.token = null;
	req.user = null;
	req.isLogin = null;
	res.json({retCode:0, msg:'退出成功', data:null});
}

/**
 * 获取访问记录
 * @param {number} pageIndex 起始页
 * @param {number} pageSize 页体积
 * @param {number} type 1是查询全部， 2是查询昨天, 3是今天的
 * @param {string} ip 根据ip查询
 * @param {string} keyword 根据关键字查询
 */
var _getAccessList = function(req, res){
	var _pageIndex = parseInt(req.query.pageIndex) -1 || 0;
    var _pageSize = parseInt(req.query.pageSize) || 10;
    var _keyword = req.query.keyword;
    var _type= req.query.type;
    var filterObj = {};
    if(!!_keyword){
    	_keyword = decodeURI(_keyword);
        console.log(_keyword)
        var reg = new RegExp(_keyword, 'gim');
    	filterObj.$or = [
    		{
                'country':{
                    $regex:reg
                }
            },
            {
                'province':{
                    $regex:reg
                }
            },
            {
                'city':{
                    $regex:reg
                }
            },
            {
                'accessip':{
                    $regex:reg
                }
            }
    	]
    }

    //获取今天凌晨时间戳
    var nowDate = new Date();
    nowDate.setHours(0)
    nowDate.setMinutes(0)
    nowDate.setSeconds(0)
    nowDate.setMilliseconds(0)
    var todayTime = nowDate.getTime();

    //一天的时间戳长度
    var oneDayTime = 1000 * 60 * 60 * 24;
    //昨天的整天的时间戳范围是(todayTime-oneDayTime)<= yestodayTime < todayTime
    var yestodayTime = todayTime - oneDayTime;
    var todayTimeRange = todayTime + oneDayTime;
    if(!!_type && _type == 2){
    	filterObj.createTime = {
    		$gt: yestodayTime,
    		$lte: todayTime
    	}
    }
    if(!!_type && _type == 3){
    	filterObj.createTime = {
    		$gt: todayTime,
    		$lte: todayTimeRange
    	}
    }

    //计算记录总数
    var _getTotal = function() {
        var defer = Q.defer();
        CountModel.count(filterObj, function(cerr, ctotal) {
            if (cerr) {
                res.sendStatus(500);
                return;
            }
            var obj = {
            	_total:ctotal
            }
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //获取分页
    var _return = function(obj){

    	CountModel.find(filterObj).skip(_pageIndex * _pageSize).limit(_pageSize).sort({'createTime':-1}).exec(function(err, list){
	    	if(err){
	    		return res.sendStatus(500);
	    	}
	    	res.json({retCode:0, msg:'查询成功', data:list, total:obj._total, pageIndex:_pageIndex+1, pageSize:_pageSize});
	    });
    }

    _getTotal().then(_return);
}

/**
 * 删除访问记录
 */
var _delAccess = function(req, res) {
	var count_id = req.query.id;
	if (!count_id || count_id.length !== 24) {
		res.json({
			retCode: 10018,
			msg: '查找无该记录',
			data: null
		});
		res.end();
		return;
	}
	CountModel.findByIdAndRemove(count_id, function(rerr, rdoc) {
		if (rerr) {
			res.sendStatus(500);
			return;
		}

		res.json({
			retCode: 0,
			msg: '删除成功',
			data: null
		});
		res.end();
	});
}

/**
 * 获取各种需要总数
 */
var _getPreviewTotal = function(req, res){
	//获取今天凌晨时间戳
	var nowDate = new Date();
    nowDate.setHours(0)
    nowDate.setMinutes(0)
    nowDate.setSeconds(0)
    nowDate.setMilliseconds(0)
    var todayTime = nowDate.getTime();

    //一天的时间戳长度
    var oneDayTime = 1000 * 60 * 60 * 24;

	//今天评论总数
	var _getAccessTotal = function(){
		var defer = Q.defer();
		CommentModel.count({'createLog.createTime':{$gt: todayTime, $lte: Date.now()}}, function(err, total){
			if(err){
				res.sendStatus(500);
				return;
			}
			var obj = {
				todayComment:total
			}
			defer.resolve(obj);
		});
		return defer.promise;
	}

	//今天访问总数
	var _getYestodayTotal = function(obj){
		var defer = Q.defer();
		
	    //昨天的整天的时间戳范围是(todayTime-oneDayTime)<= yestodayTime < todayTime
	    CountModel.count({createTime:{$gt: todayTime, $lte: Date.now()}}, function(err, total){
			if(err){
				res.sendStatus(500);
				return;
			}
			
			obj.accessTodayTotal = total
			defer.resolve(obj);
		});
		return defer.promise;
	}

	//未读消息
	var _getUnreadMessage = function(obj){
		MessageModel.count({isRead:false}, function(err, total){
			if(err){
				return res.sendStatus(500);
			}
			obj.unreadMessageTotal = total;
			res.json({retCode:0, msg:'查询成功', data:obj});
		});
	}
	_getAccessTotal().then(_getYestodayTotal).then(_getUnreadMessage);

}

exports.create = _create;
exports.login = _login;
exports.logout = _logout;
exports.getAccessList = _getAccessList;
exports.getPreviewTotal = _getPreviewTotal;
exports.delAccess = _delAccess;
