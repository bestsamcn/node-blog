/**
 * 服务集合
 */

var articleServiceList = require('./article');
var _serviceList = function(app){
	app.use('/api/article', articleServiceList);
}
module.exports = _serviceList;