//如果需要在config.json中type定义非类库内置类型时，可以按下面示例进行扩展，主要是重写add、remove等方法。
//再在地图初始化时layerToMap的方法内部去判断type后new该类，参考index.js内layerToMap方法代码。

//该类内部主要使用的的2个属性：this.config是config.json中配置的对应节点参数，this.viewer是地球对象

//超图S3M数据加载
var S3MLayer = mars3d.layer.BaseLayer.extend({ 
    //添加 
    add: function () {
        if (this.model) {
            for (var i in this.model) {
                this.model[i].visible = true;
            }
        }
        else {
            this.initData();
        }
    },
    //移除
    remove: function () {
        if (this.model) {
            for (var i in this.model) {
                this.model[i].visible = false;
            }
        }
    },
    //定位至数据区域
    centerAt: function (duration) {
        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        }
    },
    hasOpacity: true,
    //设置透明度
    setOpacity: function (value) {
        if (this.model) {
            for (var i = 0; i < this.model.length; i++) {
                var item = this.model[i];
                if (item == null) continue;

                item.style3D.fillForeColor.alpha = value;
            }
        }
    },
    initData: function () {
        var that = this;

        //场景添加S3M图层服务
        var promise;
        if (this.config.layername) {
            promise = this.viewer.scene.addS3MTilesLayerByScp(this.config.url, {
                name: this.config.layername
            });
        }
        else {
            promise = this.viewer.scene.open(this.config.url);
        }

        Cesium.when(promise, function (layer) {
            if (that.isArray(layer))
                that.model = layer;
            else
                that.model = [layer];

            //设置图层属性
            if (that.config.s3mOptions) {
                for (var i = 0; i < that.model.length; i++) {
                    var item = that.model[i];
                    if (item == null) continue;
                    
                    for (var key in that.config.s3mOptions) {
                        item[key] = that.config.s3mOptions[key];
                    }
                }
            }

            if (!that.viewer.mars.isFlyAnimation() && that.config.flyTo) {
                that.centerAt(0);
            }

        }, function (e) {
            showError('渲染时发生错误，已停止渲染。', e);
        });
    }, 
    isArray: function (obj) {
        return (typeof obj == 'object') && obj.constructor == Array;
    },


});