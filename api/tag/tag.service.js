var _ = require('lodash');
var TagModel = require('../../model').TagModel;
var Q = require('q');
var Mongoose = require('mongoose');
var tools = require('../../tools');
var ObjectId = Mongoose.Types.ObjectId;

/**
 * 添加标签
 * @param {string} name 标签名称
 * @return 标签实体 
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
 		TagModel.findOne({name:_name}, function(err, doc){
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

 	//创建标签
 	var __create = function(){
 		var entity = {
 			name:_name,
	 		createTime:Date.now()
	 	}
	 	TagModel.create(entity, function(err, doc){
	 		if(err){
	 			res.sendStatus(500);
	 			return;
	 		}
	 		res.json({retCode:0, msg:'创建成功', data:doc});
	 	});
 	}
 	__isExist().then(__create);
}

/**
 * 删除标签
 * @param {string} id 标签id
 */
var _delete = function(req, res){
	var _tagID = req.query.id;
	_tagID = new ObjectId(_tagID);
	if(!tools.isObjectID(_tagID)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}

	//检测是否存在
	var __isExist = function(){
 		var defer = Q.defer();
 		TagModel.findOne({_id:_tagID}, function(err, doc){
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
 		TagModel.remove({_id:_tagID}, function(err, rem){
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
 * 修改标签
 * @param {string} id  标签id 
 */
var _edit = function(req, res){
	var _tagID = req.body.id;
	var _name = req.body.name;
	if(!tools.isObjectID(_tagID)){
		res.json({retCode:10012, msg:'id无效', data:null});
		return;
	}

	//检测是否存在
	var __isIDExist = function(){
 		var defer = Q.defer();
 		TagModel.findOne({_id:_tagID}, function(err, doc){
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
 		TagModel.findOne({name:_name}, function(err, doc){
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
 		TagModel.update({_id:_tagID}, {$set:{name:_name, createTime:Date.now()}}, function(err, upt){
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
 * 查标签
 */
var _getList = function(req, res){
	console.log('sdfsadfsafsf')
	TagModel.find().sort({_id:'-1'}).exec(function(err, flist){
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