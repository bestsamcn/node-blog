var NODE_ENV = process.env.BLOG_ENV || 'development',
	NODE_HOST = process.env.BLOG_HOST || '127.0.0.1',
	NODE_PORT = process.env.BLOG_PORT || 3040,
	TOKEN_SECRET = process.env.BLOG_SECRET || 'node-blog',
	TOKEN_EXPIRES = process.env.TOKEN_EXPIRES || 1,//天
	NODE_REDIS_PORT = process.env.NODE_REDIS_PORT || 6379,
	NODE_REDIS_PASS = process.env.NODE_REDIS_PASS || '',
	TEMPLATE_CACHE = ( NODE_ENV !== 'development' ),
	MONGO_DATABASE = process.env.BLOG_MONGO_DATABASE || 'blog',
	MONGO_USER = process.env.BLOG_MONGO_USER || '',
	MONGO_PASSWORD = process.env.BLOG_MONGO_PASSWORD || '',
	MONGO_PORT = process.env.BLOG_MONGO_PORT || 27017,
	POST_LIMIT = process.env.BLOG_POST_LIMIT || '10mb',
	EMAIL = process.env.BLOG_EMAIL || '',
	EMAIL_AUTH = process.env.BLOG_EMAIL_AUTH || '';
	HOT_WORD_LENGTH = 10;
var _config = {
	host:NODE_HOST,
	port:NODE_PORT,
    
	mongoConfig:{
		// mongoose.connect('mongodb://username:password@host:port/database?options...');
		mongodb: 'mongodb://'+MONGO_USER+':'+MONGO_PASSWORD+'@'+NODE_HOST+':'+MONGO_PORT+'/'+MONGO_DATABASE,
	    database: MONGO_DATABASE,
	    server: NODE_HOST
	},
	templateCache:TEMPLATE_CACHE,
	TOKEN_SECRET:TOKEN_SECRET,
	TOKEN_EXPIRES:TOKEN_EXPIRES,
	POST_LIMIT:POST_LIMIT,
	HOT_WORD_LENGTH:HOT_WORD_LENGTH,
	EMAIL:EMAIL,
	EMAIL_AUTH:EMAIL_AUTH,
	NODE_REDIS_PORT:NODE_REDIS_PORT,
	NODE_REDIS_PASS:NODE_REDIS_PASS
}
exports = module.exports = _config;
