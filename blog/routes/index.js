var crypto = require('crypto'),
    model  = require('../models/user.js'),
    User   = model.User;

var settings = require('../settings');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(settings.url)
    
module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('index', { 
        title:   'Express for szy',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
    });
  });
  
  app.get('/szy', function (req, res) {
    res.send('my name is szy.');
  });
  
  app.get('/post', checkNotLogin);
  app.get('/reg', function (req, res) {
      if(req.session.user) {
          res.redirect('/');
      } else {
          res.render('reg', { title: ' 注册 ', user: null, success:null, error:null});
      }
  });
  
  app.get('/post', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name        = req.body.name,
        password    = req.body.password,
        password_re = req.body['password-repeat'],
        eamil       = req.body.eamil;
    
    var newUser = new User({
        userName:   name,
        userPwd:    password,
        userEmail:  eamil
    });
    
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
        req.flash('error', '两次输入的密码不一致!'); 
        res.redirect('/reg');//返回注册页
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    
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
  
  app.get('/post', checkNotLogin);
  app.get('/login', function (req, res) {
      res.render('login', { 
        title:   'Reg',
        user:    req.session.user,
        success: req.flash('success').toString(),
        error:   req.flash('error').toString()
    });
  });
  
  app.get('/post', checkNotLogin);
  app.post('/login', function (req, res) {
      var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
      
      var name     = req.body.name,
          password = req.body.password;
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
  
  app.get('/post', checkLogin);
  app.post('/post', function (req, res) {
    
  });
  
  app.get('/post', checkLogin);
  app.get('/logout', function (req, res) {
      req.session.user = null;
      req.flash('success', '登出成功!');
      res.redirect('/');
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