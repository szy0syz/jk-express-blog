# jk-express-blog

### Change Log
##### 2016-09-29 v0.1
* 完成基本功能（包含登录、注册、发表帖子）

##### 2016-09-30 v0.2
* 完成Markdown功能 
* 完成图片上传功能(multer)
* 修复用户密码MD5加密存储
* 实现用户页面和文章页面

##### 2016-10-06 v0.3
* 实现帖子的编辑功能
* 实现帖子的留言功能(留言单独存放collections,  通过postId与帖子链接)
* 实现帖子的删除功能

##### 2016-10-07 v0.4
* 实现首页(所有用户页)和用户页的分页功能

##### 2016-10-08 v0.5
* 发帖功能页面TextArea区使用KindEditor编辑器

----
### Todo
- [x] ~~删除某帖子时，其下游Comments也删除；~~
- [ ] 提交url时，中文报错问题；
- [x] ~~实现分页功能；~~
- [ ] 新增存档页面；
- [ ] 新增便签和便签页面；
- [ ] 增加pv统计和留言统计
- [ ] 增加文章检索功能
- [ ] 增加友情链接
- [ ] 增加404页面
- [ ] 增加头像
- [ ] 增加转载功能和转载统计
- [ ] 增加日志功能
- [ ] 使用MongoDB _id 查询
- [ ] 使用Async
- [ ] 使用Disqus
- [ ] 使用generic pool
- [ ] 使用Handlebars
- [x] ~~使用KindEditor~~
- [ ] 使用Passport

----
### Summary
* <font color="#FF0000">千万别用mongodb原生Node客服端，天大的坑！</font>
* 最好还是用mongoose，真的好用啊！！！
* 记住了post方法要用req.body；get方法里要用req.params ！！！！！
* 在Node中一定要用callback方式返回值，千万别用return，坑啊！！！
* 真的再次体会到了Node里异步的优势，全部使用回调函数返回值，不用return！！！