/**
 * 服务集合
 */

var adminServiceList = require('./admin');
var _serviceList = function(app){
	app.use('/api/admin', adminServiceList);
}
module.exports = _serviceList;