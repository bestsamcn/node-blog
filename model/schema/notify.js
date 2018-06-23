var mongoose =  require('mongoose');

var NotifySchema = new mongoose.Schema({
    content:{
        type:String,
        require:true,
    },
    createTime:{
        type:Date,
        require:true,
        default:Date.now()
    },
    lastEditTime:{
        type:Date,
        require:true,
        default:Date.now()
    },
    expireTime:{
        type:Date,
        require:true,
        default:0
    },
    isActive:{
    	type:Boolean,
    	require:true,
    	default:false
    }
});
NotifySchema.index({ expireTime: 1 }, { expireAfterSeconds: 30});
exports = module.exports = NotifySchema;