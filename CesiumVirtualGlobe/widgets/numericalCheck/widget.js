//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 500,
                height: 200
            }
        },
    },
    //初始化[仅执行1次]
    create: function () {

    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    data: null,
    //打开激活
    activate: function () {
        this.data = this.config.data;
        console.log(this.data)
        this.viewWindow.setEchartsData(this.data);
    },
    //关闭释放
    disable: function () {
        this.viewWindow = null;
        this.data = null;
    },
    //内置方法，不重启方式刷新页面
    update: function () {
        this.data = this.config.data;
        this.viewWindow.setEchartsData(this.data);
    }




}));

