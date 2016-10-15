var crypto = require('crypto'),
    path   = require('path'),
    User   = require('../models/user.js').User,
    Post   = require('../models/post.js').Post,
    Comment= require('../models/comment.js').Comment,
    markdown = require('markdown').markdown;

var settings = require('../settings');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(settings.url)

var multer = require('multer');

// multer's storage options
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/user')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// var upload = multer({dest: './public/images/user', fieldSize: '1MB'});
var upload = multer({
    storage: storage,
    fileFilter: function(req,file,callback){
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024*1024
    }
});

var getListPost =  function (pageNumber, pageSize, callback){
    var query = Post.find({});
    query.sort({createDate:-1}).skip((pageNumber-1)*pageSize).limit(pageSize);
    query.exec(function(err,docs){
       if(err) console.log(err);
       else if(docs){
           Post.find({}).count(function(err,count){
               if(err) console.log(err);
               callback(null, docs, count);
           });
       }else{
           callback(null,[],-1);
       }
    });
  }

var getListPostByUserName =  function (pageNumber, pageSize, userName, callback){
    var query = Post.find({postName: userName}); // filter by userName
    query.sort({createDate:-1}).skip((pageNumber-1)*pageSize).limit(pageSize);
    query.exec(function(err,docs){
       if(err) console.log(err);
       else if(docs){
           Post.find({postName: userName}).count(function(err,count){
               if(err) console.log(err);
               callback(null, docs, count);
           });
       }else{
           callback(null,[],-1);
       }
    });
  }
    
