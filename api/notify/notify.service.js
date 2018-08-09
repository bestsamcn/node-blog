var _ = require('lodash');
var NotifyModel = require('../../model').NotifyModel;
var Q = require('q');
var Mongoose = require('mongoose');
var tools = require('../../tools');
var ObjectId = Mongoose.Types.ObjectId;
var GLOBAL_CONFIG = require('../../config');

/**
 * 添加
 * @param {string} content 通告内容
 * @param {string} expireTime 通告超时
 * @param {number} isActive 是否激活0,1
 * @return 通告实体 
 */
var _add = function(req, res){

 	var _content = req.body.content;
 	var _expireTime = req.body.expireTime;
 	var _isActive = req.body.isActive || 0;
 	_content = _.trim(_content);
 	_expireTime = _.trim(_expireTime);
 	_isActive = _.trim(_isActive);
 	if(!_content){
 		res.json({retCode:10026, msg:'内容不能为空', data:null});
 		return;
 	}
 	if(!_expireTime){
 		res.json({retCode:10027, msg:'超时不能为空', data:null});
 		return;
 	}
 	if(!_isActive){
 		res.json({retCode:10028, msg:'是否激活不能为空', data:null});
 		return;
 	}


 	//创建通告
 	var __create = function(){
 		var entity = {
 			content:_content,
 			expireTime:_expireTime,
 			isActive:_isActive,
	 		createTime:new Date(),
	 		lastEditTime:new Date()
	 	}

	 	NotifyModel.create(entity, function(err, doc){
	 		if(err) return res.sendStatus(500);
	       	res.json({retCode:0, msg:'创建成功', data:doc});
	 	});
 	}
 	__create();
}

/**
 * 删除通告
 * @param {string} id 通告id
 */
var _delete = function(req, res){
	var _notifyId = req.query.id;
	_notifyId = new ObjectId(_notifyId);
	if(!tools.isObjectID(_notifyId)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}

	//检测是否存在
	var __isExist = function(){
 		var defer = Q.defer();
 		NotifyModel.findOne({_id:_notifyId}, function(err, doc){
 			if(err){
 				res.sendStatus(500);
 				return;
 			}
 			if(!doc){
 				res.json({retCode:10011, msg:'查询无此记录', data:null});
 				return;
 			}
 			defer.resolve();
 		});
 		return defer.promise;
 	}

 	//删除
 	var __del = function(){
 		NotifyModel.remove({_id:_notifyId}, function(err, rem){
 			if(err || !rem.result.ok || rem.result.n != 1){
 				res.sendStatus(500);
 				return;
 			}
 			res.json({retCode:0, msg:'删除成功', data:null});
 		});
 	}
	__isExist().then(__del);
}

/**
 * 修改通告
 * @param {string} id  通告id 
 */
var _edit = function(req, res){
	var _notifyId = req.body.id;
	var _content = req.body.content;
	var _expireTime = req.body.expireTime;
	var _isActive = req.body.isActive;
	if(!tools.isObjectID(_notifyId)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}
	if(!_content){
 		res.json({retCode:10026, msg:'内容不能为空', data:null});
 		return;
 	}
 	if(!_expireTime){
 		res.json({retCode:10027, msg:'超时不能为空', data:null});
 		return;
 	}

	//检测是否存在
	var __isIDExist = function(){
 		var defer = Q.defer();
 		NotifyModel.findOne({_id:_notifyId}, function(err, doc){
 			if(err){
 				res.sendStatus(500);
 				return;
 			}
 			if(!doc){
 				res.json({retCode:10011, msg:'查询无此记录', data:null});
 				return;
 			}
 			defer.resolve();
 		});
 		return defer.promise;
 	}


 	//修改
 	var __edit = function(){
 		let obj = {
 			content:_content,
 			expireTime:_expireTime,
 			isActive:_isActive,
	 		lastEditTime:new Date()
 		}
 		NotifyModel.update({_id:_notifyId}, {$set:obj}, function(err, upt){
 			if(err || !upt.ok || upt.n != 1){
 				res.sendStatus(500);
 				return;
 			}
		 	res.json({retCode:0, msg:'更新成功', data:null});
 		});
 	}
 	__isIDExist().then(__edit);
}
 
/**
 * 查通告
 */
/**
* @param {number} pageIndex 
* @param {number} pageSize 
* @param {bool} _isActive 
* @param {string} keyword 关键字 
 */
var _getList = function(req, res, next) {
	var _pageIndex = parseInt(req.query.pageIndex) - 1 || 0,
		_pageSize = parseInt(req.query.pageSize) || 10;
	var _isActive = req.query.isActive;
	var _keyword = req.query.keyword;
	var filterObj = {};


	//过滤
	if(req.query.hasOwnProperty('isActive')){
		filterObj.isActive = _isActive;
	}

    //搜索
    if(typeof _keyword){
    	_keyword = decodeURI(_keyword);
    	filterObj.content = new RegExp(_keyword,'gim');
    }

	//获取分页数据
	var __getList = function() {
			var defer = Q.defer();
			NotifyModel.find(filterObj).sort({
				_id: -1
			}).skip(_pageIndex * _pageSize).limit(_pageSize).exec(function(ferr, flist) {
				if (ferr) {
					res.sendStatus(500);
					res.end();
					return;
				}
				var obj = {
					pageIndex: _pageIndex,
					pageSize: _pageSize,
					flist: flist
				}
				defer.resolve(obj);
			});
			return defer.promise;
		}

	//计算记录总数
	var __getTotal = function(obj) {
		NotifyModel.count(filterObj, function(cerr, ctotal) {
			if (cerr) {
				res.sendStatus(500);
				res.end();
				return;
			}
			res.json({
				retCode: 0,
				msg: '查询成功',
				data: obj.flist,
				pageIndex: obj.pageIndex + 1,
				pageSize: obj.pageSize,
				total: ctotal
			});
			res.end();
		});
	}
	__getList().then(__getTotal);
}


var _getLatestActive = function(req, res){
	var _now = new Date().getTime();

	NotifyModel.find({isActive:true, createTime:{$lt:_now}, expireTime:{$gt:_now}}).sort({_id:-1}).limit(1).exec(function(err, doc){
		if (err) {
			res.sendStatus(500);
			res.end();
			return;
		}
		let obj = !!doc.length && doc[0] || null;
		res.json({
			retCode: 0,
			msg: '查询成功',
			data: obj,
		});
	})
}

exports.add = _add;
exports.delete = _delete;
exports.edit = _edit;
exports.getList = _getList;
exports.getLatestActive = _getLatestActive;