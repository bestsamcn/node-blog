/**
 * model入口
 */

require('./connect');
var admin = require('./schema/admin');
var article = require('./schema/article');
var tag = require('./schema/tag');
var category = require('./schema/category');
var comment = require('./schema/comment');
var message = require('./schema/message');
var count = require('./schema/count');
var hot = require('./schema/hot');
var notify = require('./schema/notify');
var mongoose = require('mongoose');


//管理员模型
exports.AdminModel = mongoose.model('Admin', admin);
exports.ArticleModel = mongoose.model('Article', article);
exports.TagModel = mongoose.model('Tag', tag);
exports.CategoryModel = mongoose.model('Category', category);
exports.CommentModel = mongoose.model('Comment', comment);
exports.MessageModel = mongoose.model('Message', message);
exports.CountModel = mongoose.model('Count', count);
exports.HotModel = mongoose.model('Hot', hot);
exports.NotifyModel = mongoose.model('Notify', notify);
