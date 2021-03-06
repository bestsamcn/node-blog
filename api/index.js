/**
 * 服务集合
 */
var adminServiceList = require('./admin');
var articleServiceList = require('./article');
var tagServiceList = require('./tag');
var categoryServiceList = require('./category');
var messageServiceList = require('./message');
var commenteServiceList = require('./comment');
var hotServiceList = require('./hot');
var notifyServiceList = require('./notify');
var accessCount = require('../interceptor').accessCount;
var _serviceList = function(app){
	app.use('/api', accessCount);
	app.use('/api/admin', adminServiceList);
	app.use('/api/article', articleServiceList);
	app.use('/api/tag', tagServiceList);
	app.use('/api/category', categoryServiceList);
	app.use('/api/message', messageServiceList);
	app.use('/api/comment', commenteServiceList);
	app.use('/api/hot', hotServiceList);
	app.use('/api/notify', notifyServiceList);
}
module.exports = _serviceList;