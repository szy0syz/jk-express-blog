
////////////new function
var crypto = require('crypto'),
    model  = require('../models/user.js'),
    User   = model.User;

var settings = require('../settings');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(settings.url)
    
module.exports = function(app) {
  app.get('/', function (req, res) {
    res.render('index', { title: 'Express for szy' });
  });
  
  app.get('/szy', function (req, res) {
    res.send('my name is szy.');
  });
  
  app.get('/reg', function (req, res) {
    res.render('reg', { title: ' 注册 ' });
  });
  
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
                req.flash('success', '注册成功!');
                res.redirect('/');
            });
        }
    });
  });
  
  
  app.get('/login', function (req, res) {
    res.render('login', { title: ' 登录 ' });
  });
  
  app.post('/login', function (req, res) {
    
  });
  
  app.get('/post', function (req, res) {
    res.render('login', { title: ' 发表 ' });
  });
  
  app.post('/post', function (req, res) {
    
  });
  
  app.get('/logout', function (req, res) {
    
  });
  
};