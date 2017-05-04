require('../connect');
var mongoose =  require('mongoose');

var TagSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        unique:true
    },
    createTime:{
        type:Number,
        require:true,
        default:Date.now()
    },
    clickNum:{
        type:Number,
        require:true,
        default:0
    }
});
exports = module.exports = TagSchema;