//此方式：弹窗非iframe模式
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        resources: ['view.css'],
        view: [
            { type: "append", url: "view.html", parent: '#centerDiv' }
        ],
    },
    //初始化[仅执行1次]
    create: function () {

    },
    //每个窗口创建完成后调用
    winCreateOK: function (viewopt, html) {
        if (viewopt.type != "append") return;

        if (this.config.style)
            $(".toolBarRight").css(this.config.style);

        var widgetObj = {};
        var that = this;

        var inhtml = "";
        var arr = this.config.data;
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if (item.hasOwnProperty("visible") && !item.visible) continue;
            if (item.children) { //分组

                inhtml += '<div class="btn-group">\
                                <button type="button" class="btn btn-link toolBarRight-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">\
                                    <i class="' + item.icon + '"></i>' + item.name + ' <span class="caret"></span>\
                                </button>\
                                <ul class="dropdown-menu dropdown-menu-right toolBarRight-dropdown-menu" style="min-width: 110px;">';
                for (var j = 0, jlen = item.children.length; j < jlen; j++) {
                    var children_item = item.children[j];
                    if (children_item.hasOwnProperty("visible") && !children_item.visible) continue;

                    var ex = "";
                    if (children_item.onclick)
                        ex = 'onclick="' + children_item.onclick + '"';
                    else if (children_item.widget)
                        ex = 'data-widget="' + children_item.widget + '"';

                    inhtml += '<li class="widget-btn" ' + ex + '><a href="javascript:void(0)"><i class="' + children_item.icon + '"></i>' + children_item.name + '</a></li>';
                    widgetObj[children_item.widget] = children_item;
                }
                inhtml += ' </ul></div>';
            }
            else {//不是分组
                var ex = "";
                if (item.onclick)
                    ex = 'onclick="' + item.onclick + '"';
                else if (item.widget)
                    ex = 'data-widget="' + item.widget + '"';

                inhtml += '<button type="button" class="widget-btn btn btn-link toolBarRight-btn " ' + ex + '>\
                            <i class="' + item.icon + '"></i>' + item.name + '\
                        </button>';
                widgetObj[item.widget] = item;
            }
        }
        $(".toolBarRight").html(inhtml);


        $(".toolBarRight .widget-btn").click(function () {
            var uri = $(this).attr('data-widget');
            if (haoutil.isutil.isNull(uri)) return;

            console.log('单击了工具栏：' + uri);

            if (mars3d.widget.isActivate(uri)) {
                mars3d.widget.disable(uri);
            }
            else {
                var name1 = $(this).attr('data-name');
                var name2 = $(this).html().replace('<a href="javascript:void(0)">', '').replace('</a>', ''); //会覆盖config中配置的名称

                var opt = widgetObj[uri] || {};
                opt.uri = uri;
                opt.name = name1 || name2;

                mars3d.widget.activate(opt);
            }
        });
    },
    //激活插件
    activate: function () {


    },
    //释放插件
    disable: function () {

    },


}));
