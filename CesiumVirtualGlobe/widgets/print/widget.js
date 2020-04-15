//此方式：弹窗非iframe模式
var toolPrint = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        resources: [
            'view.css',
        ],
        view: [
            { type: "append", url: "view.html" }
        ],
    },
    //初始化[仅执行1次]
    create: function () {

    },
    winCreateOK: function (opt, result) {
        var that = this;
        $("#btn_print_expimg").click(function () {
            that.expImg();
        });
        $("#btn_print_start").click(function () {
            that.printview();
        });
        $("#btn_print_close").click(function () {
            that.disableBase();
        });
    },
    //激活插件
    activate: function () {
        //隐藏div 
        this.removeRotation()
        $(".no-print-view").hide();

        $(".cesium-viewer-toolbar").hide();
        $(".cesium-viewer-fullscreenContainer").hide();

    },
    //释放插件
    disable: function () {
        //还原显示div 
        $(".no-print-view").show();

        $(".cesium-viewer-toolbar").show();
        $(".cesium-viewer-fullscreenContainer").show();
    },
    removeRotation: function () {
        var that = this;

        that.viewer.clock.shouldAnimate = false;
        that.viewer.clock.onTick._listeners.forEach(function (ev) {
            if (ev.name == 'onTickCallback') {
                that.viewer.clock.onTick.removeEventListener(ev)
            }
        })
    },
    //修改节点样式，开始导出
    changeElStylForStart: function () {
        //$(".no-print").hide();
    },
    //修改节点样式，完成导出
    changeElStylForEnd: function () {
        //$(".no-print").show();
    },
    printview: function () {
        this.changeElStylForStart();

        window.print();

        this.changeElStylForEnd();
    },
    expImg: function () {
        var that = this;
        this.changeElStylForStart();

        haoutil.loading.show();

        this.viewer.render();
        haoutil.file.downloadImage("地图截图", this.viewer.canvas);

        this.changeElStylForEnd();

        haoutil.loading.hide();
    }




}));
