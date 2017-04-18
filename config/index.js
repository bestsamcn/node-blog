var NODE_ENV = process.env.NODE_ENV || 'development',
	NODE_HOST = process.env.NODE_HOST || '127.0.0.1',
	NODE_PORT = process.env.NODE_PORT || 3040,
	TOKEN_SECRECT = process.env.TOKEN_SECRECT || 'node-blog',
	NODE_REDIS_PORT = process.env.NODE_REDIS_PORT || 6379,
	TEMPLATE_CACHE = ( NODE_ENV !== 'development' ),
	MONGO_DATABASE = process.env.MONGO_DATABASE || 'blog',
	MONGO_USER = process.env.MONGO_USER || '',
	MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
	MONGO_PORT = process.env.MONGO_PORT || 27017;
var _config = {
	host:NODE_HOST,
	port:NODE_PORT,
	mongoConfig:{
		// mongoose.connect('mongodb://username:password@host:port/database?options...');
		// mongodb: 'mongodb://admin:123123@10.28.5.197/swyc',
		mongodb: 'mongodb://'+MONGO_USER+':'+MONGO_PASSWORD+'@'+NODE_HOST+':'+MONGO_PORT+'/'+MONGO_DATABASE,
	    database: MONGO_DATABASE,
	    server: NODE_HOST
	},
	templateCache:TEMPLATE_CACHE,
	TOKEN_SECRECT:TOKEN_SECRECT
}
exports = module.exports = _config;
