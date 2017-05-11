var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var globalConfig = require('./config');
var cors = require('cors');
var redisdb = require('./model/connect').redisClient;

var app = express();

//模板引擎
var template = require('art-template');
template.config('base', '');
template.config('cache', globalConfig.templateCache);
template.config('extname', '.html');
app.engine('.html', template.__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


//其他配置
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    credentials: true,
    origin: true
}));


//路由
var index = require('./routes/index');
app.use('/', index);
//用户访问记录
app.use(require('./interceptor').accessCount);
//接口
require('./api')(app);
//统计当前网站在线人数,放在路由前面，方便在路由中展示
app.use(function(req, res, next) {
    //以用户浏览器为标准，非会员登录
    var ua = req.headers['user-agent'];
    reidsdb.zadd('online', Date.now(), ua, next);
});

app.use(function(req, res, next) {
    var min = 60 * 1000;
    //上一分钟
    var ago = Date.now() - min;
    reidsdb.zrevrangebyscore('online', '+inf', ago, function(err, users) {
        if (err) return next(err);
        req.online = users;
        app.locals.onlineNumber = users.length;
        next();
    });
});

//错误处理
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = err.status || 404;
	next(err);
});
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;