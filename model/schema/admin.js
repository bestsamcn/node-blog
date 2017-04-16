/**
 * User
 * 用户数据结构
 */
require('../connect');
var mongoose =  require('mongoose');

//用户信息
var AdminSchema = new mongoose.Schema({
	account:{
		type:String,
		require:true,
		unique:true
	},
	password:{
		type:String,
		require:true
	},
	avatar:{
		type:String,
		require:false,
		default:'defaultAvatar.png'
	},
	mobile:{
		type:String,
		require:false,
		default:'',
	},
	email:{
		type:String,
		require:false,
		default:''
	},
	isActive:{
		type:Number,
		require:true,
		default:0
	},
	createLog:{
		createTime:{
			type:Number,
			require:true
		},
		createIp:{
			type:String,
			require:true
		}
	},
	lastLoginTime:{
		type:Number,
		require:false
	},
	userType:{
		type:Number,
		require:true,
		default:1
	},
	setAdminTime:{
		type:Number,
		require:false
	},
	lastUpdateTime:{
		type:Number,
		require:false
	}
});

exports = module.exports = AdminSchema;


