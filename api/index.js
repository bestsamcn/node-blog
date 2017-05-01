/**
 * 服务集合
 */
var adminServiceList = require('./admin');
var articleServiceList = require('./article');
var tagServiceList = require('./tag');
var categoryServiceList = require('./category');
var messageServiceList = require('./message');
var _serviceList = function(app){
	app.use('/api/admin', adminServiceList);
	app.use('/api/article', articleServiceList);
	app.use('/api/tag', tagServiceList);
	app.use('/api/category', categoryServiceList);
	app.use('/api/message', messageServiceList);
}
module.exports = _serviceList;