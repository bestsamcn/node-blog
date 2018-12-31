var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	creator:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'User'
	},
	createTime:{
		type:Number,
		require:true,
		default:Date.now
	},
	lastEditTime:{
		type:Number,
		require:false
	},
	category:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'Category'
	},
	tagName:{
		type:String,
		require:true,
		default:''
	},
	categoryName:{
		type:String,
		require:true,
		default:''
	},
	tag:{
		type:mongoose.Schema.ObjectId,
		require:true,
		ref:'Tag'
	},
	readNum:{
		type:Number,
		require:true,
		default:0
	},
	commentNum:{
		type:Number,
		require:true,
		default:0
	},
	thumnail:{
		type:String,
		require:false
	},
	poster:{
		type:String,
		require:false
	},
	content:{
		type:String,
		require:true
	},
	codeContent:{
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
	},
	title:{
		type:String,
		require:true
	},
	isTop:{
		type:Boolean,
 		default:false,
 		require:true
	},
	private:{
		type:Number,
		require:true,
		default:0
	},
	pinYin:[
		{
			type:String,
			require:false
		}
	]
});
ArticleSchema.index({'$**': 'text'});
exports= module.exports = ArticleSchema; 