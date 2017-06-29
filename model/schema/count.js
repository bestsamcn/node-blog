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
        index:{
            expires:'7d'
        }
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
exports = module.exports = CountSchema;