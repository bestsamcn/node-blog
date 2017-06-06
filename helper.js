var template = require('art-template');
template.helper('roleFilter', function(role) {
    console.log(role)
    if (role === 1) {
        return '管理员'
    }
    if (role === 2) {
        return '超级管理员'
    }
    if (role === 0) {
        return '会员'
    }
});
/** 
 * 对日期进行格式化， 
 * @param date 要格式化的日期 
 * @param format 进行格式化的模式字符串
 *     支持的模式字母有： 
 *     y:年, 
 *     M:年中的月份(1-12), 
 *     d:月份中的天(1-31), 
 *     h:小时(0-23), 
 *     m:分(0-59), 
 *     s:秒(0-59), 
 *     S:毫秒(0-999),
 *     q:季度(1-4)
 * @return String
 * @author yanis.wang
 * @see http://yaniswang.com/frontend/2013/02/16/dateformat-performance/
 */
template.helper('dateFormat', function(date, format) {
    if (!arguments[0]) {
        return '暂无'
    }
    date = new Date(date);
    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
});

/**
 * dateDesc 时间倒序
 * @param {oldDate} 过去的时间戳
 * @return {string} 计算后的时间差
 */
template.helper('dateDesc', function(oldDate) {
    var now = new Date().getTime(),
        past = !isNaN(oldDate) ? oldDate : new Date(oldDate).getTime(),
        diffValue = now - past,
        res = '',
        s = 1000,
        m = 1000 * 60,
        h = m * 60,
        d = h * 24,
        hm = d * 15,
        mm = d * 30,
        y = mm * 12,
        _y = diffValue / y,
        _mm = diffValue / mm,
        _w = diffValue / (7 * d),
        _d = diffValue / d,
        _h = diffValue / h,
        _m = diffValue / m,
        _s = diffValue / s;
    if (_y >= 1) res = parseInt(_y) + '年前';
    else if (_mm >= 1) res = parseInt(_mm) + '个月前';
    else if (_w >= 1) res = parseInt(_w) + '周前';
    else if (_d >= 1) res = parseInt(_d) + '天前';
    else if (_h >= 1) res = parseInt(_h) + '小时前';
    else if (_m >= 1) res = parseInt(_m) + '分钟前';
    else if (_s >= 1) res = parseInt(_s) + '秒前';
    else res = '刚刚';
    return res;
});


/**
 * 将str中的html符号转义,将转义“'，&，<，"，>”五个字符
 * @method unhtml
 * @param { String } str 需要转义的字符串
 * @return { String } 转义后的字符串
 * @example
 * ```javascript
 * var html = '<body>&</body>';
 *
 * //output: &lt;body&gt;&amp;&lt;/body&gt;
 * console.log( UE.utils.unhtml( html ) );
 *
 * ```
 */
template.helper('unhtml', function (str,reg) {
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
});

/**
 * 将str中的转义字符还原成html字符
 * @see UE.utils.unhtml(String);
 * @method html
 * @param { String } str 需要逆转义的字符串
 * @return { String } 逆转义后的字符串
 * @example
 * ```javascript
 *
 * var str = '&lt;body&gt;&amp;&lt;/body&gt;';
 *
 * //output: <body>&</body>
 * console.log( UE.utils.html( str ) );
 *
 * ```
 */
template.helper('html', function (str) {
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
});

/**
 * @name  transformMode 模式转换
 * @param  {num:String} 模式代号
 * @return {CPA | CPS}  返回模式
 */
template.helper('transformMode',function(num){
    var str = '出错';
    if(!num){
        return str;
    }
    num = parseInt(num);
    if(num === 1){
        str = 'CPA';
    }else if(num === 2){
        str = 'CPS';
    }
    return str;
});
