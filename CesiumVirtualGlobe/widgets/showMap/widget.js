
// 模块：
var ShowTemperature = mars3d.widget.bindClass(
  mars3d.widget.BaseWidget.extend({
    options: {
      resources: [
        './lib/CesiumPlugins/heatmap/heatmap.min.js',
        './lib/CesiumPlugins/heatmap/HeatmapImageryProvider.js',
        'style.css',
        './js/windy/Windy.js',
        'grid/grid.js'
      ],
      view: [{ type: 'append', url: 'view.html' }]
    },
    currentLayer: '',
    timeFlag: 0,
    windy: null,
    imgLayers: [],
    dataSource: null,
    checkPointSource: null,
    uniGrid: [],
    queryCol: [],
    querySource: null,
    queryActive: false,
    checkActive: false,
    queryNum: null,
    timer: null,
    timeInterval: '',
    preLayer: '',
    currentType: '温度',
    currentLoc: 'LS',
    currentLevel: '0',
    currentTime: moment().format('YYYY-MM-DD') + " 00:00:00",
    dynamicflagDate: moment().format("YYYY-MM-DD") + " 00",
    ave_date_flag: moment().format('YYYY-MM-DD') + " 00:00:00",
    currentIndex: 0,
    charsWidgetUri: 'widgets/numericalChart/widget.js',
    checkWidgetUri: 'widgets/numericalCheck/widget.js',

    ifAveActive: false,
    aveFlagData: moment().format('YYYY-MM-DD'),
    handler: null,
    // 初始化[仅执行1次]
    create: function () {
      this.dataSource = new Cesium.CustomDataSource()
      this.querySource = new Cesium.CustomDataSource()
      this.checkPointSource = new Cesium.CustomDataSource()
    },
    winCreateOK: function (viewopt, html) {
      var that = this
      that.uniGrid = UNIGIRD.grid;
      //设置时间轴范围
      that.viewer.clock.shouldAnimate = false;
      that.removeRotation();

      $('#check_point').click(function () {
        if (!that.queryActive) {
          $('#check_point').addClass("dycAtive")
          that.queryActive = true;
          haoutil.msg('过程查询已激活！');
          that.checkActive = false;
          $('#check_day').removeClass("dycAtive")
          that.checkPointSource.entities.removeAll();
          mars3d.widget.disable(that.checkWidgetUri);
        } else {
          $('#check_point').removeClass("dycAtive")
          that.querySource.entities.removeAll();
          mars3d.widget.disable(that.charsWidgetUri);
          that.queryActive = false;
          that.queryNum = null;
          haoutil.msg('过程查询已关闭！');
        }
      })

      $('#check_day').click(function (e) {
        if (!that.checkActive) {
          $('#check_day').addClass("dycAtive")
          that.checkActive = true
          haoutil.msg('验证功能已激活！');
          that.queryActive = false;
          $('#check_point').removeClass("dycAtive")
          that.querySource.entities.removeAll();
          mars3d.widget.disable(that.charsWidgetUri);
          that.queryNum = null;

          that.addPlatform();
        } else {
          $('#check_day').removeClass("dycAtive")
          that.checkActive = false;
          that.dataSource.entities.removeAll();
          mars3d.widget.disable(that.checkWidgetUri);
        }
      })

      $('#current_day').click(function (e) {
        that.currentType = "流场"
        that.initActive("#current_day")
        that.tempAndsaltReset()

        that.ifAveActive = false
        that.getAndDraw()
      })
      $('#temp_day').click(function (e) {
        that.currentType = "温度"
        that.initActive("#temp_day")
        that.tempAndsaltReset()
        that.ifAveActive = false
        that.getAndDraw()
      })

      $('#salt_day').click(function (e) {
        that.initActive("#salt_day")
        that.currentType = "盐度"
        that.tempAndsaltReset()
        that.ifAveActive = false
        that.getAndDraw()
      })
      $('#water_day').click(function (e) {
        that.currentType = "水位"
        that.initActive("#water_day")
        that.tempAndsaltReset()
        that.ifAveActive = false
        that.getAndDraw()
      })

      $('#temp_hour').click(function (e) {
        that.currentType = "温度平均"
        that.initActive("#temp_hour")
        that.tempAndsaltReset()
        that.ifAveActive = true
        that.getAndDraw()
      })

      $('#salt_hour').click(function (e) {
        that.currentType = "盐度平均"
        that.initActive("#salt_hour")
        that.tempAndsaltReset()
        that.ifAveActive = true
        that.getAndDraw()
      })

      $('#current_hour').click(function (e) {
        that.currentType = "流场平均"
        that.initActive("#current_hour")
        that.tempAndsaltReset()
        that.ifAveActive = true
        that.getAndDraw()
      })

      $('#water_hour').click(function (e) {
        that.currentType = "水位平均"
        that.initActive("#water_hour")
        that.tempAndsaltReset()
        that.ifAveActive = true
        that.getAndDraw()
      })
      $('#s_depSelect').change(function () {
        if (that.currentType != "水位" && that.currentType != "水位平均") {
          that.currentLevel = $('#s_depSelect  option:selected').val()
          if (that.imgLayers.length != 0) {
            that.imgLayers.forEach(function (imglayer) {
              if (that.viewer.imageryLayers.contains(imglayer)) {
                that.viewer.imageryLayers.remove(imglayer)
              }
            })
            that.imgLayers = []
          }
          that.getAndDraw()
        } else {
          $("#s_depSelect").val(0);
          haoutil.msg("水位为表层，不包含深度。")
        }
      })

      $('#s_locSelect').change(function () {
        that.currentLoc = $('#s_locSelect  option:selected').val()
        console.log(that.currentLoc)
        if (that.imgLayers.length != 0) {
          that.imgLayers.forEach(function (imglayer) {
            if (that.viewer.imageryLayers.contains(imglayer)) {
              that.viewer.imageryLayers.remove(imglayer)
            }
          })
          that.imgLayers = []
        }
        // that.getAndDraw()
      })

      that.initDepthSelect()


    },
    layer: null,
    dataSource: null,
    // 打开激活
    activate: function () {
      this.viewer.mars.centerAt({
        x: 119.5217819402912,
        y: 19.531636584415477,
        z: 1005000,
        heading: 352.7,
        pitch: -86.3,
        roll: 0.7
      })
      var that = this

      var startDate = Cesium.JulianDate.fromDate(new Date(that.currentTime))
      var endDate = Cesium.JulianDate.addSeconds(startDate, 435600, new Cesium.JulianDate());
      that.viewer.timeline.zoomTo(startDate, endDate);
      that.viewer.clock.startTime = startDate;
      that.viewer.clock.endTime = endDate;
      that.viewer.clock.currentTime = startDate;
      that.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
      that.viewer.clock.multiplier = 1800;
      that.viewer.clock.previousTime = this.viewer.clock.currentTime.secondsOfDay;
      that.viewer.clock.baseTime = this.viewer.clock.currentTime.secondsOfDay;

      function onTickTempPlay(clock) {
        var flagDate = Cesium.JulianDate.toDate(that.viewer.clock.currentTime)
        var dynamicTempDate = moment(flagDate).format("YYYYMMDD HH");
        if (dynamicTempDate != that.dynamicflagDate) {
          that.dynamicflagDate = dynamicTempDate;
          that.currentIndex = moment(flagDate).diff(moment(that.currentTime), 'hours')
          that.ave_date_flag = moment(flagDate).format("YYYY-MM-DD HH:mm:ss")
          if (that.ifAveActive) {
            if (that.aveFlagData != moment(flagDate).format('YYYY-MM-DD')) {
              that.aveFlagData = moment(flagDate).format('YYYY-MM-DD')
              // that.throttle(that.getAndDraw, 5)
              that.getAndDraw();
            }
          } else {

            // that.throttle(that.getAndDraw, 1000)
            that.getAndDraw();
          }
        }
      }
      that.viewer.clock.onTick.addEventListener(onTickTempPlay);
      $.datetimepicker.setLocale('ch');
      $('#datetimepicker').val(that.currentTime);
      $('#datetimepicker').datetimepicker({
        defaultDate: that.currentTime,
        allowTimes: [
          '00:00', '06:00', '12:00',
          '18:00'
        ],
        onSelectTime: function (dp, $input) {
          that.currentTime = $input.val();
          that.ave_date_flag = $input.val();
          that.currentIndex = 0;
          var changeStartDate = Cesium.JulianDate.fromDate(new Date(that.currentTime))
          var changeEndDate = Cesium.JulianDate.addSeconds(changeStartDate, 435600, new Cesium.JulianDate());
          that.viewer.timeline.zoomTo(changeStartDate, changeEndDate);
          that.viewer.clock.startTime = changeStartDate;
          that.viewer.clock.endTime = changeEndDate;
          that.viewer.clock.currentTime = changeStartDate;
          that.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
          that.viewer.clock.multiplier = 1800;
          that.viewer.clock.previousTime = that.viewer.clock.currentTime.secondsOfDay;
          that.viewer.clock.baseTime = that.viewer.clock.currentTime.secondsOfDay;
          that.getAndDraw()
        }
      });

      if (!this.viewer.dataSources.contains(this.dataSource)) {
        this.viewer.dataSources.add(this.dataSource)
      }
      if (!this.viewer.dataSources.contains(this.querySource)) {
        this.viewer.dataSources.add(this.querySource)
      }
      if (!this.viewer.dataSources.contains(this.checkPointSource)) {
        this.viewer.dataSources.add(this.checkPointSource)
      }



      that.getAndDraw()
    },
    // 关闭释放
    disable: function () {
      var that = this
      that.ifAveActive = false
      // that.currentTime = moment().format('YYYY-MM-DD') + " 00:00:00";
      // that.ave_date_flag = moment().format('YYYY-MM-DD') + " 00:00:00";
      if (this.imgLayers.length != 0) {
        this.imgLayers.forEach(function (imglayer) {
          if (that.viewer.imageryLayers.contains(imglayer)) {
            that.viewer.imageryLayers.remove(imglayer)
          }
        })
        this.imgLayers = []
      }
      if (this.layer) {
        this.viewer.imageryLayers.remove(this.layer)
        this.layer = null
      }
      this.dataSource.entities.removeAll()
      this.viewer.mars.tooltip.close()
      if (this.viewer.dataSources.contains(this.dataSource)) {
        this.viewer.dataSources.remove(this.dataSource)
      }
      this.checkPointSource.entities.removeAll()
      if (this.viewer.dataSources.contains(this.checkPointSource)) {
        this.viewer.dataSources.remove(this.checkPointSource)
      }
      this.querySource.entities.removeAll()
      if (this.viewer.dataSources.contains(this.querySource)) {
        this.viewer.dataSources.remove(this.querySource)
      }

      if (this.windy) {
        this.windy.removeLines()
      }
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }


      var that = this;
      that.viewer.clock.onTick._listeners.forEach(function (ev) {
        if (ev.name == 'onTickTempPlay') {
          that.viewer.clock.onTick.removeEventListener(ev)
        }
      })
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        var legends = document.querySelector('.legend-area');
        legends.style.display = 'none';
        this.handler = null;
      }
      this.queryCol = [];
      this.queryActive = false;
      $("#check_point").removeClass("dy_select_item")
      $("#check_day").removeClass("dycAtive")
    },
    redraw: function () {
      var that = this
      that.timer = setInterval(function () {
        if (that.windy) {
          that.windy.animate()
        }
      }, 100)
    },
    removeRotation: function () {
      var that = this;
      that.viewer.clock.onTick._listeners.forEach(function (ev) {
        if (ev.name == 'onTickCallback') {
          that.viewer.clock.onTick.removeEventListener(ev)
        }
      })
    },
    addPlatform: function () {
      var that = this
      var taskListUrl = baseUrlConfig.baseUrl + 'tasklist/newest';
      var platUrl = baseUrlConfig.baseUrl + 'list';
      $.get(platUrl, function (plat) {
        var platList = []
        plat.forEach(function (pl) {
          if (pl.name == "原位平台" || pl.name == "近岸潜标" || pl.name == "近岸浮标" || pl.name == "浮标") {
            pl.nodes.forEach(function (nd) {
              platList.push(nd)
            })
          }
        })
        $.get(taskListUrl, function (tasks) {
          var taskList = [];
          tasks.forEach(function (item) {
            if (item.type == 'yw' || item.type == 'jaqb' || item.type == 'jafb' || item.type == 'fb') {
              item.nodes.forEach(function (node) {
                taskList.push(node)
              })
            }
          })
          taskList.forEach(function (task, idx) {
            platList.forEach(function (plat) {
              if (task.id == plat.id) {
                taskList[idx].platName = plat.name
              }
            })
          })
          that.addModel(taskList)
        })
      })

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
    addModel: function (data) {
      var that = this
      data.forEach(function (item) {
        var img = that.imgSwitch(item.type)
        var loc = Cesium.Cartesian3.fromDegrees(item.location[0], item.location[1], 20);
        that.checkPointSource.entities.add({
          name: item.platName,
          attr: {
            type: item.type,
            id: item.id,
            depth: item.depth,
            loc: item.location
          },
          position: loc, // 点集
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
          label: {
            text: item.platName,
            font: 'normal small-caps normal 17px 楷体',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.AZURE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20),   //偏移量  
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
          },
          click: function (entity) {
            if (that.currentType == "温度" || that.currentType == "盐度" || that.currentType == "温度平均" || that.currentType == "盐度平均") {
              if (entity.attr.type == "yw") {
                var numIndex = that.checkNum(item.location[0], item.location[1])
                that.checkChartData(entity.attr, that.currentType, numIndex)
              } else {
                haoutil.msg("当前平台不包含" + that.currentType + "观测数据。")
              }
              if (entity.attr.type == "fb") {
                if (that.currentType == "盐度" || that.currentType == "盐度平均") {
                  haoutil.msg("当前平台不包含" + that.currentType + "观测数据。")
                } else {
                  var numIndex = that.checkNum(item.location[0], item.location[1])
                  that.checkChartData(entity.attr, that.currentType, numIndex)
                }
              }
            }


            if (that.currentType == "流场" || that.currentType == "流场平均") {
              if (entity.attr.type == "jafb" || entity.attr.type == "jaqb") {
                console.log(entity.attr, that.currentType)
                var numIndex = that.checkNum(item.location[0], item.location[1])
                that.checkChartData(entity.attr, that.currentType, numIndex)
              } else {
                haoutil.msg("当前平台不包含" + that.currentType + "观测数据。")
              }
            }
            if (that.currentType == "水位" || that.currentType == "水位平均") {
              haoutil.msg("水位无验证数据。")
            }
          }
        });
      })
      that.viewer.flyTo(that.checkPointSource.entities, { duration: 3 })
    },
    updatelegend(defaultgradient, min, max) {
      var legendCanvas = document.createElement('canvas');
      legendCanvas.width = 100;
      legendCanvas.height = 10;
      var min1 = document.querySelector('#min1');
      var max1 = document.querySelector('#max1');
      var gradientImg = document.querySelector('#gradient');
      var legendCtx = legendCanvas.getContext('2d');
      var gradientCfg = {};

      min1.innerHTML = parseFloat(min.toFixed(2));
      max1.innerHTML = parseFloat(max.toFixed(2));
      if (defaultgradient != gradientCfg) {
        gradientCfg = defaultgradient;
        var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
        for (var key in gradientCfg) {
          gradient.addColorStop(key, gradientCfg[key]);
        }
        legendCtx.fillStyle = gradient;
        legendCtx.fillRect(0, 0, 100, 10);
        gradientImg.src = legendCanvas.toDataURL();
      }
    },
    getFileUrl: function (type) {
      var layerUrl = "";
      var baseUrl = baseUrlConfig.dynamicUrl;
      var dateFile = moment(this.currentTime).format("YYYYMMDD");
      var hourFile = moment(this.currentTime).hours();

      var aveFile = moment(this.ave_date_flag).format("YYYYMMDD");
      switch (type) {
        case "water":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/LEVEL/cesium/time_" + this.currentIndex + ".json";
          break;
        case "temp_ave":
          // layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + dateFile + ".json";
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + aveFile + ".json";
          // average_lev_0_time_20190929
          break;
        case "salt_ave":
          // layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + dateFile + ".json";
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + aveFile + ".json";
          // average_lev_0_time_20190929
          break;
        case "water_ave":
          // layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + dateFile + ".json";
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/LEVEL/cesium/average_time_" + aveFile + ".json";
          //  average_time_20190929
          break;
        case "temp":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.currentLevel + "_time_" + this.currentIndex + ".json";
          // lev_180_time_15
          break;
        case "salt":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.currentLevel + "_time_" + this.currentIndex + ".json";
          // lev_180_time_15
          break;
        case "current":
          queryUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.currentLevel + "_time_" + this.currentIndex + ".json";
          particleUrl = baseUrl + dateFile + "/" + hourFile + "/CURRENT/cesium/lev_" + this.currentLevel + "_time_" + this.currentIndex + ".json";
          // time_24_lev_0
          layerUrl = {
            queryUrl, particleUrl
          };
          break;
        case "current_ave":
          queryUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/average_lev_" + this.currentLevel + "_time_" + aveFile + ".json";
          particleUrl = baseUrl + dateFile + "/" + hourFile + "/CURRENT/cesium/average_lev_" + this.currentLevel + "_time_" + aveFile + ".json";
          // time_24_lev_0 average_lev_0_time_20190929 average_time_0_lev_0 average_lev_1600_time_20190929
          layerUrl = {
            queryUrl, particleUrl
          };
          break;

      }
      return layerUrl
    },
    initActive: function (item) {
      $('#current_day').removeClass("dy_select_item")
      $('#temp_day').removeClass("dy_select_item")
      $('#salt_day').removeClass("dy_select_item")
      $('#water_day').removeClass("dy_select_item")
      $('#temp_hour').removeClass("dy_select_item")
      $('#salt_hour').removeClass("dy_select_item")
      $('#current_hour').removeClass("dy_select_item")
      $('#water_hour').removeClass("dy_select_item")
      if (item) {
        $(item).addClass("dy_select_item");
      }
    },
    getAndDraw() {
      var that = this
      switch (that.currentType) {
        case "水位平均":
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerUrl = that.getFileUrl("water_ave")
          $.get(layerUrl, function (result) {
            //init entity
            that.dataSource.entities.removeAll();
            that.queryCol = []
            var arrPoint = result
            arrPoint.forEach(function (item, wIndex) {
              if (item != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[wIndex].x,
                  y: that.uniGrid[wIndex].y,
                  value: item
                })
              }
            })
            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }
            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              min: min,
              max: max,
              data: that.queryCol,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              heatmapoptions: {
                blur: 1,
                radius: 38,
                useLocalExtrema: false,
                gradient: defaultgradient,
                xField: 'x',
                yField: 'y',
                valueField: 'value',
                minopacity: 0.1,
                maxopacity: 0.8,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);// legendcode
                },
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })

          break;
        case "盐度平均":
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerUrl = that.getFileUrl("salt_ave")
          $.get(layerUrl, function (result) {
            //init entity
            that.dataSource.entities.removeAll();
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, sIndex) {
              if (item.T != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[sIndex].x,
                  y: that.uniGrid[sIndex].y,
                  value: item.S
                })
              }
            })

            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }

            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              min: min,
              max: max,
              data: that.queryCol,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              heatmapoptions: {
                blur: 1,
                radius: 38,
                useLocalExtrema: false,
                gradient: defaultgradient,
                xField: 'x',
                yField: 'y',
                valueField: 'value',
                minopacity: 0.1,
                maxopacity: 0.8,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);// legendcode
                },
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })
          break;
        case "温度平均":
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerUrl = that.getFileUrl("temp_ave")
          $.get(layerUrl, function (result) {
            //init entity
            that.dataSource.entities.removeAll();
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, tIndex) {
              if (item.T != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[tIndex].x,
                  y: that.uniGrid[tIndex].y,
                  value: item.T
                })
              }
            })
            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }
            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              min: min,
              max: max,
              data: that.queryCol,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              heatmapoptions: {
                blur: 1,
                radius: 38,
                useLocalExtrema: false,
                gradient: defaultgradient,
                xField: 'x',
                yField: 'y',
                valueField: 'value',
                minopacity: 0.1,
                maxopacity: 0.8,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);// legendcode
                },
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })
          break;
        case "水位":
          $("#s_depSelect").val(0);
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerUrl = that.getFileUrl("water")
          console.log(layerUrl)
          $.get(layerUrl, function (result) {
            //init entity
            that.dataSource.entities.removeAll();
            that.queryCol = []
            var arrPoint = result
            arrPoint.forEach(function (item, wIndex) {
              if (item != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[wIndex].x,
                  y: that.uniGrid[wIndex].y,
                  value: item
                })
              }
            })
            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }
            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              min: min,
              max: max,
              data: that.queryCol,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              heatmapoptions: {
                blur: 1,
                radius: 38,
                useLocalExtrema: false,
                gradient: defaultgradient,
                xField: 'x',
                yField: 'y',
                valueField: 'SSH',
                minopacity: 0.1,
                maxopacity: 0.8,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);// legendcode
                },
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })
          break;
        case "温度":
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerFile = that.getFileUrl("temp")
          $.get(layerFile, function (result) {
            //init entity
            that.dataSource.entities.removeAll();
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, tIndex) {
              if (item.T != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[tIndex].x,
                  y: that.uniGrid[tIndex].y,
                  value: item.T
                })
              }
            })
            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }

            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              min: min,
              max: max,
              data: that.queryCol,
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              heatmapoptions: {
                blur: 1,
                radius: 38,
                useLocalExtrema: false,
                gradient: defaultgradient,
                xField: 'x',
                yField: 'y',
                valueField: 'value',
                minopacity: 0.1,
                maxopacity: 0.8,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);// legendcode
                },
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })
          break;
        case "盐度":
          var legends = document.querySelector('.legend-area');
          legends.style.display = 'block';
          that.particeRemove();
          var layerFile = that.getFileUrl("salt")
          $.get(layerFile, function (result) {
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, sIndex) {
              if (item.T != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[sIndex].x,
                  y: that.uniGrid[sIndex].y,
                  value: item.S
                })
              }
            })

            var min = that.queryCol[0].value
            var max = min
            for (var i = 0; i < that.queryCol.length; i++) {
              var value = that.queryCol[i].value
              if (min > value) min = value
              if (max < value) max = value
            }

            var defaultgradient = { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)" };
            var heatLayer = createHeatmapImageryProvider(Cesium, {
              data: that.queryCol,
              heatmapoptions: {
                blur: .85,
                radius: 40,
                onExtremaChange: function () {
                  that.updatelegend(defaultgradient, min, max);
                },
                useLocalExtrema: false,
                gradient: defaultgradient,
                minopacity: 0.1,
                maxopacity: 0.9,
                xField: 'x',
                yField: 'y',
                valueField: 'value'
              }
            })
            that.layer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
            that.imgLayers.push(that.layer)
            that.handleMove();
            that.handleClick();
          })
          break;
        case "流场":
          var cUrl = that.getFileUrl("current")
          this.tempAndsaltReset()
          that.particeRemove();
          //绘制离子
          $.ajax({
            type: 'get',
            url: cUrl.particleUrl,
            dataType: 'json',
            success: function (response) {
              var header = response[0].header
              viewer.camera.setView({
                destination: Cesium.Rectangle.fromDegrees(
                  header['lo1'],
                  header['la2'],
                  header['lo2'],
                  header['la1']
                )
              })
              if (that.windy) {

              } else {
                that.windy = new Windy(response, that.viewer)
                that.redraw()
              }

            },
            error: function (errorMsg) {
              // alert('请求数据失败!')
            }
          })
          //单点查询
          var queryUrl = cUrl.queryUrl;
          $.get(queryUrl, function (result) {
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, cIndex) {
              if (item.W != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[cIndex].x,
                  y: that.uniGrid[cIndex].y,
                  value: parseFloat(item.W.toFixed(2))
                })
              }
            })
            that.handleMove();
            that.handleClick();
          })

          break;
        case "流场平均":
          var cAveUrl = that.getFileUrl("current_ave")
          this.tempAndsaltReset()
          that.particeRemove();
          //绘制离子
          $.ajax({
            type: 'get',
            url: cAveUrl.particleUrl,
            dataType: 'json',
            success: function (response) {
              var header = response[0].header
              viewer.camera.setView({
                destination: Cesium.Rectangle.fromDegrees(
                  header['lo1'],
                  header['la2'],
                  header['lo2'],
                  header['la1']
                )
              })

              if (that.windy) {

              } else {
                that.windy = new Windy(response, that.viewer)
                that.redraw()
              }
            },
            error: function (errorMsg) {
              // alert('请求数据失败!')
            }
          })
          //单点查询
          var queryUrl = cAveUrl.queryUrl;
          $.get(queryUrl, function (result) {
            that.queryCol = []
            arrPoint = result
            arrPoint.forEach(function (item, cIndex) {
              if (item.W != -9999) {
                that.queryCol.push({
                  x: that.uniGrid[cIndex].x,
                  y: that.uniGrid[cIndex].y,
                  value: parseFloat(item.W.toFixed(2))
                })
              }
            })
            that.handleMove(); that.handleClick();
          })

          break;
      }
    },
    handleMove() {
      var that = this
      var inthtml = '<div></div>';
      //添加实体
      var entity = that.dataSource.entities.add({
        tooltip: {
          html: inthtml,
          anchor: [0, -12],
        }
      });
      that.handler = new Cesium.ScreenSpaceEventHandler(that.viewer.scene.canvas);
      that.handler.setInputAction(function (movement) {
        var windowPosition = that.viewer.camera.getPickRay(movement.endPosition);
        var cartesianCoordinates = that.viewer.scene.globe.pick(windowPosition, viewer.scene);
        var cartoCoordinates = that.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianCoordinates);
        var x = Cesium.Math.toDegrees(cartoCoordinates.longitude);
        var y = Cesium.Math.toDegrees(cartoCoordinates.latitude);
        var value1 = 0;
        var interv = 0.017;
        for (var i = 0; i < that.queryCol.length; i++) {
          var intx = Math.abs(x - that.queryCol[i].x);
          var inty = Math.abs(y - that.queryCol[i].y);
          if (intx < interv && inty < interv) {
            value1 = that.queryCol[i].value;
            interv = Math.min(intx, inty);
          }
        }
        if (value1) {
          entity.tooltip = {
            html: '<div><span>日期：</span><span>' + that.dynamicflagDate + '</span></div><br><div><span>经度：</span><span>' + x.toFixed(3) + '</span></div><br><div><span>纬度：</span><span>' + y.toFixed(3) +
              '</span></div><br><div><span>数值：' + '</span><span>' + value1 || 0 + '</span><div>',
          };
        } else {
          entity.tooltip = {
            html: ''
          }
        }
        that.viewer.mars.tooltip.show(entity, Cesium.Cartesian3.fromDegrees(x, y));
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    handleClick() {
      var that = this
      that.handler = new Cesium.ScreenSpaceEventHandler(that.viewer.scene.canvas);
      that.handler.setInputAction(function (movement) {
        if (that.queryActive) {
          that.queryNum = null;
          var windowPosition = that.viewer.camera.getPickRay(movement.position);
          var cartesianCoordinates = that.viewer.scene.globe.pick(windowPosition, viewer.scene);
          var cartoCoordinates = that.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianCoordinates);
          var x = Cesium.Math.toDegrees(cartoCoordinates.longitude);
          var y = Cesium.Math.toDegrees(cartoCoordinates.latitude);
          var interv = 0.017;
          for (var i = 0; i < that.uniGrid.length; i++) {
            var intx = Math.abs(x - that.uniGrid[i].x);
            var inty = Math.abs(y - that.uniGrid[i].y);
            if (intx < interv && inty < interv) {
              that.queryNum = i;
              interv = Math.min(intx, inty);
            }
          }
          //增加查询marker
          that.addQueryMarker(x, y);
          that.getChartData();
          //查询该点时序值

        }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    },
    checkNum(x, y) {
      var that = this
      var idx;
      var interv = 0.017;
      for (var i = 0; i < that.uniGrid.length; i++) {
        var intx = Math.abs(x - that.uniGrid[i].x);
        var inty = Math.abs(y - that.uniGrid[i].y);
        if (intx < interv && inty < interv) {
          idx = i;
          interv = Math.min(intx, inty);
        }
      }
      return idx;
    },
    addQueryMarker(x, y) {
      this.querySource.entities.removeAll();
      var entity = this.querySource.entities.add({
        position: Cesium.Cartesian3.fromDegrees(x, y, 100),
        billboard: {
          image: 'img/marker/mark3.png',
          scale: 0.7,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
        },
      });
    },
    checkChartData(attr, type, num) {
      var that = this;
      var data = {
        platType: attr.type,
        id: attr.id,
        currentType: type,
        depth: attr.depth,
        date: moment(that.currentTime).format('YYYY-MM-DD HH:mm:ss'),
        num: num
      }
      mars3d.widget.activate({
        uri: that.checkWidgetUri,
        data: data
      });
    },
    getChartData() {
      var that = this
      if (that.currentType && that.currentLoc && that.queryNum && that.currentLevel) {
        var level = that.currentLevel.split('m')[0]
        var data = {
          type: that.currentType,
          loc: that.currentLoc,
          num: that.queryNum,
          level: level,
          datetime: moment(that.currentTime).format('YYYY-MM-DD HH:mm:ss')
        }
        mars3d.widget.activate({
          uri: this.charsWidgetUri,
          data: data
        });
      }
    },
    tempAndsaltReset() {
      this.queryCol = []
      if (this.imgLayers.length != 0) {
        this.imgLayers.forEach(function (imglayer) {
          if (this.viewer.imageryLayers.contains(imglayer)) {
            this.viewer.imageryLayers.remove(imglayer)
          }
        })
        this.imgLayers = []
      }

      // if (this.viewer.dataSources.contains(this.querySource)) {
      //   this.viewer.dataSources.remove(this.querySource)
      // }

      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        var legends = document.querySelector('.legend-area');
        legends.style.display = 'none';
        this.handler = null;
      }
    },
    initDepthSelect() {
      var col = [];
      for (var i = 0; i < 102; i++) {
        if (i * 5 < 500) {
          col.push(i * 5)
        }
      };
      for (var j = 5; j < 21; j++) {
        if (j * 100 < 2001) {
          col.push(j * 100)
        }
      };
      col.forEach(function (item) {
        var temp = "<option value='" + item + "'>" + item + "m</option>"
        $("#s_depSelect").append(temp);
      })
    },
    particeRemove() {
      if (this.windy) {
        this.windy.removeLines()
        this.windy = null;
      }
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  })
)
