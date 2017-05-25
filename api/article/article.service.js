var ArticleModel = require('../../model').ArticleModel;
var TagModel = require('../../model').TagModel;
var CategoryModel = require('../../model').CategoryModel;
var CommentModel = require('../../model').CommentModel;
var tools = require('../../tools');
var _ = require('lodash');
var Q = require('q');
var xss = require('xss');
var formidable = require('formidable');
var fs = require('fs');
var gm = require('gm')



/**
 * 添加文章
 * @param {string} tag 标签id
 * @param {string} category 分类id
 * @param {string} content 文章内容html 
 * @param {string} codeContent 文章的文本格式源码 
 * @param {string} title 标题 
 * @param {string} previewText 导读 
 */
var _add = function(req, res){
    var _tag = req.body.tag;
    var _cate = req.body.category;
    var _content = req.body.content;
    var _codeContent = req.body.codeContent;
    var _title = req.body.title;
    var _previewText = req.body.previewText;
    var _poster = req.body.poster || '';
    
    if(!_tag || !tools.isObjectID(_tag)){
        return res.json({retCode:10014, msg:'请选择标签', data:null});
    }

    if(!_cate || !tools.isObjectID(_cate)){
        return res.json({retCode:10015, msg:'请选择分类', data:null});
    }

    if(!_title){
        res.json({retCode:10018, msg:'请填写标题', data:null});
        return;
    }
    if(!_previewText){
        res.json({retCode:10017, msg:'请添加导读', data:null});
        return;
    }
    if(!_content && _codeContent){
        res.json({retCode:10016, msg:'请填写内容', data:null});
        return;
    }
    // var _tagArr = _tag.split(',');
    // var _categoryArr = _cate.split(',');
    // _title = xss(_title);
    // _content = xss(_content);
    // _previewText = xss(_previewText);

    var _allPinyin = tools.getPinyin(_title, true);
    var _sglPinyin = tools.getPinyin(_title, false);

    var _pinyin = [];
    _pinyin = _pinyin.concat(_allPinyin, _sglPinyin);

    //标签是否存在
    var _isExistTag = function(){
        var defer = Q.defer();
        TagModel.findById(_tag, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            var obj = {};
            obj.tagName = doc.name;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //分类是否存在
    var _isExistCate = function(obj){
        var defer = Q.defer();
        CategoryModel.findById(_cate, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            obj.categoryName = doc.name;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //实体
    var _create = function(obj){
        var defer = Q.defer();
       var entity = {
            title:_title,
            tagName:obj.tagName,
            categoryName:obj.categoryName,
            previewText:_previewText,
            tag:_tag,
            category:_cate,
            content:_content,
            codeContent:_codeContent,
            pinYin:_pinyin,
            createTime:Date.now(),
            poster:_poster
        }
        ArticleModel.create(entity, function(err, doc){
            if(err || !doc){
                res.sendStatus(500);
                return;
            }
            defer.resolve(doc);
            
        }); 
        return defer.promise;
    }

    //添加标签文章总数
    var _setTag = function(doc){
        var defer = Q.defer();
        TagModel.update({_id:_tag}, {$inc:{'totalArticle':1}}, function(err, ret){
            console.log(ret)
            if(err || !ret.ok){
                res.sendStatus(500);
                return;
            }
            defer.resolve(doc);
        });
        return defer.promise;
    }

    //添加分类文章总数
    var _setCate = function(doc){
        CategoryModel.update({_id:_cate}, {$inc:{'totalArticle':1}}, function(err, ret){
            console.log(ret)
            if(err || !ret.ok){
                res.sendStatus(500);
                return;
            }
            res.json({retCode:0, msg:'发布成功', data:doc}); 
        });
           
    }
    _isExistTag().then(_isExistTag).then(_create).then(_setTag).then(_setCate)
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
            defer.resolve(doc);
        });
        return defer.promise;
    }

    //删除文章关联的评论
    var _delComment = function(doc){
        var defer = Q.defer();
        CommentModel.remove({article:_articleID}, function(err, ret){
            if(err || ret.result.ok !== 1){
                return res.sendStatus(500);
            }
            defer.resolve(doc);
        });
        return defer.promise;
    }

    //tag文章数减1
    var _detag = function(doc){
        var defer = Q.defer();
        TagModel.update({_id:doc.tag}, {$inc:{totalArticle:-1}}, function(err, ret){
            if(err || ret.ok !==1){
                return res.sendStatus(500);
            }
            defer.resolve(doc);
        });
        return defer.promise;
    }

    //category文章数减1
    var _decate = function(doc){
        var defer = Q.defer();
        CategoryModel.update({_id:doc.category}, {$inc:{totalArticle:-1}}, function(err, ret){
            if(err || ret.ok !==1){
                return res.sendStatus(500);
            }
            defer.resolve(doc);
        });
        return defer.promise;
    }

    //删除
    var __del = function(doc){
        ArticleModel.findByIdAndRemove(_articleID, function(err, doc){
            if(err || !doc){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'删除成功', data:null});
        });
    }
    _isExist().then(_delComment).then(_detag).then(_decate).then(__del);
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
    var _codeContent = req.body.codeContent;
    var _poster = req.body.poster;
    if(!_tag || !tools.isObjectID(_tag)){
        return res.json({retCode:10014, msg:'请选择标签', data:null});
    }

    if(!_cate || !tools.isObjectID(_cate)){
        return res.json({retCode:10015, msg:'请选择分类', data:null});
    }

    if(!_title){
        res.json({retCode:10018, msg:'请填写标题', data:null});
        return;
    }
    if(!_previewText){
        res.json({retCode:10017, msg:'请添加导读', data:null});
        return;
    }
    if(!_content || !_codeContent){
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

    //标签是否存在
    var _isExistTag = function(){
        var defer = Q.defer();
        TagModel.findById(_tag, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            var obj = {};
            obj.tagName = doc.name;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //分类是否存在
    var _isExistCate = function(obj){
        var defer = Q.defer();
        CategoryModel.findById(_cate, function(err, doc){
            if(err){
                return res.sendStatus(500);
            }
            if(!doc){
                return res.json({retCode:10021, msg:'查询无该记录', data:null});
            }
            obj.categoryName = doc.name;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //编辑
    var __edit = function(obj){
        var _allPinyin = tools.getPinyin(_title, true);
        var _sglPinyin = tools.getPinyin(_title, false);
        var _pinyin = [];
        _pinyin = _pinyin.concat(_allPinyin, _sglPinyin);
        //实体
        var entity = {
            title:_title,
            tagName:obj.tagName,
            categoryName:obj.categoryName,
            previewText:_previewText,
            tag:_tag.split(','),
            category:_cate.split(','),
            content:_content,
            codeContent:_codeContent,
            pinYin:_pinyin,
            poster:_poster,
            lastEditTime:Date.now()
        }
        ArticleModel.findByIdAndUpdate(_articleID, {$set:entity}, function(err, ret){
            if(err){
               return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'更新成功', data:null})
        });
    }
    _isExist().then(_isExistTag).then(_isExistCate).then(__edit);
}

/**
 * 文章列表
 * @param {number} pageIndex 分页索引
 * @param {number} pageSize 分页体积
 * @param {string} keyword 关键字
 * @param {number} type 查询的类型，1是评论最多，2是浏览量最多
 * @return {data,total} 返回 
 */
var _getList = function(req, res){
    var _pageIndex = parseInt(req.query.pageIndex) -1 || 0;
    var _pageSize = parseInt(req.query.pageSize) || 10;
    var _keyword = req.query.keyword;
    var _tag = req.query.tag;
    var _cate = req.query.category;
    var _type = req.query.type;
    var filterObj = {};
    var optObj = {};
    var sortObj = {};
    if(!!_keyword){
        _keyword = decodeURI(_keyword);
        var reg = new RegExp(_keyword, 'gim');
        filterObj.$or = [
            {
                'title':{
                    $regex:reg
                }
            },
            {
                'previewText':{
                    $regex:reg
                }
            },
            {
                'tagName':{
                    $regex:reg
                }
            },
            {
                'categoryName':{
                    $regex:reg
                }
            },
            {
                'content':{
                    $regex:reg
                }
            },
            {
                'pinYin':{
                    $regex:reg
                }
            }
        ]
        // filterObj.$text = {};
        // filterObj.$text.$search = _keyword;
    }

    if(!!_tag){
        _tag = decodeURI(_tag);
        filterObj['tagName']= _tag;
    }
    if(!!_cate){
        _cate = decodeURI(_cate);
        filterObj['categoryName'] = _cate;
    }
    if(!!_type){
        filterObj = {};
        (_type == 2) && (sortObj.readNum = -1);
        sortObj._id = -1;
    }else{
        sortObj._id = -1;
    }


    //计算记录总数
    var _getTotal = function() {
        var defer = Q.defer();
        ArticleModel.count(filterObj, function(cerr, ctotal) {
            if (cerr) {
                res.sendStatus(500);
                return;
            }
            var obj = {
                _total:ctotal
            };
            defer.resolve(obj);
        });
        return defer.promise;
    }


    //查询评论最多的文章
    var _getComment = function(obj){
        obj = obj || {};
        var defer = Q.defer();
        CommentModel.aggregate([{$group:{_id:'$article', count:{$sum:1}}}, {$project:{_id:1,count:1}}, {$limit:4}, {$sort:{count:-1}}]).exec(function(err, list){
            if(err){
                return res.sendStatus(500);
            }
            var temp = [];
            for(var i=0 ;i<list.length; i++){
                temp.push(list[i]._id);
            }
            obj._articleList = temp;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //返回
    var _return = function(obj){
        !!obj._articleList && (filterObj._id = {}) && (filterObj._id.$in=obj._articleList);
        ArticleModel.find(filterObj).skip(_pageIndex * _pageSize).limit(_pageSize).select('-codeContent -content -pinYin -tagName -categoryName').populate(['tag', 'category']).sort(sortObj).exec(function(err, flist){
            if(err){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'查询成功', data:flist, pageIndex:_pageIndex+1, pageSize:_pageSize, total:obj._total});
        });
    }

    !_type && _getTotal().then(_return);
    !!_type && _getTotal().then(_getComment).then(_return);
}



/**
 * getDetail 获取详情
 * @param {string} id 文章id
 * @param {number} type 1获取的是html，2获取的是源码
 */
var _getDetail = function(req, res){
    var _articleID = req.query.id;
    var _type = req.query.type;
    if(!_articleID || !tools.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
    var _exclude = _type == 1 ? '-codeContent -tagName -categoryName' : '-content  -tagName -categoryName';

    //首先查询当前id的记录是否存在
    var _isExistRecord = function(){
        var defer = Q.defer();
        ArticleModel.findById(_articleID, function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                res.end();
                return;
            }
            if(!fdoc){
                return res.json({retCode:10018, msg:'查找无该记录', data:null});
            }
            defer.resolve();
        });
        return defer.promise;
    }

    //首先查询当前id的记录
    var _findCurrRecord = function(){
        var defer = Q.defer();
        ArticleModel.findByIdAndUpdate(_articleID, {$inc:{'readNum':1}}).select(_exclude).populate(['category', 'tag']).exec( function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                return;
            }
            defer.resolve(fdoc);
        });
        return defer.promise;
    }

    //查询上一条记录
    var _findPrevRecord = function(){
        var defer = Q.defer();
        ArticleModel.find({_id:{$lt:_articleID}}, '-codeContent -content -previewText -pinYin -tagName -categoryName').limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                return;
            }
            defer.resolve(fdoc);
        });
        return defer.promise;
    }

    //查询下一条记录
    var _findNextRecord = function(){
        var defer = Q.defer();
        ArticleModel.find({_id:{$gt:_articleID}}, '-codeContent -content -previewText -pinYin -tagName -categoryName').limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                return;
            }
            defer.resolve(fdoc);
        });
        return defer.promise;
    }
    //统计返回
    var _responseRecord = function(){
        Q.all([_findCurrRecord(), _findPrevRecord(), _findNextRecord()]).then(function(fList){
            var obj = {};
            obj.curr = fList[0] || null;
            obj.prev = fList[1][0] || null;
            obj.next = fList[2][0] || null;
            res.json({retCode:0, msg:'查询成功', data:obj});
        })
    }
    _isExistRecord().then(_responseRecord);

}

