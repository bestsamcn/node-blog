var mongoose =  require('mongoose');

var CountSchema = new mongoose.Schema({
    accessip:{
        type:String,
        require:true
    },
    createTime:{
        type:Number,
        require:true,
        default:Date.now(),
    },
    apiName:{
        type:String,
        require:true,
        default:''
    },
    address:{
        country:{
            type:String,
            require:false,
            default:'' 
        },
        province:{
            type:String,
            require:false,
            default:''
        },
        city:{
            type:String,
            require:false,
            default:''
        },
        district:{
            type:String,
            require:false,
            default:''
        }
    }
});

CountSchema.index({ createTime: 1 }, { expireAfterSeconds: 7*3600});
exports = module.exports = CountSchema;