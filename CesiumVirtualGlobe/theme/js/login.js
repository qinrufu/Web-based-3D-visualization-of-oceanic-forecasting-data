'use strict';  

$(document).ready(function () {
    initView();
});

function initView() {
    //根据设置，加载不同样式或皮肤
    setStyleByTheme();

    var guid;

    // 验证码刷新
    $('.reload-vify').on('click', function () {
        var $img = $(this).children('img');
        guid = getGUID();

        $img.prop('src', baseUrl + 'userlogin/captcha.jpg?uuid=' + guid);
    });
    $('.reload-vify').click();




    //登录按钮
    $("#btnLogin").click(function () {

        var user = $("#txtUser").val();
        if (user == null || user.length == 0) {
            layer.tips('请输入用户名', '#txtUser');
            return;
        }

        var pwd = $("#txtPwd").val();
        if (pwd == null || pwd.length == 0) {
            layer.tips('请输入密码', '#txtPwd');
            return;
        }
        //var captcha = $("#txtCaptcha").val();
        //if (captcha == null || captcha.length == 0) {
        //    layer.tips('请输入验证码', '#txtCaptcha');
        //    return;
        //}

        //请求后端，完成登录验证
        //sendAjax({
        //    url: "userlogin/login",
        //    data: {
        //        "username": user,	//登录用户名	
        //        "password": pwd,	//登录密码	
        //        "captcha": captcha,	//登录验证码	
        //        "uuid": guid,	    //登录验证码对应的uuid标识
        //    },
        //    type: "post",
        //    success: function (data) { 
        //        haoutil.storage.add("token", data.token);
        //        haoutil.storage.add("user", JSON.stringify(data));

        //        location.href = "index.html"; 
        //    },
        //    error: function () {
        //        $("#txtCaptcha").val('');
        //        $('.reload-vify').click();
        //    }
        //});

        //客户端校验
        var arrUser = [
            { user: 'admin', pwd: 'admin' },
        ];

        var checkStatus = false;
        for (var i = 0; i < arrUser.length; i++) {
            var item = arrUser[i];
            if (user == item.user && pwd == item.pwd ) {
                checkStatus = true;
                break;
            }
        }
        if (checkStatus) {
            haoutil.storage.add("user", JSON.stringify({ name: user}));
            location.href = "index.html";
        } else {
            layer.tips('用户名或密码错误', '#txtUser'); 
        }


    });

    $(document).keyup(function (event) {
        if (event.keyCode == 13) {
            $("#btnLogin").trigger("click");
        } 
    });


}



function getGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


//根据设置，加载不同样式
function setStyleByTheme() {
    setInterval(slideSwitch, 5000);
    slideSwitch();
}

//图片轮播
function slideSwitch() {
    var $active = $('#loginBJ IMG.active');
    if ($active.length == 0) $active = $('#loginBJ IMG:last');

    // use this to pull the images in the order they appear in the markup
    var $next = $active.next().length ? $active.next()
        : $('#loginBJ IMG:first');
    $active.addClass('last-active');

    $next.css({ opacity: 0.0 })
        .addClass('active')
        .animate({ opacity: 1.0 }, 1000, function () {
            $active.removeClass('active last-active');
        });
}
