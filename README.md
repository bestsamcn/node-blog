# Node-Blog
### 博客[vue-blog](https://github.com/bestsamcn/vue-blog)后台接口列表，无其他视图路由功能

## 描述
此项目共有6个模块,分别实现了管理, 文章，评论，访问，留言等主要功能。

## 功能
- 通过``redis``和``simple-jwt``实现管理员token登录验证；
- 使用``mongodb``保存网站数据；
- 拥有本机网站数据统计功能
- 使用``gulp-nodemon``实现自动重启

## 环境
- node 4.4.x
- mongodb 3.2.x
- redis 3.2.x
- gulp 3.9.x

## 开发
请先启动``redis``和``mongodb``,执行以下命令：
```bash
git clone https://github.com/bestsamcn/node-blog.git
cd node-blog
npm install
gulp
```