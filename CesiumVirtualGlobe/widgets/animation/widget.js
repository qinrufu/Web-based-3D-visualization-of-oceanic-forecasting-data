//此方式：弹窗非iframe模式
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        resources: [
            'view.css'
        ],
        //弹窗
        view: {
            type: "append",
            url: "view.html"
        },
    },
    //初始化[仅执行1次]
    create: function () {
        this.isAnimate = this.viewer.clock.shouldAnimate;
    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        var that = this;
        //此处可以绑定页面dom事件

        this.$start = $("#btn-animation-start");
        this.$time = $("#btn-animation-time");
        this.$speed = $("#txt-animation-speed");

        $("#btn-animation-now").click(function (e) {
            that.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        });


        this.$start.click(function (e) {
            that.viewer.clock.shouldAnimate = !that.viewer.clock.shouldAnimate;
            that.updateStatus();
        });

        this.$speed.val(this.viewer.clock.multiplier);
        this.$speed.change(function (e) {
            var val = Number(that.$speed.val());
            if (!isNaN(val))
                that.viewer.clock.multiplier = val; //飞行速度 
        });


        //this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
        setInterval(function () {
            that.clock_onTickHandler();
        }, 1000);
        that.clock_onTickHandler();
    },
    //激活插件
    activate: function () {
        $(".distance-legend").css({
            "bottom": "25px",
        });
        $(".cesium-viewer-timelineContainer").css({ "left": "290px" });

    },
    //释放插件
    disable: function () {



    },
    isAnimate: true,
    updateStatus: function () {
        if (!this.$start || this.isAnimate === this.viewer.clock.shouldAnimate)
            return;
        this.isAnimate = this.viewer.clock.shouldAnimate;

        if (this.isAnimate) {
            this.$start.attr("title", "暂停").html('<i class="fa fa-pause"></i>');
        } else {
            this.$start.attr("title", "继续").html('<i class="fa fa-play"></i>');
        }
    },
    clock_onTickHandler: function () {
        this.updateStatus();

        if (this.$time) {
            var str = Cesium.JulianDate.toDate(this.viewer.clock.currentTime).format("yyyy-MM-dd HH:mm:ss");
            this.$time.html(str);
        }
    },




}));
