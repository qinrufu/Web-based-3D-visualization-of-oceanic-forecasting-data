/* 2017-11-30 16:56:24 | 修改 木遥（QQ：516584683） */
//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 220,
                height: 90
            }
        },
    },
    drawControl: null,
    //初始化[仅执行1次]
    create: function () {
        this.drawControl = new mars3d.Draw(this.viewer, { hasEdit: false, });
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {

    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
        this.clearDraw();
    },
    drawPolyline: function () {
        var that = this;
        this.drawControl.startDraw({
            type: "polyline",
            style: {
                color: "#ffff00",
                width: 3
            },
            success: function (entity) {
                that.drawLineOk(entity);
            }
        });
    },
    clearDraw: function () {
        this.drawControl.deleteAll();
        mars3d.widget.disable(this.jkWidgetUri);
    },
    drawLineOk: function (entity) {
        haoutil.loading.show({
            type: "loader-default",
            text: "正在处理获取高程数据……"
        });

        var that = this;
        var positions = entity.polyline.positions.getValue();


        var alllen = 0;
        var arrLen = [];
        var arrHB = [];
        var arrLX = [];
        var arrPoint = [];

        var index = 0;
        function getLineFD() {
            index++;

            var arr = [positions[index - 1], positions[index]];
            mars3d.util.terrainPolyline({
                viewer: that.viewer,
                positions: arr,
                calback: function (raisedPositions, noHeight) {
                    if (!that.isActivate) return;

                    var h1 = Cesium.Cartographic.fromCartesian(positions[index - 1]).height;
                    var h2 = Cesium.Cartographic.fromCartesian(positions[index]).height;
                    var hstep = (h2 - h1) / raisedPositions.length;

                    for (var i = 0; i < raisedPositions.length; i++) {
                        //长度
                        if (i != 0) {
                            alllen += Cesium.Cartesian3.distance(raisedPositions[i], raisedPositions[i - 1]);
                        }
                        arrLen.push(Number(alllen.toFixed(1)));

                        //海拔高度
                        var point = mars3d.point.formatPositon(raisedPositions[i]);
                        arrHB.push(point.z);
                        arrPoint.push(point);

                        //高度
                        var fxgd = Number((h1 + hstep * i).toFixed(1));
                        arrLX.push(fxgd);
                    }


                    if (index >= positions.length - 1) {
                        haoutil.loading.hide();

                        that.showSectionChars({
                            arrLen: arrLen,
                            arrLX: arrLX,
                            arrHB: arrHB,
                            arrPoint: arrPoint,
                        });
                    }
                    else {
                        getLineFD();
                    }
                }
            });
        }
        getLineFD();
    },

    jkWidgetUri: 'widgets/sectionChars/widget.js',
    showSectionChars: function (data) {
        mars3d.widget.activate({
            uri: this.jkWidgetUri,
            data: data
        });

    },



}));