/**
 * 点赞
 * @param {strign} id 文章id
 */
var _like = function(req, res){
    var _articleID = req.body.id;
    if(!_articleID || !tools.isObjectID(_articleID)){
        return res.json({retCode:10012, msg:'id无效', data:null});
    }
    //首先查询当前id的记录是否存在
    var _isExistRecord = function(){
        var defer = Q.defer();
        ArticleModel.findById(_articleID, function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                res.end();
                return;
            }
            if(!fdoc){
                return res.json({retCode:10018, msg:'查找无该记录', data:null});
            }
            defer.resolve();
        });
        return defer.promise;
    }

    var _update = function(){
        ArticleModel.findByIdAndUpdate(_articleID, {$inc:{'likeNum':1}}, function(ferr, fdoc){
            if(ferr){
                res.sendStatus(500);
                res.end();
                return;
            }
            return res.json({retCode:0, msg:'点赞成功', data:null});
        });
    }
    _isExistRecord().then(_update);
}

/**
 * 上传图片
 */
var _addPoster = function(req, res){
    var posterDir = 'public/img/';
    if (!fs.existsSync(posterDir)) {
        fs.mkdirSync(posterDir);
    }
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = posterDir; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 5 * 1024 * 1024; //文件大小
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if(err || !fields || !files){
            return res.json({retCode:10026, msg:'参数错误', data:null});
        }
        var typeReg = /^image\/(pjpeg|jpeg|png|x-png|gif)$/ig
        if(!typeReg.test(files.poster.type)){
            res.json({retCode:100024,msg:'图片格式错误',data:null});
            return;
        }
        if(files.poster.size > 5 * 1024 * 1024){
            res.json({retCode:100025,msg:'图片不能大于5M',data:null});
            return;
        }
        var suffix = '';
        switch(files.poster.type){
            case 'image/pjpeg':
                suffix = 'jpg';
                break;
            case 'image/jpeg':
                suffix = 'jpg';
                break;
            case 'image/gif':
                suffix = 'gif';
                break;
            case 'image/x-png':
                suffix = 'png';
                break;
            case 'image/png':{
                suffix = 'png'
            }
        }
        var crypto = require('crypto');
        var md5 = crypto.createHash('md5');
        var _posterName = md5.update('blog'+Date.now()).digest('hex')+'.'+suffix;

        fs.renameSync(files.poster.path,form.uploadDir+_posterName);
        global._posterName = _posterName;
        gm(posterDir+global['_posterName']).quality(70).autoOrient().write(form.uploadDir+_posterName, function(err, pic){
            if(err){
                return res.sendStatus(500);
            }
            res.json({retCode:0,msg:'上传成功',data:{posterName:_posterName}});
        });
    });
}

exports.add = _add;
exports.delete = _delete;
exports.edit = _edit;
exports.getList = _getList;
exports.getDetail = _getDetail;
exports.like = _like;
exports.addPoster = _addPoster;
