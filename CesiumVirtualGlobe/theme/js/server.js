
//var baseUrl = 'http://localhost:8888/hfgh-api/';
var baseUrl = '';


//统一访问后台接口方法
function sendAjax(opts) {
    console.log('请求信息：\n' + JSON.stringify(opts)); //日志


    $.ajax({
        url: baseUrl + "/" + opts.url,
        type: opts.type || "post",
        dataType: opts.dataType || "json",
        timeout: opts.timeout || 12000,
        contentType: opts.contentType,
        data: opts.data,
        crossDomain: true,
        beforeSend: function (request) {
            if (opts.loading)
                haoutil.loading.show(opts.loading);

            var token = haoutil.storage.get("token");
            if (token)
                request.setRequestHeader("token", token);
        },
        success: function (result, status, xhr) {
            if (opts.loading)
                haoutil.loading.hide();

            console.log('返回结果：\n' + JSON.stringify(result)); //日志

            if (result && result.code !== 0) {
                if (result.code == 401 && window.top) {
                    top.location.href = "theme/login.html";
                }
                haoutil.msg(result.msg);

                if (opts.error) {
                    opts.error();
                }
            }
            else {
                //正常
                if (opts.success) {
                    opts.success(result.data);
                }
            }
        },
        error: function (data) {
            if (opts.loading)
                haoutil.loading.hide();
            if (opts.noError) return;

            console.log('服务访问出错：\n' + JSON.stringify(data)); //日志
            if (data.status == 401 && window.top) {
                top.location.href = "theme/login.html";
            }
            var msg = opts.errorMsg || ("服务访问出错(" + data.status + ")：" + data.statusText);
            haoutil.msg(msg);

            if (opts.error) {
                opts.error();
            }
        }
    });
}