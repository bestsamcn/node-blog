var mongoose =  require('mongoose');

var CountSchema = new mongoose.Schema({
    accessip:{
        type:String,
        require:true
    },
    createTime:{
        type:Number,
        require:true,
        default:Date.now()
    },
    apiName:{
        type:Number,
        require:true,
        default:0
    },
    city:{
        type:String,
        require:false,
        default:''
    }

});
exports = module.exports = CountSchema;