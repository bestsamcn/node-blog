var ArticleModel = require('../../model').ArticleModel;
var TagModel = require('../../model').TagModel;
var CategoryModel = require('../../model').CategoryModel;
var CommentModel = require('../../model').CommentModel;
var HotModel = require('../../model').HotModel;
var tools = require('../../tools');
var _ = require('lodash');
var Q = require('q');
var xss = require('xss');
var formidable = require('formidable');
var fs = require('fs');
var gm = require('gm')
var GLOBAL_CONFIG = require('../../config');



/**
 * 添加文章
 * @param {string} tag 标签id
 * @param {string} category 分类id
 * @param {string} content 文章内容html 
 * @param {string} codeContent 文章的文本格式源码 
 * @param {string} title 标题 
 * @param {string} previewText 导读 
 * @param {number} private 是否显示，管理员直接忽略 
 */
var _add = function(req, res){
    var _tag = req.body.tag;
    var _cate = req.body.category;
    var _content = req.body.content;
    var _codeContent = req.body.codeContent;
    var _title = req.body.title;
    var _previewText = req.body.previewText;
    var _poster = req.body.poster || '';
    var _private = req.body.private || 0;
    var _isTop = req.body.isTop;
    
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
                return res.json({retCode:10021, msg:'查询无该标签记录', data:null});
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
                return res.json({retCode:10021, msg:'查询无该分类记录', data:null});
            }
            obj.categoryName = doc.name;
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //实体
    var _create = function(obj){
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
            lastEditTime:Date.now(),
            poster:_poster,
            private:_private,
            isTop:_isTop
        }
        ArticleModel.create(entity, function(err, doc){
            if(err || !doc){
                res.sendStatus(500);
                return;
            }
            res.json({retCode:0, msg:'发布成功', data:doc}); 
        }); 
    }
    _isExistTag().then(_isExistTag).then(_create);
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
    //删除
    var __del = function(doc){
        ArticleModel.findByIdAndRemove(_articleID, function(err, doc){
            if(err || !doc){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'删除成功', data:null});
        });
    }
    _isExist().then(_delComment).then(__del);
}

