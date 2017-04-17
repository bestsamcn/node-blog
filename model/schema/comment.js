var mongoose = require('mongoose');
var CommentSchema = new mongoose.Schema({
	article:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'Article'
	},
	createTime:{
		type:Number,
		require:true,
		default:Date.now
	},
	createLog:{
		createName:{
			type:String,
			require:false,
			default:'游客'
		},
		createTime:{
			type:Number,
			require:true
		},
		createIp:{
			type:String,
			require:true
		}
	},
	content:{
		type:String,
		require:true
	},
	likeNum:{
		type:Number,
		default:0,
		require:true
	},
	parentComment:{
		type:mongoose.Schema.ObjectId,
		ref:'Comment',
		require:false,
		default:null
	}
});

exports = module.exports = CommentSchema;