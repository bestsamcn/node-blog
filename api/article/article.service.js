var ArticleModel = require('../../model').ArticleModel;
var tools = require('../../tools');
var _ = require('lodash');
var xss = require('xss');
/**
 * 添加文章
 * @param {string} tag 标签列表
 * @param {string} category 分类列表
 * @param {string} content 文章内容html 
 */
var _add = function(req, res){
    var _tag = req.body.tag;
    var _category = req.body.category;
    var _content = req.body.content;
    var _title = req.body.title;
    var _previewText = req.body.previewText;
    var _poster = req.body.poster || '';
    if(!_tag || !tools.isObjectID(_tag)){
    	res.json({retCode:10014, msg:'请选择标签', data:null});
    	return;
    }
   	if(!_category || !tools.isObjectID(_category)){
   		res.json({retCode:10015, msg:'请选择分类', data:null});
   		return;
   	} 
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
   	var _categoryArr = _category.split(',');
   	_title = xss(_title);
   	_content = xss(_content);
   	_previewText = xss(_previewText);
   	var _allPinyin = tools.getPinyin(_title, true);
   	var _sglPinyin = tools.getPinyin(_title, false);
   	var _pinyin = [];
   	_pinyin = _pinyin.concat(_allPinyin, sglPinyin);

   	//实体
   	var entity = {
   		title:_title,
   		previewText:_previewText,
   		_tag:_tagArr,
   		_category:_categoryArr,
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

exports.add = _add;