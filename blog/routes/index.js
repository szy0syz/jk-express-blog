var crypto = require('crypto'),
    path   = require('path'),
    User   = require('../models/user.js').User,
    Post   = require('../models/post.js').Post,
    Comment= require('../models/comment.js').Comment,
    Tags   = require('../models/tags.js').Tags,
    markdown = require('markdown').markdown;

var settings = require('../settings');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
mongoose.connect(settings.url)

var Promise = require("bluebird");
var Join = Promise.join;

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

// 所有文章
var getListPost =  function (pageNumber, pageSize, callback){
    var query = Post.find({});
    query.sort({createDate:-1}).skip((pageNumber-1)*pageSize).limit(pageSize);
    //好激动，哥的异步力量要觉醒了~~~
    query.exec().then(function(postList){
        //console.log(postList); //OK
        //callback(null,[],-1);
        Post.countAsync().then(function(count){
            //console.log("count: " + count); //OK
            var postViewModels = [];
            Promise.map(postList, function(doc){
                var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName").exec();
                var commentQuery = Comment.find({postId:doc._id}).select("_id").exec();
                return Join(tagQuery, commentQuery, function(tags, comments){ //如果在循环里还有查询，只能用join连接起来！
                    var model = {};
                    model            = doc;   //这里不应该偷懒，应该改一哈！
                    model.tags       = tags;  //衍生属性，怎么打印不出来啊！
                    model.commentQty = comments.length;
                    return model;
                })
            }).then(function(docList){
                callback(null,docList,count);
            }).error(function(e){
                callback(e,[],-1);
            });
            //console.log("count: " + postViewModels); //xx
        });
    });
    
    // query.exec().then(function(postList){
    //     if(postList) {
    //         Post.find({}).then(function(allList){ //查所有文章数量
    //         var postViewModels = [];
    //         postList.forEach(function(doc, index){
    //             var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName");
    //             var commentQuery = Comment.find({postId:doc._id}).select("_id");
    //             tagQuery.exec().then(function(tags){
    //                 //console.log(tags); //OK
    //                 //console.log(allList); //OK
    //                 commentQuery.exec().then(function(comments){
    //                     var postViewModel = {};
    //                     //console.log(allList); //OK
    //                     //console.log(comments); //OK
    //                     postViewModel            = doc;
    //                     postViewModel.tags       = tags; // [{...}, {...}]
    //                     postViewModel.commentQty = comments.length; // comment qty
    //                     postViewModels.push(postViewModel);
    //                     //console.log(postViewModel.tags);
    //                 });
    //             });
    //         });
    //         console.log(postViewModels);
    //         }).then(function(list){
    //             //console.log(list[1]);
    //             callback(null,list,allList.length);
    //         });
    //     }
    //     else {
    //         callback(null,[],-1);
    //     }
    // });
    
    
    // query.exec(function(err,docs){
    // // var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName");
    // // var commentQuery = Comment.find({postId:doc._id}).sort({createDate: 1});
    //     //此处需要重构！！！重新生成对象了！！
    //     if(err) console.log(err);
    //     else if(docs){
    //         Post.find({}).count(function(err,count){
    //             if(err) console.log(err);
    //             var postViewModels = [];
    //             docs.forEach(function(doc, index){
    //                 // console.log(doc); //有值
    //                 var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName");
    //                 var commentQuery = Comment.find({postId:doc._id}).select("_id");
    //                 var postViewModel = {}; // 这里最好是new，别这样整，后期做了。
    //                 tagQuery.exec(function(err, tagDocs){
    //                     commentQuery.exec(function(err, commentDocs){
    //                         postViewModel            = doc;  // obj
    //                         postViewModel.tags       = tagDocs; // [{...}, {...}]
    //                         postViewModel.commentQty = commentDocs.length; // comment qty
    //                         postViewModels.push(postViewModel);
    //                     });
    //                 });
    //             });
    //             //http://stackoverflow.com/questions/25798691/mongoose-with-bluebird-promisifyall-saveasync-on-model-object-results-in-an-ar
    //             //console.log(postViewModels); //null
    //             callback(null, postViewModels, count);
    //         });
    //   }else{
    //       callback(null,[],-1);
    //   }
    // });
  }
  
var getListPostBytagId = function(pageNumber, pageSize, tagId, callback) {
    var query = Post.find({postTags: tagId});
    query.sort({createDate:-1}).skip((pageNumber-1)*pageSize).limit(pageSize);
    query.exec().then(function(postList){
        console.log(postList);
        Post.countAsync().then(function(count){
            var postViewModels = [];
            Promise.map(postList, function(doc){
                var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName").exec();
                var commentQuery = Comment.find({postId:doc._id}).select("_id").exec();
                return Join(tagQuery, commentQuery, function(tags, comments){ //如果在循环里还有查询，只能用join连接起来！
                    var model = {};
                    model            = doc;   //这里不应该偷懒，应该改一哈！
                    model.tags       = tags;  //衍生属性，怎么打印不出来啊！
                    model.commentQty = comments.length;
                    return model;
                })
            }).then(function(docList){
                callback(null,docList,count);
            }).error(function(e){
                callback(e,[],-1);
            });
        });
    });
}

