var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('default', function(){
	return nodemon({
		script:'./bin/www',
		ignore:['./public/', './routes/', './node_modules/', './views/'],
		env:{'NODE_DEV': 'developement'}
	});
});