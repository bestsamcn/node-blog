var ArticleModel = require('../../model').ArticleModel;
var tools = require('../../tools');
var _ = require('lodash');
var Q = require('q');
var xss = require('xss');





/**
 * 添加文章
 * @param {string} tag 标签列表
 * @param {string} category 分类列表
 * @param {string} content 文章内容html 
 */
var _add = function(req, res){
    var _tag = req.body.tag;
    var _cate = req.body.category;
    var _content = req.body.content;
    var _title = req.body.title;
    var _previewText = req.body.previewText;
    var _poster = req.body.poster || '';
    if(!_tag){
        return res.json({retCode:10014, msg:'请选择标签', data:null});
    }
    var __tag = _tag.split(',');

    __tag.forEach(function(item, index){
        console.log(item)
        if(!tools.isObjectID(item)){
            return res.json({retCode:10014, msg:'请选择标签', data:null});
        }
    });

    if(!_cate){
        return res.json({retCode:10015, msg:'请选择分类', data:null});
    }
    var __category = _cate.split(',');
    __category.forEach(function(item, index){
        if(!tools.isObjectID(item)){
            return res.json({retCode:10015, msg:'请选择分类', data:null});
        }
    }); 

   	if(!_title){
   		res.json({retCode:10018, msg:'请填写标题', data:null});
   		return;
   	}
   	if(!_previewText){
   		res.json({retCode:10017, msg:'请添加导读', data:null});
   		return;
   	}
   	if(!_content){
   		res.json({retCode:10016, msg:'请填写内容', data:null});
   		return;
   	}
   	var _tagArr = _tag.split(',');
   	var _categoryArr = _cate.split(',');
   	_title = xss(_title);
   	_content = xss(_content);
   	_previewText = xss(_previewText);

   	var _allPinyin = tools.getPinyin(_title, true);
   	var _sglPinyin = tools.getPinyin(_title, false);

   	var _pinyin = [];
   	_pinyin = _pinyin.concat(_allPinyin, _sglPinyin);



   	//实体
   	var entity = {
   		title:_title,
   		previewText:_previewText,
   		tag:_tagArr,
   		category:_categoryArr,
   		content:_content,
   		pinYin:_pinyin,
   		createTime:Date.now(),
   		poster:_poster
   	}
   	ArticleModel.create(entity, function(err, doc){
   		if(err || !doc){
   			res.sendStatus(500);
   			return;
   		}
   		res.json({retCode:0, msg:'发布成功', data:null});
   	});
}

/**
 * 删除文章
 * @param {string} id 文章id
 */
var _delete = function(req, res){
    
    var _articleID = req.query.id;
    if(!_articleID || !tools.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }

    //是否存在
    var _isExist = function(){
        var defer = Q.defer();
        ArticleModel.findById(_articleID, function(err, doc){

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
        ArticleModel.findByIdAndRemove(_articleID, function(err, doc){
            if(err || !doc){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'删除成功', data:null});
        });
    }

    _isExist().then(__del);
}

/**
 * 修改文章
 * @param {string} id 文章id
 * @param {string} tag 标签列表
 * @param {string} category 分类列表
 * @param {string} title 标题
 * @param {string} previewText 分类列表
 * @param {string} content 文章内容html 
 */
var _edit = function(req, res){
    var _articleID = req.body.id;
    if(!_articleID || !tools.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
    var _tag = req.body.tag;
    var _cate = req.body.category;
    var _title = req.body.title;
    var _previewText = req.body.previewText;
    var _content = req.body.content;
    if(!_tag){
        return res.json({retCode:10014, msg:'请选择标签', data:null});
    }
    var __tag = _tag.split(',');
    __tag.forEach(function(item, index){
        if(!tools.isObjectID(item)){
            return res.json({retCode:10014, msg:'请选择标签', data:null});
        }
    });

    if(!_cate){
        return res.json({retCode:10015, msg:'请选择分类', data:null});
    }
    var __category = _cate.split(',');
    __category.forEach(function(item, index){
        if(!tools.isObjectID(item)){
            return res.json({retCode:10015, msg:'请选择分类', data:null});
        }
    }); 

    if(!_title){
        res.json({retCode:10018, msg:'请填写标题', data:null});
        return;
    }
    if(!_previewText){
        res.json({retCode:10017, msg:'请添加导读', data:null});
        return;
    }
    if(!_content){
        res.json({retCode:10016, msg:'请填写内容', data:null});
        return;
    }

    //是否存在
    var _isExist = function(){
        var defer = Q.defer();
        ArticleModel.findById(_articleID, function(err, doc){

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

    //编辑
    var __edit = function(){
        //实体
        var entity = {
            title:_title,
            previewText:_previewText,
            tag:_tag.split(','),
            category:_cate.split(','),
            content:_content,
            pinYin:_pinyin,
            lastEditTime:Date.now()
        }
        ArticleModel.findByIdAndUpdate(_articleID, {$set:entity}, function(err, ret){
            if(err){
               return res.sendStatus(500);
            }
            console.log(ret);
            res.json({retCode:0, msg:'更新成功', data:null})
        });
    }
}

/**
 * 文章列表
 * @param {number} pageIndex 分页索引
 * @param {number} pageSize 分页体积
 * @return {data,total} 返回 
 */
var _getList = function(req, res){
    var _pageIndex = parseInt(req.query.pageIndex) -1 || 0;
    var _pageSize = parseInt(req.query.pageSize) || 10;
    var _keyword = req.query.keyword;
    var _tag = req.query.tag;
    var _cate = req.query.category;
    var filterObj = {};

    if(!!_keyword){
        _keyword = decodeURI(_keyword);
        console.log(_keyword)
        var reg = new RegExp(_keyword, 'gim');
        // filterObj.$or = [
        //     {
        //         'title':{
        //             $regex:reg
        //         }
        //     },
        //     {
        //         'previewText':{
        //             $regex:reg
        //         }
        //     },
        //     {
        //         'pinYin':{
        //             $regex:reg
        //         }
        //     }
        // ]
        filterObj.$text = {};
        filterObj.$text.$search = _keyword;
    }

    if(!!_tag){
        filterObj.tag = {};
        filterObj.tag.name.$all = _tag.split(',');
    }
    // if(!!_cate){
    //     filterObj.category = {
    //         $elemMatch:_tag
    //     }
    // }
    ArticleModel.find(filterObj).skip(_pageIndex * _pageSize).limit(_pageSize).populate(['tag', 'category']).exec(function(err, flist){
        if(err){
            return res.sendStatus(500);
        }
        res.json({retCode:0, msg:'查询成功', data:flist});
    })
}

exports.add = _add;
exports.delete = _delete;
exports.edit = _edit;
exports.getList = _getList;
