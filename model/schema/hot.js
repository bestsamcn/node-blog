var mongoose =  require('mongoose');

var HotSchema = new mongoose.Schema({
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
    num:{
        type:Number,
        require:true,
        default:0
    }
});
exports = module.exports = HotSchema;