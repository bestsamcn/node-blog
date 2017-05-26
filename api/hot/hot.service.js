var _ = require('lodash');
var HotModel = require('../../model').HotModel;
var Q = require('q');
var Mongoose = require('mongoose');
var tools = require('../../tools');
var ObjectId = Mongoose.Types.ObjectId;
var GLOBAL_CONFIG = require('../../config');

/**
 * 添加
 * @param {string} name 热词名称
 * @return 热词实体 
 */
var _add = function(req, res){
 	var _name = req.body.name;
 	_name = _.trim(_name);
 	if(!_name){
 		res.json({retCode:10007, msg:'名称不能为空', data:null});
 		return;
 	}
 	//检测重复
 	var __isExist = function(){
 		var defer = Q.defer();
 		HotModel.findOne({name:_name}, function(err, doc){
 			if(err){
 				res.sendStatus(500);
 				return;
 			}
 			if(doc){
 				res.json({retCode:10013, msg:'名称重复', data:null});
 				return;
 			}
 			defer.resolve();
 		});
 		return defer.promise;
 	}

 	//计算数量
 	var _count = function(){
 		var defer = Q.defer();
 		HotModel.find({}).sort({hotCount:1, createTime:1}).exec(function(err, hlist){
            if(err) return res.sendStatus(500);
            if(hlist.length == GLOBAL_CONFIG.HOT_WORD_LENGTH ){
            	return HotModel.remove({_id:hlist[0]._id}, function(err, ret){
	                if(err) return res.sendStatus(500);
	                defer.resolve();
	            });
            }
	        defer.resolve();
        });
        return defer.promise;
 	}

 	//创建热词
 	var __create = function(){
 		var entity = {
 			name:_name,
 			hotCount:1,
	 		createTime:Date.now()
	 	}

	 	HotModel.create(entity, function(err, doc){
	 		if(err) return res.sendStatus(500);
	       	res.json({retCode:0, msg:'创建成功', data:doc, hotWordLength:GLOBAL_CONFIG.HOT_WORD_LENGTH});
	 	});
 	}
 	__isExist().then(__create);
}

/**
 * 删除热词
 * @param {string} id 热词id
 */
var _delete = function(req, res){
	var _hotID = req.query.id;
	_hotID = new ObjectId(_hotID);
	if(!tools.isObjectID(_hotID)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}

	//检测是否存在
	var __isExist = function(){
 		var defer = Q.defer();
 		HotModel.findOne({_id:_hotID}, function(err, doc){
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
 		HotModel.remove({_id:_hotID}, function(err, rem){
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
 * 修改热词
 * @param {string} id  热词id 
 */
var _edit = function(req, res){
	var _hotID = req.body.id;
	var _name = req.body.name;
	if(!tools.isObjectID(_hotID)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}

	//检测是否存在
	var __isIDExist = function(){
 		var defer = Q.defer();
 		HotModel.findOne({_id:_hotID}, function(err, doc){
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

 	var __isNameExist = function(){
 		var defer = Q.defer();
 		HotModel.findOne({name:_name}, function(err, doc){
 			if(err){
 				res.sendStatus(500);
 				return;
 			}
 			if(doc){
 				res.json({retCode:10013, msg:'名称重复', data:null});
 				return;
 			}
 			defer.resolve();
 		});
 		return defer.promise;
 	}

 	//修改
 	var __edit = function(){
 		HotModel.update({_id:_hotID}, {$set:{name:_name, createTime:Date.now()}}, function(err, upt){
 			if(err || !upt.ok || upt.n != 1){
 				res.sendStatus(500);
 				return;
 			}
		 	res.json({retCode:0, msg:'更新成功', data:null});
 		});
 	}
 	__isIDExist().then(__isNameExist).then(__edit);
}
 
/**
 * 查热词
 */
var _getList = function(req, res){
	HotModel.find().sort({_id:'-1'}).exec(function(err, flist){
		if(err){
			res.sendStatus(500);
			return;
		}
		res.json({retCode:0, msg:'查询成功', data:flist});
	});
}

exports.add = _add;
exports.delete = _delete;
exports.edit = _edit;
exports.getList = _getList;