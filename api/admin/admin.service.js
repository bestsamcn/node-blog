
var AdminModel = require('../../model').AdminModel;
var crypto = require('crypto');
var Q = require('q');
var _ = require('lodash');
var $$ = require('../../tools');
var jwt = require('jwt-simple');
var GLOBAL_CONFIG = require('../../config');

/**
 * 创建管理员
 * @param  [string} account 用户名
 * @param  {string} password 用户密码
 * @return {object}     返回对象
 */
var _createAdmin = function(req, res){
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
var _adminLogin = function(req, res){

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
				res.json({retCode:10003, msg:'用户名不存在', data:null});
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
				retCode:10004,
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
		var _token = jwt.encode({iss:_userID, exp:_expires}, GLOBAL_CONFIG.TOKEN_SECRECT);
		res.json({retCode:0, msg:'登录成功', token:_token, expires:_expires, data:fdoc});
		res.end();
	}
	_isExistAccount().then(_isEqualToPassword).then(_updateAndReturn);
}


exports.createAdmin = _createAdmin;
exports.adminLogin = _adminLogin;