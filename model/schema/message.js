/**
 * 用户留言数据结构
 */
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;
 var MessageSchema = new Schema({
 	name:{
 		type:String,
 		require:true
 	},
 	email:{
 		type:String,
 		require:true
 	},
 	content:{
 		type:Schema.Types.Mixed,
 		require:true
 	},
 	isRead:{
 		type:Boolean,
 		default:false,
 		require:true
 	},
 	readTime:{
 		type:Number,
 		require:false
 	},
 	postTime:{
 		type:Number,
 		require:true
 	}
 });
 exports = module.exports = MessageSchema;