var _ = require('lodash');
var ArticleModel = require('../../model').ArticleModel;
var CommentModel = require('../../model').CommentModel;
var Q = require('q');
var Mongoose = require('mongoose');
var $$ = require('../../tools');
var xss = require('xss');
var ObjectId = Mongoose.Types.ObjectId;
var GLOBAL_CONFIG = require('../../config');

/**
 * 添加评论
 * @param {string} name 用户名
 * @param {string} email 用户邮箱
 * @param {string} articleID 文章id
 * @param {string} parentComment 父级评论id
 * @param {string} content 内容
 */
var _add = function(req, res){
	var _name = req.body.name;
	var _email = req.body.email;
	var _articleID = req.body.article;
	var _parentComment = req.body.parentComment || null;
	var _content = req.body.content;
	if(!_articleID || !$$.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
    if(!!_parentComment && !$$.isObjectID(_parentComment)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }

    if(!_name || _name.length < 2){
    	return res.json({retCode:10001, msg:'用户名不能少于两位', data:null});
    }

    if(!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(_email)){
    	return res.json({retCode:10016, msg:'邮箱格式不正确', data:null});
    }

    if(!_.trim(_content)){
    	return res.json({retCode:10022, msg:'内容不能为空', data:null});
    }



    //是否存在
    var _isExist = function(){
        var defer = Q.defer();
        ArticleModel.findByIdAndUpdate(_articleID, {$inc:{commentNum:1}}, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            defer.resolve();
        });
        return defer.promise;
    }

  
    

    //录入
    var __add = function(){
        var defer = Q.defer();
    	var _createIp = req.ip !== '::1' &&　$$.getClientIp(req).match(/\d+\.\d+\.\d+\.\d+/)[0] || '';
    	var entity = {
    		article:_articleID,
    		createLog:{
    			createName:_name,
    			createTime:Date.now(),
                createEmail:_email,
    			createIp:_createIp,
    		},
    		parentComment:_parentComment,
    		content:xss(_content)
    	}

    	CommentModel.create(entity, function(cerr, cdoc){
			if(cerr || !cdoc){
				res.sendStatus(500);
				return;
			}
            defer.resolve(cdoc._id);
		});
        return defer.promise;
    }



    //重新查找关联数据
    var _return = function(cid){
        var defer = Q.defer();
        CommentModel.findById(cid).populate(['parentComment', 'article']).exec(function(err, fdoc){
            if(err || !fdoc){
                res.sendStatus(500);
                return;
            }
            defer.resolve(fdoc);
        });
        return defer.promise;
    }

    //发送email
    var __sendEmail = function(obj){
        if(!obj.parentComment){
            return res.json({retCode:0, msg:'创建成功', data:obj});
        }
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
            host: 'smtp.qq.com',
            port: 465,
            secure: true, 
            auth: {
                user: GLOBAL_CONFIG.EMAIL,
                pass: GLOBAL_CONFIG.EMAIL_AUTH
            }
        });
        var app = require('../../app.js');
        //模板无法直接打印ObjectId类型的值
        var tmpobj = JSON.parse(JSON.stringify(obj))
        app.render('email', tmpobj, function(rerr, html){
            if(rerr) return res.sendStatus(500);
            var mailOptions = {
                from: GLOBAL_CONFIG.EMAIL,
                to: obj.parentComment.createLog.createEmail,
                subject: obj.article.title,
                // text: obj.content, 
                html: html
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                }
                // console.log('Message %s sent: %s', info.messageId, info.response);
                res.json({retCode:0, msg:'创建成功', data:obj});
            });
        });
    }

    _isExist().then(__add).then(_return).then(__sendEmail);
}


/**
 * 删除评论
 * @param {string} id 评论id
 */
