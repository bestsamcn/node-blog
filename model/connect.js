/**
 * connect
 * 数据库连接
 */
var config = require('../config').mongoConfig;

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('debug',true);

var db = mongoose.connect(config.mongodb);
db.connection.on('error',function(error){
	console.log('数据库连接失败'+error);
});

db.connection.on('open',function(error){
	console.log('数据库连接成功');
});