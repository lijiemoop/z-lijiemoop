const mysql = require('mysql');
const config = require('../config.json');
const fs = require('fs');
const pubFn = require('../lib/publicFn');
require('colors');
const DBfn = function(next){
    const me = this;
    this.dbConfig = require('./db.json');
    this.currentVersion = require('./currentVersion.json');

    me.checkSchema(() => {
        const connect = me.connect = mysql.createConnection({
            host     :  config.mysql.url,
            user     :  config.mysql.user,
            password :  config.mysql.password,
            database :  config.mysql.database
        });
        connect.connect(function(err) {
            if (err) {
                console.log(('[SQL ERROR]['+ pubFn.getTime('-', ':') + ']').red + '数据库链接出错：');
                console.log('错误信息: ' + err.stack);
                return;
            }
            console.log(('[SUCCESS]['+ pubFn.getTime('-', ':') + ']MYSQL数据库已连接').green);
            if(me.needUpdate()){
                const newTables = me.dbConfig.tables;
                newTables.forEach(function(table){
                    me.createTable(table,function(exist){
                        if(exist){
                            me.updateTable(table);
                        }
                    });
                });
                me.dropTables();
                me.currentVersion.version = me.dbConfig.version;
                fs.writeFileSync("./db/currentVersion.json", JSON.stringify(me.currentVersion));
                console.log(('[SUCCESS]['+ pubFn.getTime('-', ':') + ']MYSQL数据库已更新').green);
            }

            next(me);
        });
    });
};

DBfn.prototype = {
    //检查schema是否存在
    checkSchema : function(next){
        const me = this;
        const connect = me.connect = mysql.createConnection({
            host     :  config.mysql.url,
            user     :  config.mysql.user,
            password :  config.mysql.password
        });
        connect.connect(function(err) {
            if (err) {
                console.log(('[SQL ERROR]['+ pubFn.getTime('-', ':') + ']').red + '数据库链接出错：');
                console.log('错误信息: ' + err.stack);
                return;
            }

            let sqlStr = "select * from information_schema.schemata where schema_name='"+ config.mysql.database +"';";
            me.doSql(sqlStr, null , function(doc){
                if(doc.length) {
                    next();
                } else {
                    sqlStr = 'create schema ' + config.mysql.database;
                    me.doSql(sqlStr, null , function(){
                        next();
                    });
                }
            });

        });
    },
    //删除版本更新中多余的表
    dropTables : function(){
        const me = this;
        let sqlStr,
            dbArray = this.dbConfig.tables,
            haveTable = function(name , array){
                let have = false;
                array.forEach(function(item){
                    if(name === item.name) have = true;
                });
                return have;
            };

        sqlStr = "select table_name from information_schema.tables where table_schema='"+ config.mysql.database +"';";
        me.doSql(sqlStr, null , function(doc){
            let tableName;
            doc.forEach(function(one){
                tableName = one.TABLE_NAME? one.TABLE_NAME: one.table_name;
                if(!haveTable(tableName,dbArray)){
                    sqlStr = 'DROP TABLE '+ tableName;
                    me.doSql(sqlStr);
                }
            });
        });
    },
    //更新表
    updateTable : function(table){
        const me = this;
        let sqlStr,
             tmp;
        sqlStr = 'show columns from '+table.name;

        const checkField = function(name , array){
            let feild = false;
            array.forEach(function(item){
                if(item.Field === name){
                    feild = item;
                }
            });
            return feild;
        };

        me.doSql( sqlStr , null , function(doc){
            //检查设置的表在数据库中是否都有且属性相同，如果不是，更新
            table.columns.forEach(function(column){
                tmp = checkField(column.Field,doc);
                if(tmp){
                    for ( let p in column ) {
                        if ( column.hasOwnProperty( p ) &&  tmp.hasOwnProperty( p ) ) {
                            if(column[p] != tmp[p]){
                                sqlStr = 'alter table '+ table.name+' CHANGE '+ column.Field+' ' + me.getFieldStr(column) ;
                                me.doSql(sqlStr);
                                break;
                            }
                        }
                    }
                }else{
                    sqlStr = 'alter table '+ table.name+' '+ me.getFieldStr(column,' ADD');
                    me.doSql(sqlStr);
                }
            });
            //检查数据库中是否有不在设置中的表，如果有，删除
            doc.forEach(function(d){
                tmp = checkField(d.Field,table.columns);
                if(!tmp){
                    sqlStr = 'alter table '+ table.name +' DROP '+ d.Field;
                    me.doSql(sqlStr);
                }
            });
        });
    },
    //检查数据库的版本
    needUpdate : function(){
        let oldVersion = this.currentVersion.version,
            newVersion = this.dbConfig.version;
        return oldVersion !== newVersion;
    },
    //新建一张表
    createTable : function(table,next){
        const me =this;
        let sqlStr = 'CREATE TABLE IF NOT EXISTS '+ table.name +' (';

        table.columns.forEach(function(column,index,array){
            sqlStr+=me.getFieldStr(column);
            if(index != (array.length - 1)) sqlStr+=',';
        });
        sqlStr+=');';
        me.doSql( sqlStr , null , function(doc){
            next(doc.warningCount);
        });
    },
    //组装列的sql
    getFieldStr : function(column , type){
        let fieldStr = '';
        fieldStr+=( (type?(type + ' '):'') + column.Field + ' ' + column.Type.toUpperCase()) ;
        if(column.Null === 'NO') fieldStr+= ' NOT NULL';
        if(column.Key){
            if(column.Key === 'PRI') fieldStr+= ' PRIMARY KEY';
            if(column.Key === 'UNI') fieldStr+= ' UNIQUE';
        }
        if(column.Default) fieldStr+=(' DEFAULT ' + column.Default);
        if(column.Extra){
            if(column.Extra === 'auto_increment')  fieldStr+=' AUTO_INCREMENT';
        }
        return fieldStr;
    },
    doSql : function( sqlStr ,data, callback){
        const connect = this.connect;
        if(data){
            connect.query(sqlStr, data , function(err ,doc) {
                //如果有错误，打印
                if(err){
                    console.log(('[SQL ERROR]['+ pubFn.getTime('-', ':') + ']').red + '数据库操作出错：');
                    console.log('SQL语句为：'+ sqlStr);
                    console.log('错误信息：'+ err);

                }
                //如果有回调，回调
                else if(callback){
                    callback(doc);
                }
            });
        }else{
            connect.query(sqlStr , function(err ,doc) {
                //如果有错误，打印
                if(err){
                    console.log(('[SQL ERROR]['+ pubFn.getTime('-', ':') + ']').red + '数据库操作出错：');
                    console.log('SQL语句为：'+ sqlStr);
                    console.log('错误信息：'+ err);
                }
                //如果有回调，回调
                else if(callback){
                    callback(doc);
                }
            });
        }
    }
};

module.exports = DBfn;