
var AdminModel = require('../../model').AdminModel;

//创建管理员
var _createAdmin = function(req, res){
	res.send('createAdmin', req.query);
}

exports.createAdmin = _createAdmin;