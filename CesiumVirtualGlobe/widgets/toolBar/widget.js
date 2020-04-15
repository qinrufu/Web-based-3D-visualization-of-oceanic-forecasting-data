/* 2017-10-20 15:49:52 | 修改 木遥（QQ：516584683） */

var toolBar = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        resources: ['view.css'],
        view: { type: "append", url: "view.html", "parent": "#centerDiv" },
    },
    //初始化[仅执行1次]
    create: function () {
    },
    //激活插件
    activate: function () {
    },
    //释放插件
    disable: function () {

    },

    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        var arr = this.config.data;

        if (this.config.style)
            $(".btn-toolbar").css(this.config.style);

        var hasBaseamp = false;
        var hasSetting = false;

        var inhtml = "";
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if (item.hasOwnProperty("visible") && !item.visible) continue;

            if (item.custom) {//自定义内置功能
                switch (item.custom) {
                    case "basemap": //底图设置
                        hasBaseamp = true;
                        inhtml += '<a data-toggle="dropdown" id="baseLayerBtn" title="' + item.name + '" class="btn btn-inverse" aria-expanded="false">\
                                    <span class="fa fa-map"></span>\
                                    <div class="dropDown-container">\
                                        <div id="baseLayerGroup">\
                                            <div id="baselayerWraper" class="service-items">\
                                            </div>\
                                        </div>\
                                        <div>\
                                            <div style="text-align : left;">\
                                                <div class="squaredTwo" id="chkTerrain">\
                                                    <input type="checkbox"><label class="check-icon"></label>\
                                                </div>\
                                                <label>显示地形</label>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </a>';
                        break;
                    case "setting": //参数设置
                        hasSetting = true;
                        inhtml += '<a id="settingBtn" data-toggle="dropdown" title="' + item.name + '" class="btn btn-inverse" aria-expanded="false">\
                                    <span class="fa fa-cog"></span>\
                                    <div class="dropDown-container" role="menu" aria-labelledby="settingBtn">\
                                        <div id="settingDropDown" style="min-width : 140px;border-radius : 4px;text-align : left;padding : 10px;">\
                                            <div>\
                                                <div class="squaredTwo" id="atomsphereRender">\
                                                    <input type="checkbox" >\
                                                    <label class="check-icon"></label>\
                                                </div><label>大气渲染</label>\
                                            </div>\
                                            <div>\
                                                <div class="squaredTwo" id="lightRender">\
                                                    <input type="checkbox" >\
                                                    <label class="check-icon"></label>\
                                                </div>\
                                                <label>日照渲染</label>\
                                            </div> \
                                            <div>\
                                                <div class="squaredTwo" id="testTerrain">\
                                                    <input type="checkbox" >\
                                                    <label class="check-icon"></label>\
                                                </div><label>深度监测</label>\
                                            </div>\
                                            <div>\
                                                <div class="squaredTwo" id="firstPerson">\
                                                    <input type="checkbox" >\
                                                    <label class="check-icon"></label>\
                                                </div><label>键盘控制</label>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </a>';
                        break;
                }
            }
            else if (item.children) { //分组 
                inhtml += ' <a data-toggle="dropdown" title="' + item.name + '" class="btn btn-inverse" aria-expanded="false">\
                                <span class="' + item.icon + '"></span>\
                                <div  class="dropDown-container measureDropDown">\
                                    <ul>';

                for (var j = 0, jlen = item.children.length; j < jlen; j++) {
                    var children_item = item.children[j];
                    if (children_item.hasOwnProperty("visible") && !children_item.visible) continue;

                    var ex = "";
                    if (children_item.onclick)
                        ex = 'onclick="' + children_item.onclick + '"';
                    else if (children_item.widget)
                        ex = 'data-widget="' + children_item.widget + '"';

                    inhtml += ' <li class="' + (children_item.widget ? 'widget-btn' : '') + '" ' + ex + '>\
                                    <i class="' + children_item.icon + '"></i>' + children_item.name + '\
                                </li> ';
                }
                inhtml += ' </ul></div></a>';
            }
            else {//不是分组
                var ex = "";
                if (item.onclick)
                    ex = 'onclick="' + item.onclick + '"';
                else if (item.widget)
                    ex = 'data-widget="' + item.widget + '"';

                inhtml += '<a title="' + item.name + '" class="btn btn-inverse ' + (item.widget ? 'widget-btn' : '') + '" ' + ex + '>\
                                <span class="' + item.icon + '"  ></span>\
                           </a>';
            }
        }
        $("#toolbar").html(inhtml);

        $(".btn-toolbar .widget-btn").click(function () {
            var uri = $(this).attr('data-widget');
            if (haoutil.isutil.isNull(uri)) return;

            console.log('单击了工具栏：' + uri);

            $('.dropDown-container').removeClass('dropDown-visible');
            if (mars3d.widget.isActivate(uri)) {
                mars3d.widget.disable(uri);
            }
            else {
                var name1 = $(this).attr('title');
                var name2 = $(this).html(); //会覆盖config中配置的名称
                if (name1 && name2)
                    name1 = name2 + name1;

                mars3d.widget.activate({ uri: uri, name: name1 || name2 });
            }
        });

        //此处可以绑定页面dom事件
        $(document).on('click.dropDown-container touchstart.dropDown-container', function (evt) {
            var len = $('#layerMangerBtn div.dropDown-visible').length
                + $('#measureBtn div.dropDown-visible').length
                + $('#flyBtn div.dropDown-visible').length;
            if (len > 0) {
                return;
            }
            $('.dropDown-container').removeClass('dropDown-visible');
        }).on('click.dropDown-container touchstart.dropDown-container', '[data-toggle=dropdown]', function (evt) {
            evt.stopPropagation();
            var target = evt.target;
            if (!target.contains(evt.currentTarget) && target.tagName != 'SPAN') {
                return;
            }
            var that = $(this), $parent, isActive;
            var $target = that.children('div.dropDown-container');
            if ($target.length == 0) {
                $('.dropDown-container').removeClass('dropDown-visible');
                return;
            }
            isActive = $target.hasClass('dropDown-visible');
            $('.dropDown-container').removeClass('dropDown-visible');
            if (!isActive) {
                $target.addClass('dropDown-visible');
            }
            return false;
        });


        //初始化各功能
        if (hasBaseamp)
            this.initBasemaps();
        if (hasSetting)
            this.bindSetting();
    },

    //================地图底图控制==================   
    initBasemaps: function () {
        var basemaps = this.viewer.gisdata.config.basemaps;
        if (basemaps != null) {
            var inhtml = '';
            for (var i = 0; i < basemaps.length; i++) {
                var item = basemaps[i];
                if (item.type == "group" && item.layers == null) continue;

                var icon = item.icon || ('img/basemaps/google_img.png');

                var itemIcon = item.visible ? 'service-itemIcon-selected' : '';   //蓝色边框线
                var itemService = item.visible ? 'service-itemSelected' : '';    //勾选效果

                inhtml += '<div class="service-item">  <div class="service-itemIcon ' + itemIcon + '" data-id="' + i + '" ><img style="width:100%;height:100%;" src="' + icon + '" title="BingMap">'
                    + '<div class="service-itemAttr"> <div class="service-itemBg"></div><div class="service-itemDes">' + item.name + '</div>'
                    + '<div class="service-itemUnSelected ' + itemService + ' "><span class="fa fa-check"></span></div></div></div><div class="service-itemLabel">' + item.name + '</div> </div>';
            }
            $("#baselayerWraper").html(inhtml);
        }

        $(".service-itemIcon").click(this.onThumbnailClk);
        $("#chkTerrain").click(this.onChkTerrain);

        $('#chkTerrain input[type="checkbox"]').prop('checked', this.viewer.mars.hasTerrain());
    },
    onThumbnailClk: function (evt) {
        if (evt && evt.preventDefault) {
            evt.preventDefault();
        }
        else {
            window.event.returnValue = false;
        }

        $(".service-itemIcon-selected").each(function () {
            $(this).removeClass('service-itemIcon-selected');
            $(this).find('.service-itemSelected').removeClass('service-itemSelected');
        });

        $(this).addClass('service-itemIcon-selected');
        $(this).find('.service-itemUnSelected').addClass('service-itemSelected');

        //隐藏图层控制
        mars3d.widget.disable('widgets/manageLayers/widget.js');

        var idx = parseInt($(this).attr('data-id'));

        var basemaps = toolBar.viewer.gisdata.config.basemaps;
        for (var i = 0; i < basemaps.length; i++) {
            var item = basemaps[i];
            if (item.type == "group" && item.layers == null) continue;

            if (idx == i)
                item._layer.setVisible(true);
            else
                item._layer.setVisible(false);
        }
        return false;
    },
    onChkTerrain: function (evt) {
        if (evt && evt.preventDefault) {
            evt.preventDefault();
        }
        else {
            window.event.returnValue = false;
        }
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
        }
        var isStkTerrain = chk[0].checked;
        toolBar.viewer.mars.updateTerrainProvider(isStkTerrain);

        $('#baseLayerBtn').removeClass('open');
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
        }

        else {
            window.event.cancelBubble = true;
        }
    },


    //=================设置=================
    bindSetting: function () {
        var scene = this.viewer.scene;
        $('#atomsphereRender input[type="checkbox"]').prop('checked', scene.skyAtmosphere.show);
        $("#atomsphereRender").click(this.onChkAtomsphere);

        $('#lightRender input[type="checkbox"]').prop('checked', scene.globe.enableLighting);
        $("#lightRender").click(this.onChkLight);

        //$('#fogEnabled input[type="checkbox"]').prop('checked', scene.fog.enabled);
        //$("#fogEnabled").click(this.onChkFogEnabled);

        $('#testTerrain input[type="checkbox"]').prop('checked', scene.globe.depthTestAgainstTerrain);
        $("#testTerrain").click(this.onChkTestTerrain);

        $("#firstPerson").click(this.onfirstPerson);
    },
    onChkAtomsphere: function (evt) {
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
            var visible = chk[0].checked;

            toolBar.viewer.scene.skyAtmosphere.show = visible;
            toolBar.viewer.scene.globe.showGroundAtmosphere = visible;

        }
        $(this).parent().removeClass('open');
    },

    onChkFogEnabled: function (evt) {
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
            var visible = chk[0].checked;

            toolBar.viewer.scene.fog.enabled = visible;
        }
        $(this).parent().removeClass('open');
    },
    onChkLight: function (evt) {
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
            var visible = chk[0].checked;

            toolBar.viewer.scene.globe.enableLighting = visible;
            toolBar.viewer.shadows = visible;
            toolBar.viewer.terrainShadows = visible ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.RECEIVE_ONLY;
        }
        $(this).parent().removeClass('open');
    },
    onChkTestTerrain: function (evt) {
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
            var visible = chk[0].checked;

            toolBar.viewer.scene.globe.depthTestAgainstTerrain = visible;
            if (visible) {
                toastr.info("深度监测打开后，您将无法看到地下或被地形遮挡的对象。");
            }
        }
        $(this).parent().removeClass('open');
    },
    onfirstPerson: function (evt) {
        var chk = $(evt.target).prev();
        if (chk && chk[0]) {
            chk[0].checked = !chk[0].checked;
            var visible = chk[0].checked;

            toolBar.viewer.mars.keyboard(visible);
            if (visible) {
                toastr.info("您可以键盘按A S D W Q E和上下左右键控制方向。");
            }
        }
        $(this).parent().removeClass('open');
    },



}));