module.exports = function(app) {
    
  app.get('/', function (req, res) {
    var pageIndex = req.query.p ? parseInt(req.query.p) : 1;
    // 分页
    getListPost(pageIndex, 10, function(err, docs, total){
        res.render('index', { 
        title:   'Express for szy',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString(),
        posts:   docs,
        page:    parseInt(pageIndex),
        isFirstPage: parseInt(pageIndex) - 1 === 0,
        isLastPage:  parseInt(total/10) + 1 <= pageIndex
        });            
    });
  });
  
  //使用_id查询文章
  app.get('/p/:_id', function(req, res){
      Post.findById(req.params._id, function(err, doc){
         if(err) console.log(err);
         else{
             if(!doc) {
                 req.flash('error',"文章不存在!");
                 res.redirect('/');
             }else{
                  Comment.find({postId:doc._id},function(err,coms){
                  if(err) console.log(err);
                    res.render('article', { 
                    title:   doc.postName + "'s article: " + doc.postTitle,
                    user:    req.session.user,
                    success: req.flash('success').toString(),
                    error:   req.flash('error').toString(),
                    post:    doc,
                    comments: coms
                });
              });
            }
         }
      });
  })

  app.get('/u',function(req, res){
      var userName = req.query.userName;
      var pageIndex = req.query.p ? parseInt(req.query.p) : 1;
      User.findOne({userName: userName}, function(err, doc){
          if(!doc) {
              req.flash('error',"用户不存在!");
              res.redirect('/');
          } else{
              getListPostByUserName(pageIndex, 10, userName, function(err, docs, total){
                    res.render('index', { 
                    title:   doc.userName + "'s all posts",
                    user:    req.session.user,
                    success: req.flash('success').toString(),
                    error:   req.flash('error').toString(),
                    posts:   docs,
                    page:    parseInt(pageIndex),
                    isFirstPage: parseInt(pageIndex) - 1 === 0,
                    isLastPage:  parseInt(total/10) + 1 <= pageIndex
              });
          })}
      });
  });  
  
  app.get('/u/:userName',function(req, res){
      console.log(req.query.userName);
      var userName = req.params.userName;
      var pageIndex = req.query.p ? parseInt(req.query.p) : 1;
      User.findOne({userName: userName}, function(err, doc){
          if(!doc) {
              req.flash('error',"用户不存在!");
              res.redirect('/');
          } else{
              getListPostByUserName(pageIndex, 10, userName, function(err, docs, total){
                    res.render('index', { 
                    title:   doc.userName + "'s all posts",
                    user:    req.session.user,
                    success: req.flash('success').toString(),
                    error:   req.flash('error').toString(),
                    posts:   docs,
                    page:    parseInt(pageIndex),
                    isFirstPage: parseInt(pageIndex) - 1 === 0,
                    isLastPage:  parseInt(total/10) + 1 <= pageIndex
              });
          })}
      });
  });

  app.get('/u/:postName/:postTitle',function(req, res){
      
    //   方法一 too conplex!  
    //   var query = Post.find({});
    //   query.where('postName',req.params.postName);
    //   query.where('postTitle',req.params.postTitle);
    //   query.limit(1);
    //   query.exec(function(err,docs){
    //       if(!docs[0]) {
    //           req.flash('error',"文章不存在!");
    //           res.redirect('/');
    //      } else {
    //           res.render('article', { 
    //                 title:   docs[0].postName + "'s article: " + docs[0].postTitle,
    //                 user:    req.session.user,
    //                 success: req.flash('success').toString(),
    //                 error:   req.flash('error').toString(),
    //                 post:    docs[0]
    //             });
    //         }
    //   });
      req.setEncoding('utf8');
      console.log(req.params);
      console.log(req.params.postTitle);//decodeURI
      console.log(decodeURI(req.params.postTitle));
      console.log(decodeURIComponent(req.params.postTitle));//decodeURIComponent()
      Post.findOne({ postName: req.params.postName, postTitle: req.params.postTitle}, function(err,doc){
         if(!doc) {
              req.flash('error',"文章不存在!");
              res.redirect('/');
         } else {
              Comment.find({postId:doc._id},function(err,coms){
                  if(err) console.log(err);
                    res.render('article', { 
                    title:   doc.postName + "'s article: " + doc.postTitle,
                    user:    req.session.user,
                    success: req.flash('success').toString(),
                    error:   req.flash('error').toString(),
                    post:    doc,
                    comments: coms
                });
              });

            }
      });
  });
  
  // push a comment
  app.post('/comment', function (req, res) {
      var newComment = Comment({
          postId: req.body.postId,
          commentName: req.body.name,
          commentEmail: req.body.email,
          commentWebsite: req.body.website,
          commentContent: req.body.content
      });
      if(newComment.postId){
          newComment.save(function(err,doc){
              if(err) {
                  console.log(err);
                  req.flash('error', '留言失败!');
              }
          });
      }else{
          req.flash('success', '留言成功!');
      }
      res.redirect('back');
  });  
  
  app.get('/szy', function (req, res) {
    res.send('my name is szy.');
  });
  
  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
      if(req.session.user) {
          res.redirect('/');
      } else {
          res.render('reg', { title: ' 注册 ', user: null, success:null, error:null});
      }
  });
  
  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name        = req.body.name,
        password    = req.body.password,
        password_re = req.body['password-repeat'],
        eamil       = req.body.eamil;
    
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        req.flash('error', '两次输入的密码不一致!'); 
        res.redirect('/reg');//返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    
    var newUser = new User({
        userName:   name,
        userPwd:    password, // md5 pwd
        userEmail:  eamil
    });
    
    //检查用户名是否已经存在 
    User.findOne({userName: name},function(err,doc){
        if(err) console.log(err);
        if(doc) {
            req.flash('error', '用户名重复!');
            res.redirect('/');
        } else {
            //创建新用户
            newUser.save(function(err,doc){
                if(err) console.log(err)
                console.log('======================create========================');
                console.log(doc);
                console.log('====================================================');
                req.session.user = doc; //用户信息存入 session
                req.flash('success', '注册成功!');
                res.redirect('/');
            });
        }
    });
  });
  
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
      res.render('login', { 
        title:   'Reg',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
    });
  });
  
  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
      var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
      
      var name     = req.body.name,
          password = password; // md5 pwd
      User.findOne({userName: name, userPwd: password},function(err,doc){
          if(err) console.log(err);
          if(doc) {
              req.flash('success', '登陆成功!');
              req.session.user = doc;
              res.redirect('/');
          } else {
              req.flash('error', '密码错误!'); 
              res.redirect('/login');
          }
      });
  });
  
  // check login ?
  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
        res.render('post', { 
        title:   'Post',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
        });
  });
  
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
      var currentUser = req.session.user;
      var newPost = new Post({
          postName:  currentUser.userName,
          postTitle: req.body.postTitle,
          postBody:  req.body.postBody // don't use markdown
          //postBody:  markdown.toHTML(req.body.postBody),
      });
      newPost.save(function(err){
          if(err) {
              console.log(err);
              req.flash('error', "发布失败!"); 
              res.redirect('/');
          } else {
              req.flash('success', "发布成功!"); 
              res.redirect('/');
              }
        });
  });
  
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
      req.session.user = null;
      req.flash('success', '登出成功!');
      res.redirect('/');
  });
  
  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
        res.render('upload', { 
        title:   'upload',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
        });
  });
  
  app.post('/upload', checkLogin);
  app.post('/upload',  upload.fields([{name: 'file1'},{name: 'file2'}]), function (req, res) { 
      for(var i in req.files) {
        console.log(req.files[i]);
      }
      req.flash('success', '文件上传成功!');
      res.redirect('/upload');
  });
  
  app.get('/edit/:postName/:postTitle', checkLogin);
  app.get('/edit/:postName/:postTitle',function(req,res){
      var currentUser = req.session.user;
      Post.findOne({postName: currentUser.userName, postTitle: req.params.postTitle},function(err,doc){
          if(err) {
              console.log(err);
              res.flash('error', err)
              res.redirect('back');
          } else {
              res.render('edit',{
                  title: " 编辑 ",
                  user:    req.session.user,
                  post:    doc,
                  success: req.flash('success').toString(),
                  error:   req.flash('error').toString()
              });
          }
          
      });
  });
  
  app.post('/edit/:postName/:postTitle', checkLogin);
  app.post('/edit/:postName/:postTitle',function(req,res){
      var currentUser = req.session.user;
      Post.findOneAndUpdate({postName: currentUser.userName, postTitle: req.params.postTitle},{postBody:req.body.postBody},function(err,doc){
          if(err) {
              console.log(err);
              res.flash('error', err)
              res.redirect('back');
          } else {
              req.flash('success', '编辑成功!');
              res.redirect('/');
          }
      });
  });
  
  app.get('/remove/:postName/:postTitle', checkLogin);
  app.get('/remove/:postName/:postTitle',function(req,res){
      var currentUser = req.session.user;
      Post.findOne({postName: currentUser.userName, postTitle: req.params.postTitle},function(err,doc){
          if(err) {
              console.log(err);
              res.flash('error', err)
              res.redirect('back');
          } else {
              Post.remove({_id: doc._id},function(err,rmDoc){
                  if(err) {
                      console.log(err);
                      res.flash('error', err)
                      res.redirect('back');
                  } else {
                      // remove this post's comments.
                      Comment.remove({postId: doc._id},function(err,result){
                          if(err) console.log(err);
                          else console.log("remove some comments.");
                      });
                      req.flash('success', ' 删除成功!');
                      res.redirect('/');
                  }
              });
          }
      });
  });
  
  app.get('/links',function(req, res){
      res.render('links',{
        title: " 友情链接",
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
        }); 
  });
  
  function checkLogin(req, res, next){
    if (!req.session.user) {
    req.flash('error', '未登录!'); 
    res.redirect('/login');
    }
    next();
  }
  
  function checkNotLogin(req, res, next){
    if (req.session.user) {
    req.flash('error', '已登录!'); 
    res.redirect('back');//返回之前的页面
    }
    next();
  }
  
  
};