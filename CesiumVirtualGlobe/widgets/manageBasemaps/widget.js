
//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 190,
                height: 160
            }
        }
    },

    //初始化[仅执行1次]
    create: function () {
        var index = 0;
        var basemapsCfg = this.getBasemaps();
        for (var i = 0; i < basemapsCfg.length; i++) {
            var item = basemapsCfg[i];

            if (item.name == null || item.name == '' || item._layer == null)
                continue;
            index++;
        }

        if (index <= 4) {
            this.options.view.windowOptions = {
                width: 190,
                height: Math.ceil(index / 2) * 100 + 70
            }
        }
        else if (index > 4 && index <= 6) {
            this.options.view.windowOptions = {
                width: 270,
                height: Math.ceil(index / 3) * 100 + 70
            }
        } else {
            this.options.view.windowOptions = {
                width: 360,
                height: Math.ceil(index / 4) * 105 + 70
            }
        }


    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function () {

    },
    //关闭释放
    disable: function () {
        this.viewWindow = null;

    },
    hasTerrain: function () {
        return this.viewer.mars.hasTerrain();
    },
    getBasemaps: function () {
        return this.viewer.gisdata.config.basemaps;
    },
    getLayerVisible: function (model) {
        return model.getVisible();
    },
    updateLayerVisible: function (model, visible) {
        model.setVisible(visible);
    },
    updateTerrainVisible: function (isStkTerrain) {
        this.viewer.mars.updateTerrainProvider(isStkTerrain);
    }





}));

