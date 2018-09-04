const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const userHandler = require('./handler/user.js');
const config = require('../../config.json');
const lang = require('../../language/'+config.defaultLanguage+'.json');

//注销
router.get('/logout',function(req,res){
    const redirectUrl = req.query.redirectUrl;
    req.session.userData = undefined;
    res.redirect(redirectUrl);
});
//用户登录
router.post('/login',function(req,res){
    let type = req.body.type,
        item = req.body.item,
        password = req.body.password,
        loginType = req.body.loginType,
        context;

    if(!item || item === 'undefined'){
        res.send({err:type + lang.is_null,  status : 400});
        return;
    }

    if(!password || password === 'undefined'){
        res.send({err:lang.password + lang.is_null,  status : 401});
        return;
    }

    password = crypto.createHash('md5').update(password).digest('base64');

    context = {
        type : type,
        item : item,
        password : password,
        loginType : loginType,
        db : req.db
    };

    userHandler.checkUser(context,function(data){
        if(data.exist){
            userHandler.getSession(data.user,req.db,function(userData){
                req.session.userData = userData;
                req.session.userData.password = undefined;
                res.send({info:lang.login + lang.success,status:200});
            });
        }else{
            res.send(data.err);
        }
    });
});
//添加用户
router.post('/addUser', function(req, res) {
    let type = req.post.type,
        item = req.post.item,
        password = req.post.password,
        role = req.post.role,
        registerTime = new Date().getTime(),
        userData,
        sqlStr;

    password = crypto.createHash('md5').update(password).digest('base64');
    userData = {
        integral : 0,
        experience : 0,
        registerTime : registerTime,
        password : password
    };
    //非超级管理员用户不能添加用户
    if(role){
        if(!req.session.userData){
            if(req.session.userData.role != 1){
                res.send({err: "session" + lang.verification + lang.not_passed,  status : 400});
                return;
            }
        }
    }

    if(!item || item === 'undefined'){
        res.send({err:type + lang.is_null,  status :400});
        return;
    }

    if(!password || password === 'undefined'){
        res.send({err:lang.password + lang.is_null,  status : 400});
        return;
    }
    sqlStr = "select * from user where "+type+"='"+item+"'";
    req.db.doSql(sqlStr,null,function(doc){
        if(doc.length){
            res.send({err:type + lang.exist,  status : 400});
        }else{
            if(type === 'tel'){
                userData.tel = item;
            }else if(type === 'email'){
                userData.email = item;
            }else if(type === 'name'){
                userData.name = item;
            }else{
                res.send({err:lang.illegal + lang.register + lang.path,  status : 406});
                return;
            }
            userHandler.addUser(userData,type,role,req.db,function(msg){
                res.send(msg);
            });
        }
    });
});

module.exports = router;
