
//loading bar
var loadingBar = document.getElementById('loadbar');
var oldTime = new Date().getTime();

function run() {
    var curTime = new Date().getTime();
    if (curTime - oldTime >= 3500) {
        loadingBar.className = "";
        if (curTime - oldTime >= 3550) {
            loadingBar.className = "ins";
            oldTime = curTime;
        }
    }
    if (Window.LOADING_FLAG == true) {
        clearInterval(loadIdx);
    }
}

function loaderOK() {
    $("#loadOverlay").hide();
    $('#loadbar').removeClass('ins');
    Window.LOADING_FLAG = true;
}
var loadIdx = setInterval(run, 100);


//地图
$(document).ready(function () {
    if (!mars3d.util.webglreport()) {
        toastr.error('系统检测到您当前使用的浏览器WebGL功能无效');
        layer.open({
            type: 1,
            title: "当前浏览器WebGL功能无效",
            skin: "layer-mars-dialog animation-scale-up",
            resize: false,
            area: ['600px', '200px'], //宽高
            content: '<div style="margin: 20px;"><h3>系统检测到您使用的浏览器WebGL功能无效！</h3>  <p>1、请您检查浏览器版本，安装使用最新版chrome、火狐或IE11以上浏览器！</p> <p>2、WebGL支持取决于GPU支持，请保证客户端电脑已安装最新显卡驱动程序！</p><p>3、如果上两步骤没有解决问题，说明您的电脑需要更换了！</p></div>'
        });
    }
    initUI();
    initMap();
});

function removeMask() {
    $("#mask").remove();
}

var viewer;
//初始化地图
function initMap() {
    var request = haoutil.system.getRequest();

    var configfile = "config/config.json";
    if (request.config)
        configfile = request.config;

    haoutil.loading.show();

    var earth = mars3d.createMap({
        id: 'cesiumContainer',
        url: configfile + "?time=20191024",
        //infoBox: false,     //是否显示点击要素之后显示的信息  【也可以在config.json中配置】  
        //sceneMode: Cesium.SceneMode.SCENE2D,
        layerToMap: layerToMap,
        success: function (_viewer, gisdata, jsondata) { //地图成功加载完成后执行 
            //欢迎UI关闭处理
            setTimeout(removeMask, 3000);
            loaderOK();
            haoutil.loading.hide();

            //记录viewer
            viewer = _viewer;

            //初始化widget管理器
            var hasAnimation = true;
            if (haoutil.isutil.isNotNull(request.widget)) {
                jsondata.widget.widgetsAtStart.push({
                    uri: request.widget,
                    request: request
                });
                hasAnimation = false;
            }
            mars3d.widget.init(_viewer, jsondata.widget);

            //如果有xyz传参，进行定位 
            if (haoutil.isutil.isNotNull(request.x) &&
                haoutil.isutil.isNotNull(request.y)) {
                viewer.mars.centerAt(request, { duration: 0, isWgs84: true });
            }

            if (hasAnimation)
                // viewer.mars.openFlyAnimation(); //开场动画

                initWork(_viewer);
            var handler = new Cesium.ScreenSpaceEventHandler(_viewer.scene.canvas);
            handler.setInputAction(function (click) {
                // 处理鼠标按下事件
                // 获取鼠标当前位置
                // console.log('1111');
                console.log(Util.Tool.getLocation(viewer, click));
                var pick = _viewer.scene.pick(click.position);
                //选中某模型   pick选中的对象
                if (pick && pick.id) {

                }

            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

            initStart(_viewer);
        }
    });
}


//UI界面相关
function initUI() {
    haoutil.oneMsg('首次访问系统无缓存会略慢，请耐心等待！', 'load3d_tip');
}

//初始化旋转
function initStart(viewer) {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(114.406534, 30.566363, 18061284), //经度、纬度、高度
        orientation: {
            heading: Cesium.Math.toRadians(0),  //绕垂直于地心的轴旋转
            pitch: Cesium.Math.toRadians(-90),  //绕纬度线旋转
            roll: Cesium.Math.toRadians(0)      //绕经度线旋转
        },
        duration: 0 //动画持续时间
    });

    viewer.clock.multiplier = 200;//速度
    viewer.clock.shouldAnimate = true;
    rotate(viewer);
}


function rotate(viewer) {
    var previousTime = viewer.clock.currentTime.secondsOfDay;
    function onTickCallback(clock) {
        var spinRate = 1;
        var currentTime = viewer.clock.currentTime.secondsOfDay;
        var delta = (currentTime - previousTime) / 1000;
        previousTime = currentTime;
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
    }
    viewer.clock.onTick.addEventListener(onTickCallback);
}



//当前页面业务相关
function initWork(viewer) {
    haoutil.oneMsg('如果未出现地球，是因为地形加载失败，请刷新重新加载！', 'terrain_tip');

    // 禁用默认的实体双击动作。
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //webgl渲染失败后，刷新页面
    //viewer.scene.renderError.addEventListener(function (scene, error) {
    //    window.location.reload();
    //});


    //移动设备上禁掉以下几个选项，可以相对更加流畅
    if (!haoutil.system.isPCBroswer()) {
        viewer.targetFrameRate = 20; //限制帧率
        viewer.requestRenderMode = true; //取消实时渲染
        viewer.scene.fog.enable = false;
        viewer.scene.skyAtmosphere.show = false;
        viewer.scene.fxaa = false;
    }

    //IE浏览器优化
    if (window.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
        viewer.targetFrameRate = 20; //限制帧率
        viewer.requestRenderMode = true; //取消实时渲染
    }

    //更改配置，性能优化
    viewer.scene.logarithmicDepthBuffer = false;

    //二三维切换不用动画
    if (viewer.sceneModePicker)
        viewer.sceneModePicker.viewModel.duration = 0.0;

    //设置操作习惯,更换中键和右键 
    //viewer.scene.screenSpaceCameraController.tiltEventTypes = [
    //    Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.PINCH,
    //    { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
    //    { eventType: Cesium.CameraEventType.RIGHT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }
    //];
    //viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];


    //3dtiles模型的单体化高亮，在ex/featureViewer.js处理
    featureViewer.install(viewer);


    //旋转


}



//config中非底层类库封装类，可以在此加入进行实例化
function layerToMap(item, viewer, layer) {
    switch (item.type) {
        //case "s3m"://超图S3M数据加载 
        //    return new S3MLayer(item, viewer);
        //    break;
    }
}



//绑定图层管理
function bindToLayerControl(options) {
    if (options._layer == null) {
        var _visible = options.visible;
        delete options.visible;

        var layer = new mars3d.layer.BaseLayer(options, viewer);
        layer._visible = _visible;
        options._layer = layer;
    }

    var manageLayersWidget = mars3d.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.addOverlay(options);
    } else {
        viewer.gisdata.config.operationallayers.push(options);
    }
    return options._layer;
}
//取消绑定图层管理
function unbindLayerControl(name) {
    var manageLayersWidget = mars3d.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.removeLayer(name);
    } else {
        var operationallayersCfg = viewer.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                operationallayersCfg.splice(i, 1);
                break;
            }
        }
    }
}

//外部页面调用
function activateWidget(item) {
    mars3d.widget.activate(item);
}

function disableWidget(item) {
    mars3d.widget.disable(item);
}

function activateFunByMenu(fun) {
    eval(fun);
}