/**
 * 修改文章
 * @param {string} id 文章id
 * @param {string} tag 标签列表
 * @param {string} category 分类列表
 * @param {string} title 标题
 * @param {string} previewText 分类列表
 * @param {string} content 文章内容html 
 * @param {number} private 是否显示，管理员直接忽略 
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
    var _private = req.body.private || 0;
    var _isTop = req.body.isTop;

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
            lastEditTime:Date.now(),
            private:_private,
            isTop:_isTop
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
 * @param {number} type 查询的类型，1是评论最多，2是浏览量最多, 3为按修改时间倒序
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
    
    var isAdmin = !!req.isAdminRole;
    !isAdmin && (filterObj.private = 0);
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
        !isAdmin && (filterObj.private = 0);
        (_type == 2) && (sortObj.readNum = -1);
        (_type == 3) && (sortObj.lastEditTime = -1);
        if(_type == 4){
            sortObj.isTop = -1;
            sortObj._id = -1;
        }
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

    //热词计算
    var _setHotWord = function(obj){
        var defer = Q.defer();
        if(!_keyword || _keyword == 'undefined' || _keyword == 'null' || obj._total == 0){
            defer.resolve(obj);
            return defer.promise;
        }
        HotModel.find({name:{$regex:reg}}, function(err, list){
            //如果hot中没有该热词，就添加该热词，如果hotList.length > GLOBAL_CONFIG.HOT_WORD.LENGTH 就删除热度最低的热词；
            //i am the callback hell
            if(list.length === 0){
                HotModel.create({name:_keyword, hotCount:1, createTime:Date.now()}, function(err, doc){
                    if(err) return res.sendStatus(500);
                    HotModel.find({}).sort({hotCount:1, createTime:1}).exec(function(err, hlist){
                        if(err) return res.sendStatus(500);
                        if(hlist.length <= GLOBAL_CONFIG.HOT_WORD_LENGTH) return defer.resolve(obj);
                        HotModel.remove({_id:hlist[0]._id}, function(err, ret){
                            if(err) return res.sendStatus(500);
                            defer.resolve(obj);
                        });
                    });
                });
            //否则就让该热词的热度+1
            }else{
                var temp  = [];
                for(var i =0; i< list.length; i++){
                    temp.push(list[i]._id);
                }
                HotModel.update({_id:{$in:temp}}, {$inc:{hotCount:1}}, function(err, ret){
                    if(err) return res.sendStatus(500);
                    defer.resolve(obj);
                });
            }
        });
        return defer.promise;
    }

    //标签热度计算
    var _setTagClickNumber = function(obj){
        var defer = Q.defer();
        if(!filterObj.tagName){
            defer.resolve(obj);
            return defer.promise;
        }
        TagModel.update({name:filterObj.tagName}, {$inc:{clickNum:1}}, function(err, ret){
            if(err) return res.sendStatus(500);
            defer.resolve(obj);
        });
        return defer.promise;
    }

    //分类热度计算
    var _setCateClickNumber = function(obj){
        var defer = Q.defer();
        if(!filterObj.categoryName){
            defer.resolve(obj);
            return defer.promise;
        }
        CategoryModel.update({name:filterObj.categoryName}, {$inc:{clickNum:1}}, function(err, ret){
            if(err) return res.sendStatus(500);
            defer.resolve(obj);
        });
        return defer.promise;
    }
    

    //查询评论最多的文章id集合
    var _getComment = function(){
        var defer = Q.defer();
        var filter = [
            {$group:{_id:'$article', count:{$sum:1}}}, 
            {$project:{_id:1, count:1}}, 
            {$sort:{count:-1}}, 
            // {$limit:4}
        ];

        //$limit需要分在排序后面，不然取值逻辑有问题
        CommentModel.aggregate(filter).exec(function(err, list){
            if(err){
                return res.sendStatus(500);
            }
            defer.resolve(list);
        });
        return defer.promise;
    }

    //返回
    var _return = function(obj){
        var exlucdes = '-codeContent -content -pinYin -tagName -categoryName';
        if(!req.isAdminRole){
            exlucdes += ' -private';
        }
        ArticleModel.find(filterObj).skip(_pageIndex * _pageSize).limit(_pageSize).select(exlucdes).populate(['tag', 'category']).sort(sortObj).exec(function(err, flist){
            if(err){
                return res.sendStatus(500);
            }
            res.json({retCode:0, msg:'查询成功', data:flist, pageIndex:_pageIndex+1, pageSize:_pageSize, total:obj._total});
        });
    }

    //返回最火
    var _returnComment = function(group){
        ArticleModel.populate(group, {path:'_id'}, function(err, flist){
            if(err){
                return res.sendStatus(500);
            }
            var list = [];
            for(var i=0; i<flist.length; i++){
                delete flist[i]._id.codeContent;
                delete flist[i]._id.content;
                delete flist[i]._id.pinYin;
                delete flist[i]._id.tagName;
                delete flist[i]._id.categoryName;
                delete flist[i]._id.private;
                if(!req.isAdminRole){
                    flist[i]._id.private != 1 &&  list.push(flist[i]._id);
                }else{
                    list.push(flist[i]._id);
                }
                
                if(list.length === 4) break;
            }

            res.json({retCode:0, msg:'查询成功', data:list});
        });
    }

    !_type && _getTotal().then(_setHotWord).then(_setTagClickNumber).then(_setCateClickNumber).then(_return);
    !!_type && (_type == 2 || _type == 3 || _type == 4) && _getTotal().then(_return);
    !!_type && (_type == 1) && _getComment().then(_returnComment);
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
    var _otherExcludes = '-codeContent -content -previewText -pinYin -tagName -categoryName';
    if(!req.isAdminRole){
        _exclude += ' -private';
        _otherExcludes += ' -private';
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

            if(fdoc.private == 1 && !req.isAdminRole){
                res.json({retCode:10018, msg:'查找无该记录', data:null});
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
        var filter = {_id:{$lt:_articleID}};
        if(!req.isAdminRole){
            filter.private = {$ne:1};
        }
        ArticleModel.find(filter, _otherExcludes).limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
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
        var filter = {_id:{$gt:_articleID}};
        if(!req.isAdminRole){
            filter.private = {$ne:1};
        }
        ArticleModel.find(filter, _otherExcludes).limit(1).sort({_id:-1}).exec(function(ferr, fdoc){
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

//统计分类文章数量
var _getDiffArticle = function(req, res){
    var _type = req.query.type || 1;
    //获取类文章分组情况
    var _getCateGroup = function(){
        var defer = Q.defer();
        ArticleModel.aggregate({$group:{_id:'$category', total:{$sum:1}}}).exec(function(err, group){
            if(err) return res.sendStatus(500);
            defer.resolve(group);
        });
        return defer.promise;
    }

    //根据_id关联起来，拿到文章详情
    var _getCatePopulate = function(group){
        CategoryModel.populate(group, {path: '_id'}, function(err, list) {
            // Your populated translactions are inside populatedTransactions
            if(err) return res.sendStatus(500);
            res.json({retCode:0, msg:'查询成功', data:list});
        });
    }

    //获取类文章分组情况
    var _getTagGroup = function(){
        var defer = Q.defer();
        ArticleModel.aggregate({$group:{_id:'$tag', total:{$sum:1}}}).exec(function(err, group){
            if(err) return res.sendStatus(500);
            defer.resolve(group);
        });
        return defer.promise;
    }

    //根据_id关联起来，拿到文章详情
    var _getTagPopulate = function(group){
        TagModel.populate(group, {path: '_id'}, function(err, list) {
            // Your populated translactions are inside populatedTransactions
            if(err) return res.sendStatus(500);
            res.json({retCode:0, msg:'查询成功', data:list});
        });
    }
    _type == 1 && _getCateGroup().then(_getCatePopulate);
    _type == 2 && _getTagGroup().then(_getTagPopulate);
}

exports.add = _add;
exports.delete = _delete;
exports.edit = _edit;
exports.getList = _getList;
exports.getDetail = _getDetail;
exports.like = _like;
exports.addPoster = _addPoster;
exports.getDiffArticle = _getDiffArticle;