var getListPostByPostTitle = function(pageNumber, pageSize, val, callback) {
    //var query = Post.find({postName: {$regex: val}});
    var query = Post.find({postTitle: {$regex: val}});
    query.sort({createDate:-1}).skip((pageNumber-1)*pageSize).limit(pageSize);
    query.exec().then(function(postList){
        Post.countAsync().then(function(count){
            var postViewModels = [];
            Promise.map(postList, function(doc){
                var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName").exec();
                var commentQuery = Comment.find({postId:doc._id}).select("_id").exec();
                return Join(tagQuery, commentQuery, function(tags, comments){ //如果在循环里还有查询，只能用join连接起来！
                    var model = {};
                    model            = doc;   //这里不应该偷懒，应该改一哈！
                    model.tags       = tags;  //衍生属性，怎么打印不出来啊！
                    model.commentQty = comments.length;
                    return model;
                })
            }).then(function(docList){
                callback(null,docList,count);
            }).error(function(e){
                callback(e,[],-1);
            });
        });
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

var getPostById = function (id, callback) {
    // 类似于三层模式里BLL里的方法
    Post.findById(id, function(err, doc){
        if(err) console.log(err);
        if(!doc) { //文章不存在
            callback('文章不存在');
        }
        else { //文章存在
            //标签
            var postViewModel = {};
            var tagQuery = Tags.find({_id: {$in:doc.postTags}}).select("_id tagName");
            var commentQuery = Comment.find({postId:doc._id}).sort({createDate: 1});
            tagQuery.exec(function(err, tagDocs){
                commentQuery.exec(function(err, commentDocs){
                    postViewModel = doc; //obj
                    postViewModel.tags = tagDocs; // [{...}, {...}]
                    postViewModel.comments = commentDocs; // [{...}, {...}]
                    postViewModel.commentQty = commentDocs.length; // comment qty
                    callback(null, postViewModel);
                });
            });

            // Tags.find({_id: {$in:doc.postTags}}, function(err, docs){
            //     console.log(docs);
            // })
            // doc.postTags.forEach(function(val, index){
            //     Tags.findById(val, function(err, tagDoc){
            //         if(err) console.log(err);
            //         var tagRaw = {};
            //         tagRaw._id = tagDoc._id;
            //         tagRaw.tagName = tagDoc.tagName;
            //         tagList[index] = tagRaw;  // 有一次掉入异步的坑里
            //         console.log("tag;;;; " + tagRaw.tagName);
            //     });
            //     console.log("tagl: xxx  " + tagList + "nnn");
            // });
        }
    });
}
    
module.exports = function(app) {
    
  // 主页   
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
  
    // 使用_id查询文章
    // 已重构的代码，好高端啊！
    app.get('/p/:_id', function(req, res){
        getPostById(req.params._id,function(err, doc){
            if(err) {
                req.flash('error',err);
                res.redirect('/');
            }
            else {
                res.render('article', { 
                title:   doc.postName + "'s article: " + doc.postTitle,
                user:    req.session.user,
                success: req.flash('success').toString(),
                error:   req.flash('error').toString(),
                model:    doc // 统一往前端传model
            });
            }
            
        });
    });
    
    //   以下代码是未重构前的代码，好low啊~~~
    //   Post.findById(req.params._id, function(err, doc){
    //      if(err) console.log(err);
    //      else{
    //          if(!doc) {
    //              req.flash('error',"文章不存在!");
    //              res.redirect('/');
    //          } else {
    //               //doc.update({$inc: {pv:1}}, { w: 1 }); //update方法属于model，在document上肯定是无效的！！！
    //               doc.pv += 1; // 阅读数+1
    //               doc.save(function(err, raw){
    //                   if(err) console.log(err);
    //                   //console.log(raw);
    //               });
    //             //  这种方法可以用，但复杂了点。
    //             //   Post.update({_id: doc._id}, {$inc: {pv:1}}, function(err, raw){
    //             //       if(err) console.log(err);
    //             //       console.log(raw); //{ ok: 1, nModified: 1, n: 1 } 
    //             //   });
    //             //
    //             getPostById(req.params._id,function(err, doc){
    //                 console.log(doc.comments);
    //             })
    //               Comment.find({postId:doc._id},function(err,coms){
    //               if(err) console.log(err);
    //               else {
    //                 res.render('article', { 
    //                 title:   doc.postName + "'s article: " + doc.postTitle,
    //                 user:    req.session.user,
    //                 success: req.flash('success').toString(),
    //                 error:   req.flash('error').toString(),
    //                 post:    doc,
    //                 comments: coms
    //                 });
    //               }
    //           });
    //         }
    //      }
    //   });


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
      Tags.find({}, function(err, docs){
        res.render('post', { 
        title:   'Post',
        user:    req.session.user,
        tags:    docs,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
        });
      })
  });
  
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
      var currentUser = req.session.user;
      // 这里首先将tags分割用逗号，然后插入tags的collections里
      // 然后再讲_id 和 tagName 返回存post.tags里
      var tagsIdRaw = req.body.tagIdList;
      //tagsArray = tagsRaw.split(',');
      var tags = tagsIdRaw.toString().split(',');
      // Book.insertMany(rawDocuments, function (err, mongooseDocuments { /* ... */ });
    //   var rawDocs = [];
    //   tagsArray.forEach(function(tag, index){
    //     var newTags = {tagName:tag}; //and more...
    //     rawDocs.push(newTags);
    //   });
    //   Tags.insertMany(rawDocs, function(err, docs){
    //       if(err) console.log(err);
    //       console.log(docs);
    //   })
      //待处理
      var newPost = new Post({
          postName:  currentUser.userName,
          postTitle: req.body.postTitle,
          postBody:  req.body.postBody, // don't use markdown
          postTags:  tags
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
  
  app.get('/edit/:_id', checkLogin);
  app.get('/edit/:_id',function(req,res){
      var currentUser = req.session.user;
      Post.findById(req.params._id,function(err,doc){
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
  
  app.post('/edit/:_id', checkLogin);
  app.post('/edit/:_id',function(req,res){
      var currentUser = req.session.user;
      Post.findByIdAndUpdate(req.params._id,{postBody:req.body.postBody},function(err,doc){
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
  
  app.get('/remove/:_id', checkLogin);
  app.get('/remove/:_id',function(req,res){
      var currentUser = req.session.user;
      Post.findById(req.params._id,function(err,doc){
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
  
  app.get('/archive',function(req, res){
      var query = Post.find({});
      query.select('postName postTitle createDate.std');
      query.sort({createDate: -1});
      query.exec(function(err,docs){
          if(err) {console.log(err);}
          else {
              var newDocs = new Array();
              //var temp = {}; //如果把temp声明在外面，则其值只有一个，不变？
              for(var i=0; i<docs.length; i++){
                 var temp = {}; //空对象
                 temp._id = docs[i]._id;
                 temp.postName = docs[i].postName;
                 temp.postTitle = docs[i].postTitle;
                 temp.year = docs[i].createDate.std.substring(0,4); 
                 temp.month = docs[i].createDate.std.substring(5,7); 
                 temp.day = docs[i].createDate.std.substring(8,10);
                 newDocs[i] = temp;
              }    
                res.render('archive',{
                title: " 文章存档",
                user:    req.session.user,
                posts:    newDocs,
                success: req.flash('success').toString(),
                error:   req.flash('error').toString()
                }); 
          }
      });
  });  
  
  app.get('/tags',function(req, res){
      var query = Tags.find({});
      query.sort({createDate:-1});
      query.exec(function(err, docs){
         if(err) console.log(err);
         console.log(docs);
         res.render('tags',{
            title: " 标签",
            user:    req.session.user,
            tags:    docs,
            success: req.flash('success').toString(),
            error:   req.flash('error').toString()
            });
      });
      
       
  });
  
  app.get('/tags/:_id',function(req, res){
        var tagId = req.params._id;
        var pageIndex = req.query.p ? parseInt(req.query.p) : 1;
        getListPostBytagId(pageIndex, 10, tagId, function(err, docs, total){
            res.render('listPage', { 
                title:   'tag',
                user:    req.session.user,
                success: req.flash('success').toString(),
                error:   req.flash('error').toString(),
                models:   docs,
                page:    parseInt(pageIndex),
                isFirstPage: parseInt(pageIndex) - 1 === 0,
                isLastPage:  parseInt(total/10) + 1 <= pageIndex
            });
        });

  });
  
    app.get('/search',function(req, res){
        var pageIndex = req.query.p ? parseInt(req.query.p) : 1;
        var keyword = req.query.keyword;
        var pattern = new RegExp(keyword, "i");
        getListPostByPostTitle(pageIndex, 10, pattern, function(err, docs, total){
            res.render('listPage', { 
                title:   'search',
                user:    req.session.user,
                success: req.flash('success').toString(),
                error:   req.flash('error').toString(),
                models:   docs,
                page:    parseInt(pageIndex),
                isFirstPage: parseInt(pageIndex) - 1 === 0,
                isLastPage:  parseInt(total/10) + 1 <= pageIndex
            });
        });
  });
  
  //404页面
  app.use(function (req, res) {
    res.render("404");
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