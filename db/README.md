#数据库模块#

*库表的创建、删除
*字段以及字段属性的创建、修改、删除
*创建数据连接（断开）

*数据库版本的控制（自动更新）

#更新数据库表的方法#
1.在"./db.json"的tables中添加、修改一个或多个表或者其中的属性，例如：
{
  "name" : "table_name",                                //表名
  "columns" : [
    {
      "Field"   : "column_name",                        //列名
      "Type"    : "type (unsigned) (zerofill)",         //数据类型
      "Null"    : "NO"/"YES",                           //是否可为空
      "Key"     : "PRI"/"UNI",                          //主键/唯一键
      "Default" : "default值"/null,                     //默认值
      "Extra"   : "auto_increment"/""                   //附加属性
    }
  ]
}
2.修改"./db.json"中version的版本
3.重启服务