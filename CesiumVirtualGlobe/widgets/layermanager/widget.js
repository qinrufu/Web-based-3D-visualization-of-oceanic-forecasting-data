
// 模块：
// CesiumPlugins/space/sensor.js
var widgetSound = mars3d.widget.bindClass(
  mars3d.widget.BaseWidget.extend({
    options: {
      resources: ['style.css', 'config.css', 'data.css', 'lib/bootstrap3.3.css', 'lib/bootstrap-treeview.min.js', 'data/depth.js',
        'lib/converter.js',
        './lib/CesiumPlugins/heatmap/heatmap.min.js',
        './lib/CesiumPlugins/heatmap/HeatmapImageryProvider.js',
        './js/windy/Windy.js',
        'grid/grid.js'],
      view: [{ type: 'append', url: 'view.html' }]
    },
    uniGrid: [],
    dataSource: null,
    aisSource: null,
    latlngGridLayer: null,
    snLayer: null,
    soundLayer: null,
    queryCol: [],
    currentDate: moment().format("YYYYMMDD"),
    currentTime: moment().format("YYYY-MM-DD") + " 00:00:00",
    intergrateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    soundDepth: null,
    dynamicDepth: 0,

    soundImgLayer: null,
    tempImgLayer: null,
    saltImgLayer: null,

    tempImgCol: [],
    saltImgCol: [],
    waterImgCol: [],
    windy: null,
    timer: null,


    latestSource: null,

    currentIndex: 0,
    dynamicflagDate: moment().format("YYYY-MM-DD") + " 00",
    sonarBaseDate: moment().format("YYYY-MM-DD") + " 00:00:00",
    currentTimeIndex: 0,
    ifAISActive: false,
    ifWaterActive: false,
    ifSaltActive: false,
    ifTempActive: false,
    ifFwrActive: false,
    ifSoundActive: false,
    handler: null,
    currentPoint: {},
    layer: '',

    initPlatData: [],
    initTaskData: [],
    ywSource: null,
    jafbSource: null,
    jaqbSurce: null,
    fburce: null,
    qbSource: null,
    jbhSource: null,
    qqSource: null,


    usvSource: null,
    gliderSource: null,
    auvSource: null,
    zxauvSource: null,


    ifYwActive: false,
    ifJafbActive: false,
    ifJaqbActive: false,
    ifQbActive: false,
    ifFbActive: false,
    ifJbhActive: false,
    ifUsvActive: false,

    ifGliderActive: false,
    ifAuvActive: false,
    ifZxAuvActive: false,
    ifQqActive: false,


    currentPlat: {},




    // 初始化[仅执行1次]
    create: function () {
      this.dataSource = new Cesium.CustomDataSource()
      this.snLayer = new Cesium.CustomDataSource()
      this.soundLayer = new Cesium.CustomDataSource()
      this.aisSource = new Cesium.CustomDataSource()


      this.ywSource = new Cesium.CustomDataSource()
      this.jafbSource = new Cesium.CustomDataSource()
      this.jaqbSource = new Cesium.CustomDataSource()
      this.fbSource = new Cesium.CustomDataSource()
      this.qbSource = new Cesium.CustomDataSource()
      this.jbhSource = new Cesium.CustomDataSource()


      this.usvSource = new Cesium.CustomDataSource()
      this.gliderSource = new Cesium.CustomDataSource()
      this.auvSource = new Cesium.CustomDataSource()
      this.zxauvSource = new Cesium.CustomDataSource()


      this.latestSource = new Cesium.CustomDataSource()

      this.qqSource = new Cesium.CustomDataSource()

      this.viewer.clock.shouldAnimate = false;
      this.removeRotation()
      this.viewer.mars.centerAt({
        x: 115.5217819402912,
        y: 9.531636584415477,
        z: 505000,
        heading: 352.7,
        pitch: -86.3,
        roll: 0.7
      })
    },
    winCreateOK: function () {
      var that = this
      $('#tree').treeview({
        data: that.getTree(),
        levels: 2,
        backColor: 'rgba(0,0,0,0)',
        color: "white",
        onhoverColor: "rgba(31, 63, 60, 0.8)",
        selectedBackColor: "rgba(31, 63, 60, 0.8)",
        multiSelect: true,
        showCheckbox: false,
        showBorder: false,
        onNodeSelected: function (event, data) {
          console.log(data)
          if (data.text == "原位平台") {
            that.ifYwActive = true;
            that.addPlatform('yw')
          }
          if (data.text == "近岸浮标") {
            that.ifJafbActive = true;
            that.addPlatform('jafb')
          }
          if (data.text == "近岸潜标") {
            that.ifJaqbActive = true;
            that.addPlatform('jaqb')
          }
          if (data.text == "潜标") {
            that.ifQbActive = true;
            that.addPlatform('qb')
          }
          if (data.text == "浮标") {
            that.ifFbActive = true;
            that.addPlatform('fb')
          }
          if (data.text == "接驳盒") {
            that.ifJbhActive = true;
            that.addPlatform('jbh')
          }

          if (data.text == "无人船") {
            that.ifUsvActive = true;
            that.addPlatform('usv')
          }

          if (data.text == "滑翔机") {
            that.ifGliderActive = true;
            that.addPlatform('glider')
          }

          if (data.text == "轻型AUV") {
            that.ifAuvActive = true;
            that.addPlatform('auv')
          }

          if (data.text == "重巡AUV") {
            that.ifZxAuvActive = true;
            that.addPlatform('zxauv')
          }


          if (data.text == "气球") {
            that.ifZxAuvActive = true;
            that.addPlatform('qq')
          }

          else if (data.text == "反蛙人声呐") {
            that.ifFwrActive = true;
          }
          else if (data.text == "声场") {
            that.ifSoundActive = true;
            that.soundDataInit()
          }
          else if (data.text == "Temperature") {
            that.ifTempActive = true;
            that.drawTemp();
          }
          else if (data.text == "Salinity") {
            that.ifSaltActive = true;
            that.drawSalt();
          }
          else if (data.text == "水位") {
            that.ifWaterActive = true;
            that.drawWater();
          }
          else if (data.text == "Currents") {
            that.ifCurrentActive = true;
            that.drawCurrent()
          }
          else if (data.text == "AIS") {
            that.ifAISActive = true;
            that.addAISData(moment().format('YYYY-MM-DD HH:mm:ss'));
          }
        },
        onNodeUnselected: function (event, data) {
          console.log(data)
          if (data.text == "原位平台") {
            that.ifYwActive = false;
            that.removePlatform('yw')
          }

          if (data.text == "近岸浮标") {
            that.ifJafbActive = false;
            that.removePlatform('jafb')
          }
          if (data.text == "近岸潜标") {
            that.ifJaqbActive = false;
            that.removePlatform('jaqb')
          }
          if (data.text == "潜标") {
            that.ifQbActive = false;
            that.removePlatform('qb')
          }
          if (data.text == "浮标") {
            that.ifFbActive = false;
            that.removePlatform('fb')
          }
          if (data.text == "接驳盒") {
            that.ifJbhActive = false;
            that.removePlatform('jbh')
          }

          if (data.text == "气球") {
            that.ifQqActive = false;
            that.removePlatform('qq')
          }


          if (data.text == "无人船") {
            that.ifUsvActive = false;
            that.removePlatform('usv')
          }

          if (data.text == "滑翔机") {
            that.ifGliderActive = false;
            that.removePlatform('glider')
          }

          if (data.text == "轻型AUV") {
            that.ifAuvActive = false;
            that.removePlatform('auv')
          }

          if (data.text == "重巡AUV") {
            that.ifZxAuvActive = false;
            that.removePlatform('zxauv')
          }


          else if (data.text == "反蛙人声呐") {
            that.ifFwrActive = false;
            that.snLayer.entities.removeAll()
          }
          else if (data.text == "声场") {
            that.ifSoundActive = false;
            that.currentPoint = {}
            that.soundLayer.entities.removeAll()
            if (that.soundImgLayer) {
              that.viewer.imageryLayers.remove(this.soundImgLayer)
            }
          }
          else if (data.text == "温度") {
            that.ifTempActive = false;
            that.removeTempImg()
          }
          else if (data.text == "盐度") {
            that.ifSaltActive = false;
            that.removeSaltImg()
          }
          else if (data.text == "水位") {
            that.ifWaterActive = false;
            that.removeWaterImg()
          }
          else if (data.text == "流场") {
            that.ifCurrentActive = false;
            that.particeRemove()
          }
          else if (data.text == "AIS") {
            that.ifAISActive = false;
            that.aisSource.entities.removeAll()
          }
        }
      });
      that.initDepthSelect()

      $('#inter_sound_depSelect').change(function () {
        that.soundDepth = $('#inter_sound_depSelect  option:selected').val()
        that.getSoundData()
      });
      $('#inter_dynamic_depSelect').change(function () {
        that.dynamicDepth = $('#inter_dynamic_depSelect  option:selected').val()
        that.removeTempImg()
        that.removeSaltImg()
        that.removeWaterImg()
        that.particeRemove()
        if (that.ifTempActive) {
          that.drawTemp()
        }
        if (that.ifSaltActive) {
          that.drawSalt()
        }
        if (that.ifCurrentActive) {
          that.drawCurrent()
        }
      });

    },
    // 打开激活
    activate: function () {
      var that = this
      that.uniGrid = UNIGIRD.grid;
      if (!this.viewer.dataSources.contains(this.dataSource)) {
        this.viewer.dataSources.add(this.dataSource)
      }
      if (!this.viewer.dataSources.contains(this.snLayer)) {
        this.viewer.dataSources.add(this.snLayer)
      }
      if (!this.viewer.dataSources.contains(this.soundLayer)) {
        this.viewer.dataSources.add(this.soundLayer)
      }
      if (!this.viewer.dataSources.contains(this.aisSource)) {
        this.viewer.dataSources.add(this.aisSource)
      }


      if (!this.viewer.dataSources.contains(this.ywSource)) {
        this.viewer.dataSources.add(this.ywSource)
      }

      if (!this.viewer.dataSources.contains(this.jafbSource)) {
        this.viewer.dataSources.add(this.jafbSource)
      }

      if (!this.viewer.dataSources.contains(this.jaqbSource)) {
        this.viewer.dataSources.add(this.jaqbSource)
      }

      if (!this.viewer.dataSources.contains(this.fbSource)) {
        this.viewer.dataSources.add(this.fbSource)
      }

      if (!this.viewer.dataSources.contains(this.qbSource)) {
        this.viewer.dataSources.add(this.qbSource)
      }

      if (!this.viewer.dataSources.contains(this.jbhSource)) {
        this.viewer.dataSources.add(this.jbhSource)
      }


      if (!this.viewer.dataSources.contains(this.usvSource)) {
        this.viewer.dataSources.add(this.usvSource)
      }


      if (!this.viewer.dataSources.contains(this.gliderSource)) {
        this.viewer.dataSources.add(this.gliderSource)
      }
      if (!this.viewer.dataSources.contains(this.auvSource)) {
        this.viewer.dataSources.add(this.auvSource)
      }

      if (!this.viewer.dataSources.contains(this.zxauvSource)) {
        this.viewer.dataSources.add(this.zxauvSource)
      }
      if (!this.viewer.dataSources.contains(this.qqSource)) {
        this.viewer.dataSources.add(this.qqSource)
      }
      if (!this.viewer.dataSources.contains(this.latestSource)) {
        this.viewer.dataSources.add(this.latestSource)
      }



      that.getInitPlat()

      $.datetimepicker.setLocale('ch');
      $('#integratdatetimepicker').val(that.currentDate);
      $('#integratdatetimepicker').datetimepicker({
        timepicker: false,
        format: 'Y-m-d',
        onSelectDate: function (dp, $input) {
          that.currentTime = $input.val() + " 00:00:00";
          that.currentDate = moment($input.val()).format("YYYYMMDD");
          that.intergrateTime = moment($input.val()).format('YYYY-MM-DD HH:mm:ss');
          that.sonarBaseDate = $input.val() + " 00:00:00";
          var startDate = Cesium.JulianDate.fromDate(new Date(that.currentTime))
          var endDate = Cesium.JulianDate.addSeconds(startDate, 86400, new Cesium.JulianDate());
          that.viewer.timeline.zoomTo(startDate, endDate);
          that.viewer.clock.startTime = startDate;
          that.viewer.clock.endTime = endDate;
          that.viewer.clock.currentTime = startDate;
          that.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
          that.viewer.clock.multiplier = 1;
          that.viewer.clock.previousTime = that.viewer.clock.currentTime.secondsOfDay;

          //remove img
          that.removeTempImg()
          that.removeSaltImg()
          that.removeWaterImg()
          that.particeRemove()

          if (that.ifSoundActive) {
            that.soundDataInit()
          }
          if (that.ifTempActive) {
            that.currentTimeIndex = 0
            that.drawTemp()
          }
          if (that.ifSaltActive) {
            that.currentTimeIndex = 0
            that.drawSalt()
          }
          if (that.ifWaterActive) {
            that.currentTimeIndex = 0
            that.drawWater()
          }
          if (that.ifAISActive) {
            that.addAISData(that.currentTime)
          }
          if (that.currentPlat.hasOwnProperty('id')) {
            that.getLatest()
          }
        }
      });
      function onTickIntergratePlay(clock) {
        var flagDate = Cesium.JulianDate.toDate(that.viewer.clock.currentTime)
        var dynamicTempDate = moment(flagDate).format("YYYYMMDD HH");
        var intergrateDt = Cesium.JulianDate.toDate(that.viewer.clock.currentTime);
        that.intergrateTime = moment(intergrateDt).format('YYYY-MM-DD HH:mm:ss');
        if (dynamicTempDate != that.dynamicflagDate) {
          that.dynamicflagDate = dynamicTempDate;
          var tempDate = Cesium.JulianDate.toDate(that.viewer.clock.currentTime)
          that.currentTimeIndex = moment(tempDate).diff(moment(that.currentTime), 'hours')
          if (that.ifTempActive) {
            that.drawTemp()
          }
          if (that.ifSaltActive) {
            that.drawSalt()
          }
          if (that.ifWaterActive) {
            that.drawWater()
          }
          if (that.ifCurrentActive) {
            that.drawCurrent()
          }

        }

        var sonarFlagDate = moment(flagDate).format("YYYY-MM-DD HH:mm:ss");
        if (Math.abs(moment(sonarFlagDate).diff(moment(that.sonarBaseDate), 'seconds')) > 9) {
          that.sonarBaseDate = sonarFlagDate;
          if (that.ifFwrActive) {
            that.checkHisSnTrack(sonarFlagDate)
          }
          if (that.ifAISActive) {
            that.addAISData(sonarFlagDate)
          }
          if (that.currentPlat.hasOwnProperty('id')) {
            that.getLatest()
          }
          that.getLatestLoc()

        }
      }
      that.viewer.clock.onTick.addEventListener(onTickIntergratePlay);
    },
    // 关闭释放
    disable: function () {
      if (this.viewer.dataSources.contains(this.dataSource)) {
        this.viewer.dataSources.remove(this.dataSource)
      }
      if (this.viewer.dataSources.contains(this.snLayer)) {
        this.viewer.dataSources.remove(this.snLayer)
      }
      if (this.viewer.dataSources.contains(this.soundLayer)) {
        this.viewer.dataSources.remove(this.soundLayer)
      }
      if (this.viewer.dataSources.contains(this.aisSource)) {
        this.viewer.dataSources.remove(this.aisSource)
      }

      if (this.viewer.dataSources.contains(this.ywSource)) {
        this.viewer.dataSources.remove(this.ywSource)
      }

      if (this.viewer.dataSources.contains(this.jafbSource)) {
        this.viewer.dataSources.remove(this.jafbSource)
      }

      if (this.viewer.dataSources.contains(this.jaqbSource)) {
        this.viewer.dataSources.remove(this.jaqbSource)
      }

      if (this.viewer.dataSources.contains(this.fbSource)) {
        this.viewer.dataSources.remove(this.fbSource)
      }

      if (this.viewer.dataSources.contains(this.qbSource)) {
        this.viewer.dataSources.remove(this.qbSource)
      }

      if (this.viewer.dataSources.contains(this.jbhSource)) {
        this.viewer.dataSources.remove(this.jbhSource)
      }

      if (this.viewer.dataSources.contains(this.usvSource)) {
        this.viewer.dataSources.remove(this.usvSource)
      }

      if (this.viewer.dataSources.contains(this.gliderSource)) {
        this.viewer.dataSources.remove(this.gliderSource)
      }

      if (this.viewer.dataSources.contains(this.auvSource)) {
        this.viewer.dataSources.remove(this.auvSource)
      }

      if (this.viewer.dataSources.contains(this.zxauvSource)) {
        this.viewer.dataSources.remove(this.zxauvSource)
      }
      if (this.viewer.dataSources.contains(this.qqSource)) {
        this.viewer.dataSources.remove(this.qqSource)
      }
      if (this.viewer.dataSources.contains(this.latestSource)) {
        this.viewer.dataSources.remove(this.latestSource)
      }

      this.initPlatData = [];
      this.initTaskData = [];
      this.queryCol = [];


      this.viewer.clock.onTick._listeners.forEach(function (ev) {
        if (ev.name == 'onTickIntergratePlay') {
          this.viewer.clock.onTick.removeEventListener(ev)
        }
      })


      if (this.soundImgLayer) {
        this.viewer.imageryLayers.remove(this.soundImgLayer)
      }
      this.removeTempImg()
      this.removeSaltImg()
      this.removeWaterImg()
      this.particeRemove()


      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler = null;
      }
    },
    clear: function () {
    },
    getInitPlat: function () {
      var that = this
      var url = baseUrlConfig.baseUrl + 'list';
      $.get(url, res => {
        res.forEach(item => {
          item.nodes.forEach(it => {
            that.initPlatData.push(it)
          })
        })
      })

      var taskListUrl = baseUrlConfig.baseUrl + 'tasklist/newest';
      $.get(taskListUrl, data => {
        data.forEach(item => {
          item.nodes.forEach(it => {
            that.initTaskData.push(it)
          })
        })
      })

    },
    addPlatform: function (type) {
      var that = this
      switch (type) {
        case 'yw':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'yw' && task.id == plat.id) {
                that.addModel('yw', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.ywSource.entities, { duration: 3 })
          break;
        case 'jafb':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'jafb' && task.id == plat.id) {
                that.addModel('jafb', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.jafbSource.entities, { duration: 3 })
          break;
        case 'jaqb':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'jaqb' && task.id == plat.id) {
                that.addModel('jaqb', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.jaqbSource.entities, { duration: 3 })
          break;
        case 'fb':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'fb' && task.id == plat.id) {
                that.addModel('fb', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.fbSource.entities, { duration: 3 })
          break;
        case 'qb':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'qb' && task.id == plat.id) {
                that.addModel('qb', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.qbSource.entities, { duration: 3 })
          break;
        case 'jbh':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'jbh' && task.id == plat.id) {
                that.addModel('jbh', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.jbhSource.entities, { duration: 3 })
          break;
        case 'qq':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'qq' && task.id == plat.id) {
                that.addModel('qq', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.qqSource.entities, { duration: 3 })
          break;
        case 'glider':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'glider' && task.id == plat.id) {
                that.addModel('glider', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.gliderSource.entities, { duration: 3 })
          break;

        case 'zxauv':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'zxauv' && task.id == plat.id) {
                that.addModel('zxauv', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.zxauvSource.entities, { duration: 3 })
          break;
        case 'auv':
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'auv' && task.id == plat.id) {
                that.addModel('auv', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.auvSource.entities, { duration: 3 })
          break;

        case 'usv':
          console.log(that.initTaskData)
          that.initTaskData.forEach(task => {
            that.initPlatData.forEach(plat => {
              if (task.type == 'usv' && task.id == plat.id) {
                that.addModel('usv', plat.name, task)
              }
            })
          })
          that.viewer.flyTo(that.usvSource.entities, { duration: 3 })
          break;
      }
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
    setCurrentPlat(data) {
      if (data) {
        this.currentPlat = {
          id: data.attr.id,
          type: data.attr.type
        }
      }
      $('#target_plat').html(data.name)
      this.rmOption('#target_table')
    },
    addModel: function (type, name, data) {
      var that = this
      var img = that.imgSwitch(type);
      var loc = Cesium.Cartesian3.fromDegrees(data.location[0], data.location[1], 20);
      switch (type) {
        case "yw":
          that.ywSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              name: name,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "jafb":
          that.jafbSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "jaqb":
          that.jaqbSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "qb":
          that.qbSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "fb":
          that.fbSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "jbh":
          that.jbhSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
        case "qq":
          that.qqSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;

        case "usv":
          that.usvSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;

        case "glider":
          that.gliderSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;

        case "auv":
          that.auvSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;

        case "zxauv":
          that.zxauvSource.entities.add({
            name: name,
            attr: {
              type: data.type,
              id: data.id,
              depth: data.depth,
              loc: data.location
            },
            position: loc, // 点集
            billboard: {
              image: img,
              scale: 0.6,  //原始大小的缩放比例
              pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
            },
            label: {
              text: name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
            },
            click: function (entity) {
              that.setCurrentPlat(entity)
              that.getLatest();
            }
          });
          break;
      }
    },
    removePlatform: function (type) {
      var that = this
      switch (type) {
        case 'yw':
          that.ywSource.entities.removeAll();
          break;
        case 'jafb':
          that.jafbSource.entities.removeAll();
          break;
        case 'jaqb':
          that.jaqbSource.entities.removeAll();
          break;
        case 'fb':
          that.fbSource.entities.removeAll();
          break;
        case 'qb':
          that.qbSource.entities.removeAll();
          break;
        case 'qq':
          that.qqSource.entities.removeAll();
          break;
        case 'jbh':
          that.jbhSource.entities.removeAll();
          break;
        case 'usv':
          that.usvSource.entities.removeAll();
          break;
        case 'glider':
          that.gliderSource.entities.removeAll();
          break;
        case 'auv':
          that.auvSource.entities.removeAll();
          break;
        case 'zxauv':
          that.zxauvSource.entities.removeAll();
          break;
      }

    },
    getLatest: function () {
      var that = this;
      var baseUrl = baseUrlConfig.baseUrl;
      var targetUrl = ""
      if (that.currentPlat.type) {
        switch (that.currentPlat.type) {
          case 'yw':
            targetUrl = baseUrl + 'intergrate/yw/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'jafb':
            targetUrl = baseUrl + 'intergrate/jafb/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'jaqb':
            targetUrl = baseUrl + 'intergrate/jaqb/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'fb':
            targetUrl = baseUrl + 'intergrate/fb/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'qb':
            targetUrl = baseUrl + 'intergrate/qb/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'jbh':
            targetUrl = baseUrl + 'intergrate/jbh/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'qq':
            targetUrl = baseUrl + 'intergrate/qq/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'usv':
            targetUrl = baseUrl + 'intergrate/usv/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'glider':
            targetUrl = baseUrl + 'intergrate/glider/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'auv':
            targetUrl = baseUrl + 'intergrate/auv/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;
          case 'zxauv':
            targetUrl = baseUrl + 'intergrate/zxauv/' + that.currentPlat.id + '/' + that.intergrateTime;
            break;

        }
        if (targetUrl) {
          $.get(targetUrl, data => {
            if (data) {
              that.updateTable(data[0])
            } else {
              // haoutil.msg('未能查询到该时刻数据!')
            }
          })
        }
      }

    },
    getLatestLoc: function () {
      var that = this
      var url = baseUrlConfig.baseUrl + 'intergrate/latestLoc/';
      var activeCol = [];
      if (this.ifUsvActive) {
        activeCol.push('usv');
      }
      if (this.ifGliderActive) {
        activeCol.push("glider");
      }
      if (this.ifAuvActive) {
        activeCol.push("auv")
      }
      if (this.ifZxAuvActive) {
        activeCol.push("zxauv")
      }
      if (activeCol.length != 0) {
        var params = activeCol.join('_')
        url = url + params + "/" + this.intergrateTime;
        $.get(url, res => {
          that.updateLoc(res)
        })
      }
    },
    updateLoc: function (data) {
      var that = this
      that.latestSource.entities.removeAll();
      data.forEach(item => {
        if (item.type == 'usv') {
          var img = that.imgSwitch(item.type);
          item.data.forEach(it => {
            var loc = Cesium.Cartesian3.fromDegrees(it.longitude, it.latitude, 20);
            that.latestSource.entities.add({
              name: it.usv_id,
              position: loc, // 点集
              billboard: {
                image: img,
                scale: 0.6,  //原始大小的缩放比例
                pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
              },
              label: {
                text: it.usv_id.toString(),
                font: 'normal small-caps normal 17px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
              }
            })
          })
        } else if (item.type == 'glider') {
          var img = that.imgSwitch(item.type);
          item.data.forEach(it => {
            var loc = Cesium.Cartesian3.fromDegrees(it.longitude, it.latitude, 20);
            that.latestSource.entities.add({
              name: it.glider_id,
              position: loc, // 点集
              billboard: {
                image: img,
                scale: 0.6,  //原始大小的缩放比例
                pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
              },
              label: {
                text: it.glider_id.toString(),
                font: 'normal small-caps normal 17px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
              }
            })
          })
        } else if (item.type == 'auv') {
          var img = that.imgSwitch(item.type);
          item.data.forEach(it => {
            var loc = Cesium.Cartesian3.fromDegrees(it.longitude, it.latitude, 20);
            that.latestSource.entities.add({
              name: it.auv_id,
              position: loc, // 点集
              billboard: {
                image: img,
                scale: 0.6,  //原始大小的缩放比例
                pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
              },
              label: {
                text: it.auv_id.toString(),
                font: 'normal small-caps normal 17px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
              }
            })
          })
        } else if (item.type == 'zxauv') {
          var img = that.imgSwitch(item.type);
          item.data.forEach(it => {
            var loc = Cesium.Cartesian3.fromDegrees(it.longitude, it.latitude, 20);
            that.latestSource.entities.add({
              name: it.zxauv_id,
              position: loc, // 点集
              billboard: {
                image: img,
                scale: 0.6,  //原始大小的缩放比例
                pixelOffset: new Cesium.Cartesian2(0, -10), // 偏移量
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
              },
              label: {
                text: it.zxauv_id.toString(),
                font: 'normal small-caps normal 17px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
              }
            })
          })
        }
      })

    },
    updateTable: function (data) {
      this.rmOption('#target_table')
      var template = "<thead> <tr> <th>属性</th> <th>值</th></tr> </thead><tbody>";
      for (var i in data) {
        template = template + "<tr><td>" + i + "</td><td>" + data[i] + "</td>";
      }
      template = template + '</tbody>';
      $('#target_table').append(template)

    },
    rmOption: function (ele) {
      $(ele).empty();
    },
    getTree: function () {
      var tree = [
        {
          text: "Observations",
          selectable: false,
          nodes: [
            {
              text: "原位平台",
            },
            {
              text: "近岸浮标",
            },
            {
              text: "近岸潜标"
            },
            {
              text: "浮标"
            },
            {
              text: "潜标"
            },
            {
              text: "接驳盒"
            },
            {
              text: "气球"
            },
            {
              text: "无人船"
            },
            {
              text: "滑翔机"
            },
            {
              text: "轻型AUV"
            },
            {
              text: "重巡AUV"
            }
          ]
        },
        {
          text: "Forecasts",
          selectable: false,
          nodes: [
            {
              text: "Temperature",
            },
            {
              text: "Salinity",
            },
            {
              text: "Currents",
            },
            {
              text: "Waterlevel",
            },
          ]
        },
        {
          text: "声场预报",
          selectable: false,
          nodes: [
            {
              text: "声场",
            }
          ]
        },
        {
          text: "目标探测",
          selectable: false,
          nodes: [
            {
              text: "反蛙人声呐",
            },
            {
              text: "AIS",
            },
          ]
        }
      ];
      return tree
    },
    removeRotation: function () {
      var that = this;
      that.viewer.clock.onTick._listeners.forEach(function (ev) {
        if (ev.name == 'onTickCallback') {
          that.viewer.clock.onTick.removeEventListener(ev)
        }
      })
    },
    checkHisSnTrack(date) {
      var that = this
      var url = baseUrlConfig.baseUrl + 'sn/hispath/' + date;
      $.get(url, function (res) {
        that.snLayer.entities.removeAll();
        var data = res;
        if (data) {
          data.forEach(function (item) {
            for (var i = 0; i < item.length - 2; i++) {
              var color = Cesium.Color.YELLOW;
              var id = item[0].target_number;
              switch (item[0].trajectory_color) {
                case '绿色': color = Cesium.Color.GREEN; break;
                case '红色': color = Cesium.Color.RED; break;
              }
              //轨迹
              that.snLayer.entities.add({
                name: id + '_',
                polyline: {
                  positions: Cesium.Cartesian3.fromDegreesArrayHeights([item[i].longitude / 1000000, item[i].latitude / 1000000, 50, item[i + 1].longitude / 1000000, item[i + 1].latitude / 1000000, 50]),
                  width: 12,
                  followSurface: false,
                  material: new Cesium.PolylineArrowMaterialProperty(color)
                }
              });
              //结点
              var nodeid = item[i].current_local_number + 1;
              var inthtml = '<table style="width: 240px;"><tr>'
                + '<th scope="col" colspan="4"  style="text-align:center;font-size:15px;">' + '轨迹详情' + '</th></tr><tr>'
                + '<td >编号：</td><td >' + nodeid + '</td></tr><tr>'
                + '<td >目标类型：</td><td >' + item[i].trajectory_type + '</td></tr><tr>'
                + '<td >目标速度：</td><td >' + item[i].target_speed.toFixed(3) + '</td></tr><tr>'
                + '<td >目标航向：</td><td >' + item[i].target_course.toFixed(3) + '</td></tr><tr>'
                + '<td >目标距离:</td><td >' + item[i].target_distance.toFixed(3) + '</td></tr><tr>'
                + '<td >目标方位:</td><td >' + item[i].target_position.toFixed(3) + '</td></tr><tr>'
                + '</tr></table>';

              that.snLayer.entities.add({
                name: 'sn_' + id,
                position: Cesium.Cartesian3.fromDegrees(item[i].longitude / 1000000, item[i].latitude / 1000000, 50), // 点集
                point: {
                  // 像素点
                  color: color,
                  pixelSize: 10,
                  outlineColor: Cesium.Color.GREEN.withAlpha(0),
                  outlineWidth: 2,
                  scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
                },
                tooltip: {
                  html: inthtml,
                  anchor: [0, -12],
                }
              });
            }
          })
        }
      })
    },
    initDepthSelect() {
      //动力 
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
      this.dynamicDepth = col[0];
      col.forEach(function (item) {
        var temp = "<option value='" + item + "'>" + item + "m</option>"
        $("#inter_dynamic_depSelect").append(temp);
      })
      //声场
      // var depCol = SOUNDDEPTH.depth;
      // this.soundDepth = depCol[0]
      // depCol.forEach(function (item) {
      //   var temp = "<option value='" + item + "'>" + item + "m</option>"
      //   $("#inter_sound_depSelect").append(temp);
      // })
    },
    soundDataInit() {
      var that = this;
      that.clear();
      if (that.soundImgLayer) {
        that.viewer.imageryLayers.remove(that.soundImgLayer)
        that.soundImgLayer = null
      }
      that.queryCol = [];

      var url = baseUrlConfig.soundUrl + this.currentDate + "/header.json";
      $.get(url, function (res) {
        if (res) {
          that.soundAddFeature(res)
          that.initSoundDepthSelect(res[0].depth)
        }
      })
    },
    initSoundDepthSelect(depth) {
      this.rmOption('#sound_depSelect');
      var temp = "<option value=''>" + '请选择' + "</option>"
      $("#inter_sound_depSelect").append(temp);
      depth.forEach(function (item) {
        var temp = "<option value='" + item + "'>" + item + "m</option>"
        $("#inter_sound_depSelect").append(temp);
      })
    },
    soundAddFeature(data) {
      var that = this
      data.forEach(function (item) {
        var inthtml = '<table style="width: 200px;"><tr>'
          + '<th scope="col" colspan="4"  style="text-align:center;font-size:15px;">' + '</th></tr><tr>'
          + '<td >预报时间：</td><td >' + that.currentDate + item.files + '时</td></tr><tr>'
          + '<td >中心点经度：</td><td >' + item.lon + '°</td></tr><tr>'
          + '<td >中心点纬度：</td><td >' + item.lat + '°</td></tr><tr>'
          + '<td >声源频率：</td><td >' + item.frequency + 'Hz</td></tr><tr>'
          + '<td >声源深度：</td><td >' + item.source_depth + 'm</td></tr><tr>'
          + '<td >接收深度：</td><td >' + item.accept_depth + 'm</td></tr><tr>'
          + '<td >预报距离：</td><td >' + item.distance + 'km</td></tr><tr>'
          + '<td >角度增量：</td><td >' + item.angle_increment + '°</td></tr><tr>'
          + '<td colspan="4" style="text-align:right;"></td></tr></table>';
        var loc = Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0);
        that.soundLayer.entities.add({
          position: loc,
          attr: {
            id: item.files,
            loc: {
              lat: item.lat,
              lon: item.lon
            }
          },
          point: {
            color: new Cesium.Color.fromCssColorString("#3388ff"),
            pixelSize: 10,
            outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: '声场中心点' + item.files,
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
          tooltip: {
            html: inthtml,
            anchor: [0, -12],
          },
          click: function (entity) {
            that.currentPoint = {
              id: entity.attr.id,
              loc: [entity.attr.loc.lon, entity.attr.loc.lat]
            }
            that.getSoundData()
          }
        });
      })
      that.viewer.flyTo(that.dataSource.entities, { duration: 3 })
    },
    getSoundData() {
      var that = this;
      if (that.soundImgLayer) {
        that.viewer.imageryLayers.remove(that.soundImgLayer)
        that.soundImgLayer = null
      }
      that.queryCol = []
      if (that.currentPoint && that.soundDepth && this.currentPoint.id.toString()) {
        var url = baseUrlConfig.soundUrl + this.currentDate + "/" + this.currentPoint.id + "/cesium/dep_" + that.soundDepth + ".json";
        $.get(url, function (res) {
          that.drawSoundImg(that.currentPoint.loc, res)
        })
      }

    },
    drawSoundImg: function (loc, data) {
      var that = this
      var convert = new UtmConverter();
      var wgsCoord = loc;
      var center = convert.toUtm({ coord: wgsCoord });
      var col = that.soundAdapter(data)
      col.forEach(function (it) {
        var coor = {
          coord: {
            x: center.coord.x + it.x,
            y: center.coord.y + it.y
          },
          isSouthern: center.isSouthern,
          zone: center.zone
        }
        var wgsCoor = convert.toWgs(coor);
        it.x = wgsCoor.coord.longitude;
        it.y = wgsCoor.coord.latitude;
        that.queryCol.push({
          x: it.x,
          y: it.y,
          value: it.value
        })
      })


      var defaultgradient = {
        0: "rgb(0,0,255)", 0.5: "rgb(0,255,0)", 1.0: "rgb(255,0,0)"
      }

      var heatLayer = createHeatmapImageryProvider(Cesium, {
        data: col,
        heatmapoptions: {
          blur: 1,
          radius: 4,
          useLocalExtrema: true,
          opacity: 1,
          xField: 'x',
          yField: 'y',
          valueField: 'value'
        }
      })
      that.handleMove();
      that.soundImgLayer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
    },

    soundAdapter: function (data) {
      var res = []
      var range = data.range
      var rangeGap = 20;
      var rangeInter = 4;
      data.data.forEach((element, idx) => {
        element.value.forEach(function (ele, index) {
          if (element.angle >= 0 && element.angle < 90) {
            if (index < rangeGap && idx % rangeInter == 0) {
              res.push({
                x:
                  (Math.sin((element.angle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (Math.cos((element.angle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            } else if (index >= rangeGap) {
              res.push({
                x:
                  (Math.sin((element.angle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (Math.cos((element.angle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            }
          }
          else if (element.angle >= 90 && element.angle < 180) {
            var tempAngle = element.angle - 90
            if (index < rangeGap && idx % rangeInter == 0) {
              res.push({
                x:
                  (Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (-Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            } else if (index >= rangeGap) {
              res.push({
                x:
                  (Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (-Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            }
          }
          else if (element.angle >= 180 && element.angle < 270) {
            var tempAngle = element.angle - 180
            if (index < rangeGap && idx % rangeInter == 0) {
              res.push({
                x:
                  (-Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (-Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })

            } else if (index >= rangeGap) {
              res.push({
                x:
                  (-Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (-Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            }
          }
          else if (element.angle >= 270 && element.angle < 360) {
            var tempAngle = element.angle - 270
            if (index < rangeGap && idx % rangeInter == 0) {
              res.push({
                x:
                  (-Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })

            } else if (index >= rangeGap) {
              res.push({
                x:
                  (-Math.cos((tempAngle * 2 * Math.PI) / 360) * range[index]),
                y:
                  (Math.sin((tempAngle * 2 * Math.PI) / 360) * range[index]),
                value: ele
              })
            }

          }
        })
      })
      return res
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
            html: value1,
          };
        } else {
          entity.tooltip = {
            html: ''
          };
        }
        that.viewer.mars.tooltip.show(entity, Cesium.Cartesian3.fromDegrees(x, y));
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    getFileUrl: function (type) {
      var layerUrl = "";
      var baseUrl = baseUrlConfig.dynamicUrl;
      var dateFile = moment(this.currentTime).format("YYYYMMDD");
      var hourFile = moment(this.currentTime).hours();
      switch (type) {
        case "water":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/LEVEL/cesium/time_" + this.currentTimeIndex + ".json";
          break;
        case "temp":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.dynamicDepth + "_time_" + this.currentTimeIndex + ".json";
          break;
        case "salt":
          layerUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.dynamicDepth + "_time_" + this.currentTimeIndex + ".json";
          break;
        case "current":

          queryUrl = baseUrl + dateFile + "/" + hourFile + "/TS/cesium/lev_" + this.dynamicDepth + "_time_" + this.currentTimeIndex + ".json";
          particleUrl = baseUrl + dateFile + "/" + hourFile + "/CURRENT/cesium/lev_" + this.dynamicDepth + "_time_" + this.currentTimeIndex + ".json";
          layerUrl = {
            queryUrl, particleUrl
          };
          break;

      }
      return layerUrl
    },
    drawTemp() {
      var that = this
      var layerFile = that.getFileUrl("temp")
      $.get(layerFile, function (result) {
        //init entity
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
            maxopacity: 0.8
          }
        })
        var tempImgLayer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
        that.tempImgCol.push(tempImgLayer)
        that.handleMove();
      })
    },
    drawWater() {
      var that = this
      var layerFile = that.getFileUrl("water")
      $.get(layerFile, function (result) {
        //init entity
        that.queryCol = []
        arrPoint = result
        arrPoint.forEach(function (item, tIndex) {
          if (item != -9999) {
            that.queryCol.push({
              x: that.uniGrid[tIndex].x,
              y: that.uniGrid[tIndex].y,
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
            maxopacity: 0.8
          }
        })
        var waterImgLayer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
        that.waterImgCol.push(waterImgLayer)
        that.handleMove();
      })

    },
    drawSalt() {
      var that = this
      var layerFile = that.getFileUrl("salt")
      $.get(layerFile, function (result) {
        //init entity
        that.dataSource.entities.removeAll()
        that.queryCol = []
        arrPoint = result
        arrPoint.forEach(function (item, tIndex) {
          if (item.S != -9999) {
            that.queryCol.push({
              x: that.uniGrid[tIndex].x,
              y: that.uniGrid[tIndex].y,
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
            maxopacity: 0.8
          }
        })
        var saltImgLayer = that.viewer.imageryLayers.addImageryProvider(heatLayer)
        that.saltImgCol.push(saltImgLayer)
        that.handleMove();
      })
    },
    drawCurrent() {
      var that = this
      var layerFile = that.getFileUrl("current")
      that.particeRemove()
      $.ajax({
        type: 'get',
        url: layerFile.particleUrl,
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
      var queryUrl = layerFile.queryUrl;
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
      })
    },
    removeTempImg() {
      var that = this
      if (that.tempImgCol.length != 0) {
        that.tempImgCol.forEach(function (imglayer) {
          if (that.viewer.imageryLayers.contains(imglayer)) {
            that.viewer.imageryLayers.remove(imglayer)
          }
        })
        that.tempImgCol = []
      }
    },
    removeSaltImg() {
      var that = this
      if (that.saltImgCol.length != 0) {
        that.saltImgCol.forEach(function (imglayer) {
          if (that.viewer.imageryLayers.contains(imglayer)) {
            that.viewer.imageryLayers.remove(imglayer)
          }
        })
        that.saltImgCol = []
      }
    },
    removeWaterImg() {
      var that = this
      if (that.waterImgCol.length != 0) {
        that.waterImgCol.forEach(function (imglayer) {
          if (that.viewer.imageryLayers.contains(imglayer)) {
            that.viewer.imageryLayers.remove(imglayer)
          }
        })
        that.waterImgCol = []
      }
    },
    addAISData: function (queryDate) {
      var that = this
      that.aisSource.entities.removeAll();
      var date = moment(queryDate).format("YYYY-MM-DD HH:mm:ss");
      that.aisSource.entities.removeAll()
      var url = baseUrlConfig.baseUrl + 'qq/aisData/' + date;
      $.get(url, function (res) {
        if (res) {
          res.forEach(item => {
            var lon = item.longitude;
            var lat = item.latitude
            var inthtml = '<table style="width: 240px;"><tr>'
              + '<th scope="col" colspan="4"  style="text-align:center;font-size:15px;">' + 'AIS船舶详情' + '</th></tr><tr>'
              + '<td >时间:</td><td >' + moment(item.location_time).format('YYYY-MM-DD HH:mm:ss') + '</td></tr><tr>'
              + '<td >MMSI:</td><td >' + item.ship_mmsi + '</td></tr><tr>'
              + '<td >经度:</td><td >' + lon.toFixed(3) + '</td></tr><tr>'
              + '<td >纬度:</td><td >' + lat.toFixed(3) + '</td></tr><tr>'
              + '<td >航向:</td><td >' + item.course + '°</td></tr><tr>'
              + '<td >船艏向:</td><td >' + item.bow_heading + '°</td></tr><tr>'
              + '<td >航速:</td><td >' + item.speed + '节</td></tr><tr>'
              + '<td >转向率ROT:</td><td >' + item.rotation_rate + '</td></tr><tr>'
              + '</tr></table>';

            that.aisSource.entities.add({
              name: 'ais_' + item.ship_mmsi,
              position: Cesium.Cartesian3.fromDegrees(lon, lat, 50), // 点集
              attr: {
                mmsi: item.ship_mmsi,
                date: moment(item.location_time).format('YYYY-MM-DD HH:mm:ss')
              },
              point: {
                color: Cesium.Color.RED.withAlpha(0.7),
                pixelSize: 10,
                outlineColor: Cesium.Color.RED.withAlpha(0),
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
              },
              tooltip: {
                html: inthtml,
                anchor: [0, -12],
              }
            });
          })
        }
      })
    },

    redraw: function () {
      var that = this
      that.timer = setInterval(function () {
        if (that.windy) {
          that.windy.animate()
        }
      }, 100)
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
