/**
 * model入口
 */

require('./connect');
var admin = require('./schema/admin');
var article = require('./schema/article');
var tag = require('./schema/tag');
var category = require('./schema/category');
var comment = require('./schema/comment');
var mongoose = require('mongoose');


//管理员模型
exports.AdminModel = mongoose.model('Admin', admin);
exports.AritcleModel = mongoose.model('Article', article);
exports.TagModel = mongoose.model('Tag', tag);
exports.CategoryModel = mongoose.model('Category', category);
exports.CommentModel = mongoose.model('Comment', comment);
