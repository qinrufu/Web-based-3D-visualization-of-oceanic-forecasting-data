
; (function () {
  var r = new RegExp('(^|(.*?\\/))(include-lib.js)(\\?|$)')

  var s = document.getElementsByTagName('script')

  var targetScript
  for (var i = 0; i < s.length; i++) {
    var src = s[i].getAttribute('src')
    if (src) {
      var m = src.match(r)
      if (m) {
        targetScript = s[i]
        break
      }
    }
  }

  // 当前版本号,用于清理浏览器缓存
  var cacheVersion = '20190418'

  // cssExpr 用于判断资源是否是css
  var cssExpr = new RegExp('\\.css')

  function inputLibs(list) {
    if (list == null || list.length == 0) return

    for (var i = 0, len = list.length; i < len; i++) {
      var url = list[i]
      if (cssExpr.test(url)) {
        var css =
          '<link rel="stylesheet" href="' + url + '?time=' + cacheVersion + '">'
        document.writeln(css)
      } else {
        var script =
          '<script type="text/javascript" src="' +
          url +
          '?time=' +
          cacheVersion +
          '"><' +
          '/script>'
        document.writeln(script)
      }
    }
  }

  // 加载类库资源文件
  function load() {
    var arrInclude = (targetScript.getAttribute('include') || '').split(',')
    var libpath = targetScript.getAttribute('libpath') || ''

    if (libpath.lastIndexOf('/') != libpath.length - 1) libpath += '/'

    var libsConfig = {
      jquery: [libpath + 'jquery/jquery-2.1.4.min.js'],
      'jquery.scrollTo': [libpath + 'jquery/scrollTo/jquery.scrollTo.min.js'],
      'jquery.minicolors': [
        libpath + 'jquery/minicolors/jquery.minicolors.css',
        libpath + 'jquery/minicolors/jquery.minicolors.min.js'
      ],
      'jquery.range': [
        libpath + 'jquery/range/range.css',
        libpath + 'jquery/range/range.js'
      ],
      ztree: [
        libpath + 'jquery/ztree/css/zTreeStyle/zTreeStyle.css',
        libpath + 'jquery/ztree/css/mars/ztree-mars.css',
        libpath + 'jquery/ztree/js/jquery.ztree.all.min.js'
      ],
      jstree: [
        libpath + 'jstree/themes/default-dark/style.css',
        libpath + 'jstree/jstree.min.js'
      ],
      'jquery.mCustomScrollbar': [
        libpath + 'jquery/mCustomScrollbar/jquery.mCustomScrollbar.css',
        libpath + 'jquery/mCustomScrollbar/jquery.mCustomScrollbar.js'
      ],
      jedate: [
        libpath + 'jquery/jedate/skin/jedate.css',
        libpath + 'jquery/jedate/jedate.js'
      ],
      lazyload: [libpath + 'jquery/lazyload/jquery.lazyload.min.js'],
      'font-awesome': [libpath + 'fonts/font-awesome/css/font-awesome.min.css'],
      'web-icons': [libpath + 'fonts/web-icons/web-icons.css'],
      animate: [libpath + 'animate/animate.css'],
      admui: [
        libpath + 'admui/css/index.css',
        libpath + 'admui/js/global/core.js', // 核心
        libpath + 'admui/js/global/configs/site-configs.js',
        libpath + 'admui/js/global/components.js'
      ],
      'admui-frame': [
        libpath + 'admui/css/site.css',
        libpath + 'admui/js/app.js'
      ],
      bootstrap: [
        libpath + 'bootstrap/bootstrap.css',
        libpath + 'bootstrap/bootstrap.min.js'
      ],
      'bootstrap-datetimepicker': [
        libpath + 'bootstrap/jquery.datetimepicker.full.js',
        libpath + 'bootstrap/jquery.datetimepicker.min.css',
      ],
      'bootstrap-table': [
        libpath + 'bootstrap/bootstrap-table/bootstrap-table.css',
        libpath + 'bootstrap/bootstrap-table/bootstrap-table.min.js',
        libpath + 'bootstrap/bootstrap-table/locale/bootstrap-table-zh-CN.js'
      ],
      'bootstrap-select': [
        libpath + 'bootstrap/bootstrap-select/bootstrap-select.css',
        libpath + 'bootstrap/bootstrap-select/bootstrap-select.min.js'
      ],
      'bootstrap-checkbox': [
        libpath + 'bootstrap/bootstrap-checkbox/awesome-bootstrap-checkbox.css'
      ],
      nprogress: [
        libpath + 'nprogress/nprogress.css',
        libpath + 'nprogress/nprogress.min.js'
      ],
      toastr: [libpath + 'toastr/toastr.css', libpath + 'toastr/toastr.js'],
      layer: [
        libpath + 'layer/theme/default/layer.css',
        libpath + 'layer/theme/retina/retina.css',
        libpath + 'layer/theme/mars/layer.css',
        libpath + 'layer/layer.js'
      ],
      haoutil: [libpath + 'hao/haoutil.js'],
      echarts: [
        libpath + 'echarts/echarts.min.js',
        // libpath + 'echarts/dark.js'
      ],
      'echarts-gl': [
        libpath + 'echarts/echarts.min.js',
        libpath + 'echarts/echarts-gl.min.js'
      ],
      mapV: [libpath + 'mapV/mapv.min.js'],
      highlight: [
        libpath + 'highlight/styles/foundation.css',
        libpath + 'highlight/highlight.pack.js'
      ],
      turf: [libpath + 'turf/turf.min.js'],
      terraformer: [
        libpath + 'babylon/terraformer-1.0.9.min.js',
        libpath + 'terraformer/terraformer-wkt-parser-1.2.0.min.js'
      ],
      babylon: [
        libpath + 'babylon/pep.min.js',
        libpath + 'babylon/dat.gui.min.js',
        libpath + 'babylon/ammo.js',
        libpath + 'babylon/cannon.js',
        libpath + 'babylon/Oimo.js',
        libpath + 'babylon/babylon.js',
        libpath + 'babylon/babylon.inspector.bundle.js',
        libpath + 'babylon/babylonjs.materials.min.js',
        libpath + 'babylon/babylonjs.proceduralTextures.min.js',
        libpath + 'babylon/babylonjs.postProcess.min.js',
        libpath + 'babylon/babylonjs.loaders.js',
        libpath + 'babylon/babylonjs.serializers.min.js',
        libpath + 'babylon/babylon.gui.min.js'
      ],
      'cesium-mars': [
        libpath + 'Cesium/Widgets/widgets.css',
        libpath + 'Cesium/Cesium.js',
        libpath + 'CesiumPlugins/gltf/fixGltf.js',
        libpath + 'CesiumPlugins/navigation/viewerCesiumNavigationMixin.css', // 导航
        libpath + 'CesiumPlugins/navigation/viewerCesiumNavigationMixin.min.js',
        libpath + 'cesium-mars/mars3d.css',
        libpath + 'cesium-mars/mars3d-src.js'
      ],
      'RangeSlider': [
        libpath + 'RangeSlider/ion.rangeSlider.min.js',
        libpath + 'RangeSlider/ion.rangeSlider.min.css'
      ],
      'Vue': [
        libpath + 'vue/vue.js'
      ],
      'Iconfont': [
        libpath + 'iconfont/iconfont.css',
      ],
      'BaseUrlConfig': [
        libpath + 'urlConfig.js',
      ],
      'LocConfig': [
        libpath + 'locConfig.js',
      ],
      'Moment': [
        libpath + 'moment/moment.js',
      ],
      'Sweetalert': [
        libpath + 'sweetalert/sweetalert.js',
      ],
      'Liquidfill': [
        libpath + 'liquidfill/echarts-liquidfill.js',
      ],
      'Video': [
        libpath + 'video/video.js',
        libpath + 'video/video.css',
      ],
      "socket": [
        libpath + 'socket/socket.js',
      ]

    }

    for (var i in arrInclude) {
      var key = arrInclude[i]
      inputLibs(libsConfig[key])
    }
  }

  load()
})()
