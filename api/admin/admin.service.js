
var AdminModel = require('../../model').AdminModel;
var crypto = require('crypto');
var Q = require('q');
var _ = require('lodash');
var $$ = require('../../tools');

/**
 * 创建管理员
 * @param  [string} account 用户名
 * @param  {string} password 用户密码
 * @return {object}     返回对象
 */
var _createAdmin = function(req, res){
	var _account = req.body.account;
	var _password = req.body.password;
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
		console.log(req.ip)
		var _createIp = req.ip !== '::1' &&　$$.getClientIp(req).match(/\d+\.\d+\.\d+\.\d+/)[0] || '';
		console.log('asdfasdf')
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

exports.createAdmin = _createAdmin;