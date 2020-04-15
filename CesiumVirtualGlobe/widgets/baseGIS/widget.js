
var widgetPointQy = mars3d.widget.bindClass(
    mars3d.widget.BaseWidget.extend({
        options: {
            resources: ['map.css'],
            // 弹窗
            view: {
                type: 'append',
                url: 'view.html'
            }
        },
        layerWork: null,
        viewWindow: null,
        flowChartOptions: null,
        geoCoordMap: {},
        taskdata: null,
        level: 0,
        platformdata: null,
        // 每个窗口创建完成后调用
        winCreateOK: function (opt, result) {
            var that = this;
            // that.viewer.clock.multiplier = 1;
            that.viewer.clock.shouldAnimate = false;
            that.removeRotation();
            this.viewWindow = result
            $('#heavy').click(function (e) {
                that.centerAt('zxauv')
            })
            $('#light').click(function (e) {
                that.centerAt('auv')
            })
            $('#glider').click(function (e) {
                that.centerAt('glider')
            })
            $('#wrc').click(function (e) {
                that.centerAt('usv')
            })
            $('#sn').click(function (e) {
                that.centerAt('sn')
            })
            $('#qq').click(function (e) {
                that.centerAt('qq')
                // 
            })
            // yw
            $('#yw').click(function (e) {
                that.centerAt('yw')
                // 
            })
            $('#qb').click(function (e) {
                that.centerAt('qb')
                // 
            })
            $('#fb').click(function (e) {
                that.centerAt('fb')
                // 
            })
            $('#qaqb').click(function (e) {
                that.centerAt('jaqb')
                // 
            })
            $('#jafb').click(function (e) {
                that.centerAt('jafb')
                // 
            })
            $('#jbh').click(function (e) {
                that.centerAt('jbh')
                // 
            })

        },
        dataSource: null,
        // 初始化[仅执行1次]
        create: function () {
            this.dataSource = new Cesium.CustomDataSource()
            this.dataInit()
        },
        // 打开激活
        activate: function () {
            var that = this;
            if (!this.viewer.dataSources.contains(this.dataSource)) {
                this.viewer.dataSources.add(this.dataSource)
            }
            this.viewer.scene.camera.moveEnd.addEventListener(function () {
                var currentMagnitude = that.viewer.camera.getMagnitude();
                if (currentMagnitude < 6380530) {
                    that.flowChartOptions = that.getZoomFinalOption();
                    if (that.layerWork) {
                        that.layerWork.updateOverlay(that.flowChartOptions);
                        that.dataSource.entities.removeAll();
                        that.addModel();
                    }
                }
                else if (currentMagnitude < 6611494.673659469 && currentMagnitude > 6380530) {
                    that.flowChartOptions = that.getZoomInOption();
                    if (that.layerWork) {
                        that.layerWork.updateOverlay(that.flowChartOptions);
                        that.dataSource.entities.removeAll();
                        that.addModel();
                    }
                } else {
                    that.flowChartOptions = that.getOption();
                    if (that.layerWork) {
                        that.layerWork.updateOverlay(that.flowChartOptions);
                    }
                    that.dataSource.entities.removeAll();
                }
            })
            this.viewer.mars.centerAt({ "y": 9.911235, "x": 115.537979, "z": 5933910.9, "heading": 355.6, "pitch": -80.3, "roll": 360 });

            this.showData();
        },
        // 关闭释放
        disable: function () {
            if (this.layerWork) {
                this.layerWork.dispose();
                this.layerWork = null;
            }
            if (this.viewer.dataSources.contains(this.dataSource)) {
                this.viewer.dataSources.remove(this.dataSource)
            }
        },
        showData: function () {
            this.flowChartOptions = this.getOption();
            if (this.layerWork == null) {
                this.layerWork = new mars3d.FlowEcharts(this.viewer, this.flowChartOptions);
            }
            else {
                this.layerWork.updateOverlay(this.flowChartOptions);
            }
        },
        removeRotation: function () {
            var that = this;
            that.viewer.clock.onTick._listeners.forEach(function (ev) {
                if (ev.name == 'onTickCallback') {
                    that.viewer.clock.onTick.removeEventListener(ev)
                }
            })
        },
        getOption: function () {
            var that = this

            var BaseData = [

            ];

            var convertData = function (data) {
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    var fromCoord = that.geoCoordMap[dataItem[0].name].loc;
                    var toCoord = that.geoCoordMap[dataItem[1].name].loc;
                    if (fromCoord && toCoord) {
                        res.push({
                            fromName: dataItem[0].name,
                            toName: dataItem[1].name,
                            coords: [fromCoord, toCoord]
                        });
                    }
                }
                return res;
            };
            var series = [];
            [['basegis', BaseData]].forEach(function (item, i) {
                series.push(
                    {
                        name: item[2],
                        type: 'lines',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        effect: {
                            show: true,
                            trailWidth: 2,
                            trailLength: 0.15,
                            trailOpacity: 1,
                            trailColor: 'rgb(30, 30, 60)'
                        },
                        lineStyle: {
                            normal: {
                                color: '#60ff44',
                                width: 1,
                                opacity: 0.4,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        //       name: item[1],
                        type: 'effectScatter',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function (val) {
                            return 3 + val[2] / 10;
                        },
                        itemStyle: {
                            normal: {
                                color: '#60ff44'
                            }
                        },
                        data: item[1].map(function (dataItem) {
                            return {
                                name: dataItem[0].name,
                                value: that.geoCoordMap[dataItem[0].name].loc.concat([dataItem[0].value])
                            };
                        })
                    });
            });

            option = {
                animation: false,
                GLMap: {

                },
                series: series
            };
            return option;
        },
        getZoomInOption: function () {
            var that = this
            var BaseData = [

            ];

            for (var key in that.geoCoordMap) {

            }
            var convertData = function (data) {
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    var fromCoord = that.geoCoordMap[dataItem[0].name].loc;
                    var toCoord = that.geoCoordMap[dataItem[1].name].loc;
                    if (fromCoord && toCoord) {
                        res.push({
                            fromName: dataItem[0].name,
                            toName: dataItem[1].name,
                            coords: [fromCoord, toCoord]
                        });
                    }
                }
                return res;
            };


            var series = [];
            [['basegis', BaseData]].forEach(function (item, i) {
                series.push(
                    {
                        name: item[2],
                        type: 'lines',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        effect: {
                            show: true,
                            trailWidth: 2,
                            trailLength: 0.15,
                            trailOpacity: 1,
                            trailColor: 'rgb(30, 30, 60)'
                        },
                        lineStyle: {
                            normal: {
                                color: '#60ff44',
                                width: 1,
                                opacity: 0.4,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        //       name: item[1],
                        type: 'effectScatter',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function (val) {
                            return 3 + val[2] / 10;
                        },
                        itemStyle: {
                            normal: {
                                color: '#60ff44'
                            }
                        },
                        data: item[1].map(function (dataItem) {
                            return {
                                name: dataItem[0].name,
                                value: that.geoCoordMap[dataItem[0].name].loc.concat([dataItem[0].value])
                            };
                        })
                    });
            });

            option = {
                animation: false,
                GLMap: {

                },
                series: series
            };
            return option;
        },
        getZoomFinalOption: function () {
            var that = this
            var BaseData = [

            ];

            for (var key in that.geoCoordMap) {

            }

            var convertData = function (data) {
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    var fromCoord = that.geoCoordMap[dataItem[0].name].loc;
                    var toCoord = that.geoCoordMap[dataItem[1].name].loc;
                    if (fromCoord && toCoord) {
                        res.push({
                            fromName: dataItem[0].name,
                            toName: dataItem[1].name,
                            coords: [fromCoord, toCoord]
                        });
                    }
                }
                return res;
            };


            var series = [];
            [['basegis', BaseData]].forEach(function (item, i) {
                series.push(
                    {
                        name: item[2],
                        type: 'lines',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        effect: {
                            show: true,
                            trailWidth: 2,
                            trailLength: 0.15,
                            trailOpacity: 1,
                            trailColor: 'rgb(30, 30, 60)'
                        },
                        lineStyle: {
                            normal: {
                                color: '#60ff44',
                                width: 1,
                                opacity: 0.4,
                                curveness: 0.2
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        //       name: item[1],
                        type: 'effectScatter',
                        coordinateSystem: 'GLMap',
                        zlevel: 2,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: function (val) {
                            return 3 + val[2] / 10;
                        },
                        itemStyle: {
                            normal: {
                                color: '#60ff44'
                            }
                        },
                        data: item[1].map(function (dataItem) {
                            var tempName = dataItem[0].name;
                            if (tempName.indexOf("-" > -1)) {
                                tempName = tempName.split('-')[1];
                            }
                            return {
                                name: tempName,
                                value: that.geoCoordMap[dataItem[0].name].loc.concat([dataItem[0].value])
                            };
                        })
                    });
            });

            option = {
                animation: false,
                GLMap: {

                },
                series: series
            };
            return option;
        },
        imgSwitch(type) {
            var res = '';
            var baseUrl = "img/marker/";
            switch (type) {
                case 'qq': res = baseUrl + 'qq.png'; break;
                case "jafb": res = baseUrl + 'fb.png'; break;
                case 'fb': res = baseUrl + 'fb.png'; break;
                case 'qb': res = baseUrl + 'jaqb.png'; break;
                case "jaqb": res = baseUrl + 'jaqb.png'; break;
                case 'usv': res = baseUrl + 'usv.png'; break;
                case 'glider': res = baseUrl + 'glider.png'; break;
                case "zxauv": res = baseUrl + 'zx.png'; break;
                case "auv": res = baseUrl + 'auv.png'; break;
                case 'sn': res = baseUrl + 'sn.png'; break;
                case "yw": res = baseUrl + 'yw.png'; break;
                case "jbh": res = baseUrl + 'utcd.png'; break;
                default: res = ''; break;
            }
            return res;
        },
        addModel: function () {
            var that = this
            for (var key in that.geoCoordMap) {
                if (that.geoCoordMap[key].type != "base" && that.geoCoordMap[key].type != "equip") {
                    var img = this.imgSwitch(that.geoCoordMap[key].type)
                    that.dataSource.entities.add({
                        name: key,
                        attr: that.geoCoordMap[key],
                        position: Cesium.Cartesian3.fromDegrees(that.geoCoordMap[key].loc[0], that.geoCoordMap[key].loc[1], 0), // 点集
                        point: {
                            // 像素点
                            color: Cesium.Color.GREEN.withAlpha(0.1),
                            pixelSize: 10,
                            outlineColor: Cesium.Color.GREEN.withAlpha(0),
                            outlineWidth: 2,
                            scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
                        },
                        billboard: {
                            image: img,
                            scale: 0.6,  //原始大小的缩放比例
                            pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
                        },
                        click: function (entity) {
                            that.showXQ(entity.attr)
                        }
                    });
                }
            }
        },
        // 打开详情
        showXQ: function (attr) {
            if (attr === null) return
            mars3d.widget.activate({
                uri: 'widgetsTS/qyDetailsView/widget.js',
                dataQy: attr
            })
        },
        workEcharts: function () { },
        dataInit: function () {
            var that = this
            // level 1
            var level1 = locConfig.baseLoc;
            that.geoCoordMap = level1;
            //level 2
            var tastUrl = baseUrlConfig.baseUrl + 'tasklist/newest';
            var platUrl = baseUrlConfig.baseUrl + 'list';
            $.get(tastUrl, function (res) {
                that.taskdata = res;
                $.get(platUrl, function (result) {
                    that.platAdapter(res, result)
                })
            })
        },
        platAdapter(task, plat) {
            var that = this;
            var result = task;
            var tempPlat = [];
            plat.forEach(function (item) {
                item.nodes.forEach(function (it) {
                    tempPlat.push(it)
                })
            })
            task.forEach(function (item, idx) {
                item.nodes.forEach(function (it, index) {
                    tempPlat.forEach(function (plat) {
                        if (it.id == plat.id) {
                            task[idx].nodes[index].platName = plat.name
                            that.geoCoordMap[plat.name] = {
                                loc: it.location,
                                nodes: it.instrument,
                                type: it.type,
                                id: it.id,
                                data: plat,
                                task: it
                            }
                            if (it.instrument.length != 0) {
                                var tempLoc = that.calcLocation(it.location, it.instrument.length)
                                // console.log(tempLoc)
                                it.instrument.forEach(function (ins, insIndex) {
                                    var tempName = it.platName + "-" + ins.name;
                                    that.geoCoordMap[tempName] = {
                                        loc: tempLoc[insIndex],
                                        type: 'equip',
                                        id: ins.id,
                                    }
                                })
                            }
                        }
                    })
                })
            })
            console.log(that.geoCoordMap)
            return result;
        },
        centerAt: function (type) {
            var that = this;
            var targetCol = [];
            function sortNumber(a, b) {
                return a - b
            }
            for (var key in that.geoCoordMap) {
                if (that.geoCoordMap[key].type == type) {
                    targetCol.push(that.geoCoordMap[key])
                }
            }
            if (targetCol.length == 0) {
                haoutil.msg('未找到平台！');

            } else if (targetCol.length == 1) {
                that.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(targetCol[0].loc[0], targetCol[0].loc[1], 15000.0)
                });

            } else if (targetCol.length >= 2) {
                var tempLat = [];
                var tempLng = [];

                targetCol.forEach(function (item) {
                    tempLat.push(item.loc[1])
                    tempLng.push(item.loc[0])
                    that.dataSource.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(item.loc[0], item.loc[1], 1200),
                        billboard: {
                            image: 'img/marker/mark3.png',
                            scale: 0.7,  //原始大小的缩放比例
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //CLAMP_TO_GROUND
                            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
                        },
                    });
                })
                tempLat.sort(sortNumber)
                tempLng.sort(sortNumber)
                let west = tempLng[0] - 0.1, east = tempLng[tempLng.length - 1] + 0.1, south = tempLat[0] - 0.1, north = tempLat[tempLat.length - 1] + 0.1;
                viewer.camera.flyTo({
                    destination: Cesium.Rectangle.fromDegrees(west, south, east, north)
                });


            }
        },
        calcLocation: function (center, num) {
            var res = [];
            var length = 0.001;
            var gap = 360 / num;
            var flag = -180;
            for (var i = 0; i < num; i++) {
                res.push([center[0] + length * Math.sin(Math.PI * flag / 360), center[1] + length * Math.cos(Math.PI * flag / 360)]);
                flag += gap;
            }
            return res;
        }

    })
)