var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	createAdmin:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'User'
	},
	createTime:{
		type:Number,
		require:true,
		default:Date.now
	},
	category:[
		{
			type:String,
			require:false
		}
	],
	tags:[
		{
			type:String,
			require:false
		}
	],
	readNum:{
		type:Number,
		require:true,
		default:0
	},
	comment:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'Comment'
	},
	thumnail:{
		type:String,
		require:true
	},
	content:{
		type:String,
		require:true
	},
	previewText:{
		type:String,
		require:true
	},
	likeNum:{
		type:Number,
		require:true,
		default:0
	}
});

exports= module.exports = ArticleSchema; 