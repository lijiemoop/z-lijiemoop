var sendMessage = function(type,port,url,data,next){
    if(type === 'get'){
        $.get(port + url,function(data,status){
            if(status === 'success'){
                next(data);
            }else{
                console.log(port,url,status);
            }
        });
    }
    else if(type === 'post'){
        $.post(port + url,data,function(data,status){
            if(status === 'success'){
                next(data);
            }else{
                console.log(port,url,status);
            }
        });
    }
};

var isEmail = function(email){
    var szReg=/^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/;
    var res = szReg.test(email);
    return res;
};

var isTel = function(tel){
    var szReg=/^1[34578]\d{9}$/;
    var res = szReg.test(tel);
    return res;
};