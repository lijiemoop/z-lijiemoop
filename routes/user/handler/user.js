const config = require('../../../config.json');
const lang = require('../../../language/'+config.defaultLanguage+'.json');

module.exports = {
    //获取用户的session信息
    getSession : function(user ,db, next){
        let sqlStr,role,authority = [],userData;

        sqlStr = "select r.name,r.id from user_role u left join role r on r.id=u.roleId where u.userId='"+user.id+"'";
        db.doSql(sqlStr,null,function(doc){
            if(doc.length){
                role = doc[0].name;
                sqlStr = "select a.name,a.id from role_authority r left join authority a on a.id=r.authId where r.roleId='"+doc[0].id+"'";
                db.doSql(sqlStr,null,function(doc){
                    authority = doc;
                    userData = {
                        user : user,
                        role : role,
                        authority : authority
                    };
                    next(userData);
                });
            }else{
                userData = {
                    user : user,
                    role : role,
                    authority : authority
                };
                next(userData);
            }
        });
    },
    //检查用户是否存在
    checkUser : function(context,next){
        let sqlStr,
            resData = {},
            type = context.type,
            item = context.item,
            password = context.password,
            loginType = context.loginType,
            db = context.db;

        if(loginType === 'manage'){
            sqlStr = "select * from user u left join user_role r on u.id=r.userId where u."+ type +"='" + item +"' and r.roleId=1";
        }else{
            sqlStr = "select * from user where "+ type +"='" + item +"'";
        }
        db.doSql(sqlStr,null,function(doc){
            if(doc.length){
                if(password === doc[0].password) {
                    resData.exist = true;
                    resData.user = doc[0];
                }else{
                    resData.exist = false;
                    resData.err = {err : lang.password + lang.not + lang.correct,status : 401};
                }
                next(resData);
            }else{
                resData.exist = false;
                resData.err = {err : lang[type] + lang.not + lang.exist,status : 400};
                next(resData);
            }
        });
    },
    //添加用户
    addUser : function(userData,type,role,db,next){
        let sqlStr,
            userId,
            insertData;

        sqlStr = 'INSERT INTO `user`  SET ?';
        db.doSql(sqlStr,userData,function(){
            sqlStr = "select * from user where "+type+"='"+userData[type]+"'";
            db.doSql(sqlStr,null,function(doc){
                if(doc.length){
                    userId = doc[0].id;
                    sqlStr = 'INSERT INTO `user_role`  SET ?';
                    insertData = {
                        userId : userId,
                        roleId : role ? role : 4
                    }
                }
                db.doSql(sqlStr,insertData,function(){
                    next({ info:(role ? lang.admin:lang.user)+ lang.load_in + lang.success,  status : '200' });
                });
            });
        });
    }
};