var _delete = function(req, res){
    var _commentID = req.query.id;
    if(!_commentID || !$$.isObjectID(_commentID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }

    //是否存在
    var _isExist = function(){
        var defer = Q.defer();
        CommentModel.findById(_commentID, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            defer.resolve();
        });
        return defer.promise;
    }

    //删除
    var __del = function(){
        var defer = Q.defer();
        CommentModel.findByIdAndRemove(_commentID, function(err, doc){
            if(err || !doc){
                return res.sendStatus(500);
            }
            defer.resolve(doc)
        });
        return defer.promise;
    }

    //减少相应文章的评论数量
    var _deComment = function(doc){
        ArticleModel.update({_id:doc.article}, {$inc:{commentNum:-1}}, function(err, ret){
            if(err) return res.sendStatus(500);
            res.json({retCode:0, msg:'删除成功', data:doc});
        });
    }

    _isExist().then(__del).then(_deComment);
}

/**
 * 评论列表
 * @param {number} pageIndex 分页索引
 * @param {number} pageSize 分页体积
 * @param {string} id 文章id
 * @param {string} keyword 关键字
 * @param {string} type 请求类型，0 || 1 是全部，1是今天，0是全部
 * @return {data,total} 返回 
 */
var _getList = function(req, res){
    var _pageIndex = parseInt(req.query.pageIndex) -1 || 0;
    var _pageSize = parseInt(req.query.pageSize) || 10;
    var _articleID = req.query.id;
    var _keyword = req.query.keyword;
    var _type = req.query.type;

    //获取今天凌晨时间戳
    var nowDate = new Date();
    nowDate.setHours(0)
    nowDate.setMinutes(0)
    nowDate.setSeconds(0)
    nowDate.setMilliseconds(0)
    var todayTime = nowDate.getTime();

    //一天的时间戳长度
    var oneDayTime = 1000 * 60 * 60 * 24;

    if(!!_articleID && !$$.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
    var filterObj = {};
    !!_articleID && (filterObj.article = _articleID);
    if(!!_keyword){
        _keyword = decodeURI(_keyword);
        var reg = new RegExp(_keyword, 'gim');
        filterObj.$or = [
            {
                'name':{
                    $regex:reg
                }
            },
            {
                'content':{
                    $regex:reg
                }
            }        
        ]
    }
    
    // if(!!_type && _type == 2){
    //      var yestodayTime = todayTime - oneDayTime;
    //    filterObj['createLog.createTime'] = {$gt: yestodayTime, $lte: todayTime};
    // }
    if(!!_type && _type == 1){
        filterObj['createLog.createTime'] = {$gt: todayTime, $lte: Date.now()};
    }
    //计算记录总数
    var _getTotal = function() {
        var defer = Q.defer();
        CommentModel.count(filterObj, function(cerr, ctotal) {
            if (cerr) {
                res.sendStatus(500);
                res.end();
                return;
            }
            defer.resolve(ctotal);
        });
        return defer.promise;
    }

    var _return = function(_total){
        CommentModel.find(filterObj).skip(_pageIndex * _pageSize).limit(_pageSize).populate(['parentComment','article']).sort({'_id':-1}).exec(function(err, flist){
            if(err){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'查询成功', data:flist, pageIndex:_pageIndex+1, pageSize:_pageSize, total:_total});
        });
    }
    

    _getTotal().then(_return);
}

var _like = function(req, res){
	var _commentID = req.body.id;
	var _isLike = req.body.isLike;

	if(!_commentID || !$$.isObjectID(_commentID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
	var filterObj = {};
	if(!!_isLike){
		filterObj.$inc = {'likeNum':1}
	}else{
		filterObj.$inc = {'likeNum':-1}
	}
		 //是否存在
    var _isExist = function(){
        var defer = Q.defer();
        CommentModel.findById(_commentID, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            defer.resolve();
        });
        return defer.promise;
    }

    //更新
    var _update = function(){
		CommentModel.findByIdAndUpdate(_commentID, filterObj).populate(['parentComment']).exec(function(err, doc){

	    	if(err || !doc){
	    		res.sendStatus(500);
	    		return;
	    	}
	    	res.json({retCode:0, msg:'更新成功', data:null});
	    });    
    }
    _isExist().then(_update);
}

exports.add = _add;
exports.delete = _delete;
exports.getList = _getList;
exports.like = _like;