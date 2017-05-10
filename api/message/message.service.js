/**
 * 留言服务模块
 */
var Q = require('q');
var MessageModel = require('../../model').MessageModel;
var xss = require('xss');

/**
 * @/api/message/add 用户访客留言接口
 * @name  {String, require} 用户名称必填
 * @email {String, require} 用户的邮箱
 * @content {String, require} 留言内容
 * @return { Object } 返回
 */

var _add = function(req, res) {
	var _name = req.body.name,
		_email = req.body.email,
		_content = req.body.content;
	if (!_name || _name.length < 2) {
		res.json({
			retCode: 10015,
			msg: '昵称长度不能少于两位',
			data: null
		});
		res.end();
		return;
	}
	if (!_email || !/^\w+@\w+\.\w+$/g.test(_email)) {
		res.json({
			retCode: 10016,
			msg: '邮箱格式不正确',
			data: null
		});
		res.end();
		return;
	}
	if (!_content || _content.length < 2) {
		res.json({
			retCode: 10017,
			msg: '内容长度不能少于6位',
			data: null
		});
		res.end();
		return;
	}

	var _xssContent = xss(_content);

	var MessageEntity = new MessageModel({
		name: _name,
		email: _email,
		content: _xssContent,
		postTime: Date.now()
	});
	MessageEntity.save(function(cerr, cdoc) {
		if (cerr) {
			res.sendStatus(500);
			res.end();
			return;
		}
		res.json({
			retCode: 0,
			msg: '留言成功',
			data: null
		});
		res.end();
	});
}

/**
 * @/api/message/getList 获取留言列表分页
 * @pageIndex {Number, require} 分页索引
 * @pageSize {Number, require} 分页体积
 * @return { retCode, msg, data, total, pageIndex, pageSize } 返回 
 */
var _getList = function(req, res, next) {
	var _pageIndex = parseInt(req.query.pageIndex) - 1 || 0,
		_pageSize = parseInt(req.query.pageSize) || 10;
	var _filter = req.query.filter;
	var _search = req.query.search;
	var filterObj = {};

	//过滤
	if(typeof _filter){
		if(_filter === 'isRead'){
			filterObj.isRead = true;
		}else if(_filter === 'unRead'){
			filterObj.isRead = false;
		}
	}

    //搜索
    if(typeof _search){
    	filterObj.content = new RegExp(_search,'gim');
    }

	//获取分页数据
	var __getList = function() {
			var defer = Q.defer();
			MessageModel.find(filterObj).sort({
				postTime: -1
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
		MessageModel.count(filterObj, function(cerr, ctotal) {
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

/**
 * @/api/message/delete
 * @id {String} 留言id
 * @return {obj} 删除实体 
 */
var _delete = function(req, res) {
	var msg_id = req.query.id;
	if (!msg_id || msg_id.length !== 24) {
		res.json({
			retCode: 10018,
			msg: '查找无该记录',
			data: null
		});
		res.end();
		return;
	}
	MessageModel.findByIdAndRemove(msg_id, function(rerr, rdoc) {
		if (rerr) {
			res.sendStatus(500);
			res.end();
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
 * @/api/message/getAdjoin 获取当前记录的相邻记录
 * @param  {id} 当前记录的id 
 * @return {object} 返回相邻记录 
 */
var _getAdjoin = function(req, res){
	var	msg_id = req.query.id;
	if(!msg_id || msg_id.length !== 24){
		res.json({retCode:10019, msg:'无该留言记录存在', data:null});
		res.end();
		return;
	}
	//首先查询当前id的记录是否存在
	var _isExistRecord = function(){
		var defer = Q.defer();
		MessageModel.findById(msg_id, function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}

			defer.resolve();
		});
		return defer.promise;
	}

	//查询上一条记录
	var _findPrevRecord = function(){
		var defer = Q.defer();
		MessageModel.find({_id:{$lt:msg_id}}).limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}
			defer.resolve(fdoc);
		});
		return defer.promise;
	}

	//查询下一条记录
	var _findNextRecord = function(){
		var defer = Q.defer();
		MessageModel.find({_id:{$gt:msg_id}}).limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
			if(ferr){
				res.sendStatus(500);
				res.end();
				return;
			}
			defer.resolve(fdoc);
		});
		return defer.promise;
	}
	//统计返回
	var _responseRecord = function(){
		Q.all([_findPrevRecord(), _findNextRecord()]).then(function(fList){
			var obj = {};
			obj.prev = fList[0][0] || null;
			obj.next = fList[1][0] || null;
			res.json({retCode:0, msg:'查询成功', data:obj});
			res.end();
		})
	}
	_isExistRecord().then(_responseRecord);
}

/**
 * 获取留言详情
 */
var _getDetail = function(req, res){
	var msg_id = req.query.id;
	if(!msg_id || msg_id.length !== 24){
		res.json({retCode:10020, msg:'查询无记录存在', data:null});
		res.end();
		return;
	}

	MessageModel.findByIdAndUpdate(msg_id, {$set:{isRead:true, readTime:Date.now() }}, function(ferr, fdoc){
		if(ferr){
			res.sendStatus(500);
			res.end();
			return;
		}
		if(!fdoc){
			res.json({retCode:10021, msg:'查询无记录存在', data:null});
			res.end();
			return;
		}	
		res.json({retCode:0, msg:'查询成功', data:fdoc});
		res.end();
	});
}

/**
 * 获取未读信息
 */
var _getUnreadList = function(req, res){
	MessageModel.find({isRead:false}, function(ferr, flist){
		if(ferr){
			res.sendStatus(500);
			res.end();
			return;
		}
		res.json({retCode:0, msg:'查询成功', data:flist});
		res.end();
	});
}

exports.add = _add;
exports.getList = _getList;
exports.delete = _delete;
exports.getAdjoin = _getAdjoin;
exports.getDetail = _getDetail;
exports.getUnreadList = _getUnreadList;