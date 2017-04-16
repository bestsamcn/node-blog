/**
 * model入口
 */

require('./connect');
var admin = require('./schema/admin');
var mongoose = require('mongoose');


//管理员模型
exports.AdminModel = mongoose.model('Admin', admin);