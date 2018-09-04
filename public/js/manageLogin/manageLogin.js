var type = 'name',
    itemCheck,
    passwordCheck,
    lang;

$(function(){
    sendMessage('get','','/pub/lang','',function(data){
        lang = data.lang;

        var sendLoginRequest = function(){
            var sendData = {
                type : type,
                item : $('#item').val(),
                password : $('#password').val(),
                loginType : 'manage'
            };

            sendMessage('post','','/user/login',sendData,function(data){
                if(data.status == 200){
                    alert(data.info);
                }else if(data.status == 400){
                    itemCheck = false;
                    $('#item').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                    $('.j-item-err-info').html(data.err);
                }else{
                    passwordCheck = false;
                    $('#password').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                    $('.j-password-err-info').html(data.err);
                }
            });
        };

        var isPasswordCorrect = function(){
            var password = $('#password').val();
            if(!password){
                $('.j-password-err-info').html(lang.password + lang.is_null);
                $('#password').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                return false;
            }
            return true;
        };

        var isItemCorrect = function(){
            var item = $('#item').val();
            if(type == 'name'){
                if(!item){
                    $('.j-item-err-info').html(lang[type] + lang.is_null);
                    $('#item').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                    return false;
                }else{
                    $('#item').css({'border-bottom':'1px solid rgba(255,255,255,.7)'});
                }
            }else if(type == 'email'){
                if(!isEmail(item)){
                    $('.j-item-err-info').html(lang[type] + lang.not + lang.correct);
                    $('#item').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                    return false;
                }else{
                    $('#item').css({'border-bottom':'1px solid rgba(255,255,255,.7)'});
                }
            }else{
                if(!isTel(item)){
                    $('.j-item-err-info').html(lang[type] + lang.not + lang.correct);
                    $('#item').css({'border-bottom':'1px solid rgba(251,37,37,.7)'});
                    return false;
                }else{
                    $('#item').css({'border-bottom':'1px solid rgba(255,255,255,.7)'});
                }
            }
            return true;
        };

        document.onkeydown=function(event) {//键盘事件
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode == 13) {//回车键
                if(document.activeElement.id=='item'){
                    $('#password').focus();
                    return;
                }
                if(document.activeElement.id=='password'){
                    passwordCheck = isPasswordCorrect();
                    if(itemCheck && passwordCheck){
                        sendLoginRequest();
                    }
                }
            }
        };

        var loginCon = $('.j-login-container');


        loginCon.on('focus','.j-login-item>input',function(){
            if(this.id == 'item') $('.j-item-err-info').html('');
            if(this.id == 'password') $('.j-password-err-info').html('');
            $(this).css({'border-bottom':'1px solid rgba(255,255,255,1)'}).prev('span').animate({'top':0,'fontSize':'16px'},100).css({'color':'rgba(255,255,255,.7)'});
        });

        loginCon.on('blur','.j-login-item>input',function(){
            $(this).css({'border-bottom':'1px solid rgba(255,255,255,.7)'}).prev('span').css({'color':'rgba(255,255,255,.55)'});
            if(this.id == 'item'){
                itemCheck = isItemCorrect();
            }
            if(this.id == 'password'){
                passwordCheck = isPasswordCorrect();
            }
            if(this.value) return;
            $(this).prev('span').animate({'top':25,'fontSize':'14px'},100);
        });

        loginCon.on('click','.j-login-header>a',function(){
            $('#item').val(null).css({'border-bottom':'1px solid rgba(255,255,255,.7)'}).prev('span').css({'top':25,'fontSize':'14px'},100).css({'color':'rgba(255,255,255,.4)'});
            $('#password').val(null).css({'border-bottom':'1px solid rgba(255,255,255,.7)'}).prev('span').css({'top':25,'fontSize':'14px'},100).css({'color':'rgba(255,255,255,.4)'});
            if(type == 'name'){
                type = 'tel';
                $('.j-login-header>p').html(lang.tel + lang.login);
                $('.j-login-item>span').eq(0).html(lang.tel+'<p class="j-item-err-info"></p>');
            }else if(type == 'tel'){
                type = 'email';
                $('.j-login-header>p').html(lang.email + lang.login);
                $('.j-login-item>span').eq(0).html(lang.email+'<p class="j-item-err-info"></p>');
            }else{
                type = 'name';
                $('.j-login-header>p').html(lang.user+lang.login);
                $('.j-login-item>span').eq(0).html(lang.user+lang.name+'<p class="j-item-err-info"></p>');
            }
        });

        loginCon.on('click','#login-btn',function(){
            if(itemCheck && passwordCheck){
                sendLoginRequest();
            }
        });

        $('#item').focus();
    });
});