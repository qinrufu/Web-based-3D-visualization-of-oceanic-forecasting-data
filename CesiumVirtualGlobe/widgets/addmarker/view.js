var thisWidget;
var $table;

function getHeight() {
    return $(window).height() - 40;
}


//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    plotFile.initEvent();

    $("#btn_marker_Add").bind('click', function () {
        thisWidget.drawPoint();
    });

    //清除所有标号
    $("#btn_plot_delall").click(function () {
        thisWidget.deleteAll();
        refMarkerList();
    });

    //是否可以编辑
    var isedit = true;
    $("#btn_plot_isedit").click(function () {
        isedit = !isedit;

        if (isedit) {
            $(this).removeClass("active");
            $(this).children().removeClass("fa-lock").addClass("fa-unlock");
        }
        else {
            $(this).addClass("active");
            $(this).children().removeClass("fa-unlock").addClass("fa-lock");
        }
        thisWidget.hasEdit(isedit);
    });

    $table = $('#table');
    $table.bootstrapTable({
        height: getHeight(),
        singleSelect: true, //单选
        pagination: false,
        pageSize: 6,
        iconsPrefix: 'fa',
        columns: [
                {
                    field: 'name',
                    title: '名称',
                    sortable: true,
                    editable: false,
                    align: 'left'
                }, {
                    field: 'operate',
                    title: '操作',
                    align: 'center',
                    width: 50,
                    events: {
                        'click .remove': function (e, value, row, index) {
                            thisWidget.deleteEditFeature(row.id);
                        }
                    },
                    formatter: function (value, row, index) {
                        return [
                            '<a class="remove" href="javascript:void(0)" title="删除">',
                            '<i class="fa fa-trash"></i>',
                            '</a>'
                        ].join('');
                    }
                }
        ],
        onClickRow: function (rowData, $element, field) {
            thisWidget.centerAt(rowData.id);
        }
    });
    $(window).resize(function () {
        $table.bootstrapTable('refreshOptions', {
            height: getHeight()
        });
    });
    refMarkerList();
}


function refMarkerList() {
    var arr = thisWidget.getMarkerDataList();
    $table.bootstrapTable("load", arr);
}


//文件处理
var plotFile = {
    initEvent: function () {
        var that = this;

        var isClearForOpenFile;
        $("#btn_plot_openfile").click(function () {
            isClearForOpenFile = true;
            $("#input_plot_file").click();
        });

        $("#btn_plot_openfile2").click(function () {
            isClearForOpenFile = false;
            $("#input_plot_file").click();
        });
        $("#btn_plot_savefile").click(function () {
            var data = thisWidget.getJsonData();
            if (data == null || data == "") {
                toastr.error("当前未标记任何数据！");
            } else {
                haoutil.file.downloadFile("我的标记点.json", data);
            }
        });

        $("#input_plot_file").change(function (e) {
            var file = this.files[0];

            var fileName = file.name;
            var fileType = (fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)).toLowerCase();
            if (fileType != "json") {
                toastr.error('文件类型不合法,请选择json格式标注文件！');
                that.clearPlotFile();
                return;
            }


            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onloadend = function (e) {
                    var strjson = this.result;
                    thisWidget.jsonToLayer(strjson, isClearForOpenFile);
                    that.clearPlotFile();
                };
            }
        });
    },
    clearPlotFile: function () {
        if (!window.addEventListener) {
            document.getElementById('input_plot_file').outerHTML += '';  //IE
        } else {
            document.getElementById('input_plot_file').value = "";   //FF
        }
    }
};
