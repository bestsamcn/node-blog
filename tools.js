var PY = require('pinyin');
var _ = require('lodash');
var mongoose = require('mongoose');
var http = require('http');
var util = require('util');

/**
 * @function getClientIp获取客户端ip，
 * @param {req}
 * @return 返回ip地址
 */
var _getClientIp = function (req) {
    var ipAddress;
    var forwardIpStr = req.headers['x-forwarded-for'];
    if (forwardIpStr) {
        var forwardIp = forwardIpStr.split(',');
        ipAddress = forwardIp[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAdress;
    }
    if (!ipAddress) {
        ipAddress = req.socket.remoteAdress;
    }
    if (!ipAddress) {
        if (req.connection.socket) {
            ipAddress = req.connection.socket.remoteAdress;
        }
        else if (req.headers['remote_addr']) {
            ipAddress = req.headers['remote_addr'];
        }
        else if (req.headers['client_ip']) {
            ipAddress = req.headers['client_ip'];
        }
        else {
            ipAddress = req.ip;
        }

    }
    return ipAddress;
};

/**
 * 根据 ip 获取获取地址信息
 */
var _getIpInfo = function(ip, cb) {
    var sina_server = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
    var url = sina_server + ip;

    http.get(url, function(res) {
        var code = res.statusCode;
        console.log(code,'tttttttttttttttttttt')
        if (code == 200) {
            res.on('data', function(data) {
                try {
                    cb(null, JSON.parse(data));
                } catch (err) {
                    cb(err);
                }
            });
        } else {
            cb({ code: code });
        }
    }).on('error', function(e) { cb(e); });
};

/**
 * @function generateArray 生成全数组形式的数据
 * @arrObj {Array} 列表对象 [{name:'haha', age:12},{name:'hehe', age:13}]
 * @breakArr {Array} 拦截的元素 ['name', 'age']
 * @return [['haha', 12], ['hehe', 13]]
 */
var _generateArray = function(arrObj, breakArr){
    breakArr = !!breakArr.length ? breakArr : [];
    var res = [];
    for(var i = 0; i<arr.length; i++){
        res[i]= [];
        for(var j in arr[i]){
            if(j === '_id' || _.indexOf(breakArr,j)) continue;
            res[i].push(arr[i][j]);
        }
    }
    return res;
}
var _dateFormat = function(dateString, formatString){
    dateString = parseInt(dateString);
    if(!arguments[0]){
        return '暂无'
    }
    dateString = new Date(dateString);
    var map = {
        "M": dateString.getMonth() + 1, //月份 
        "d": dateString.getDate(), //日 
        "h": dateString.getHours(), //小时 
        "m": dateString.getMinutes(), //分 
        "s": dateString.getSeconds(), //秒 
        "q": Math.floor((dateString.getMonth() + 3) / 3), //季度 
        "S": dateString.getMilliseconds() //毫秒 
    };
    formatString = formatString.replace(/([yMdhmsqS])+/g, function(all, t){
        var v = map[t];
        if(v !== undefined){
            if(all.length > 1){
                v = '0' + v;
                v = v.substr(v.length-2);
            }
            return v;
        }
        else if(t === 'y'){
            return (dateString.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return formatString;
}

//html转义
var _unhtml= function(str, reg){
    return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
        if (b) {
            return a;
        } else {
            return {
                '<':'&lt;',
                '&':'&amp;',
                '"':'&quot;',
                '>':'&gt;',
                "'":'&#39;'
            }[a]
        }
    }) : '';
}

//转html
var _tohtml = function(str){
    return str ? str.replace(/&((g|l|quo)t|amp|#39|nbsp);/g, function (m) {
        return {
            '&lt;':'<',
            '&amp;':'&',
            '&quot;':'"',
            '&gt;':'>',
            '&#39;':"'",
            '&nbsp;':' '
        }[m]
    }) : '';
} 

//检测是否是objectid
var _isObjectID = function(_id){
    return mongoose.Types.ObjectId.isValid(_id);
}

/**
 *@function getPinyin 汉字转拼音
 *@param {Array} bufArr 拼音单体的二维拼音 
 *@param {Boolean} isAll 转换的类型，true是全拼，false是首字母，默认true
 *@return {String} 返回合体后的汉字拼音 
 *@example
 * getPinyin([['ha'],['ha']])=>haha
 */
 var _getPinyin = function(bufArr,isAll){
    var str = '';
    isAll = !!isAll;
    if(!bufArr.length) return str;
    str = isAll ? PY(bufArr, {style:PY.STYLE_NORMAL}).join('').toString() : PY(bufArr, {style:PY.STYLE_FIRST_LETTER}).join('').toString();
    return str;
 }


exports.getClientIp = _getClientIp;
exports.getPinyin = _getPinyin;
exports.generateArray = _generateArray;
exports.dateFormat = _dateFormat;
exports.unhtml = _unhtml;
exports.tohtml = _tohtml;
exports.isObjectID = _isObjectID;
exports.getIpInfo = _getIpInfo;

