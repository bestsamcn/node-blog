// require('../connect');
var mongoose =  require('mongoose');

var CategorySchema = new mongoose.Schema({
    value:{
        type:Number,
        require:true
    },
    text:{
        type:String,
        require:true
    },
    createTime:{
        type:Number,
        require:true,
        default:Date.now()
    }
});
exports = module.exports = CategorySchema;