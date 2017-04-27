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
    res.send('get it') 
}

exports.add = _add;