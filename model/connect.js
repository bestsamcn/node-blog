/**
 * connect
 * 数据库连接
 */
var config = require('../config');

/**
 * 链接mongodb
 * @type {[type]}
 */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('debug',true);

var db = mongoose.connect(config.mongoConfig.mongodb);
db.connection.on('error',function(error){
	console.log('数据库连接失败'+error);
});

db.connection.on('open',function(error){
	console.log('数据库连接成功');
});
exports.mongodb = db;

/**
 * 链接redis
 */
var redis = require('redis');
var redisClient = redis.createClient(config.NODE_REDIS_PORT);

redisClient.auth(config.NODE_REDIS_PASS, function(){
	console.log('auth sucess');
});
redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});

exports.redis = redis;
exports.redisClient = redisClient;
