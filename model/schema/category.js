// require('../connect');
var mongoose =  require('mongoose');

var CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        unique:true
    },
    createTime:{
        type:Number,
        require:true,
        default:Date.now()
    }
});
exports = module.exports = CategorySchema;