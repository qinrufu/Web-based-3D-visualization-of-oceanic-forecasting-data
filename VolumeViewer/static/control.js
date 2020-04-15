/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Yuzheng Zhou, Rufu Qin
 * @Date: 2019-09-30 10:20:14
 * @LastEditors: Rufu Qin
 * @LastEditTime: 2019-10-21 18:30:55
 */
// 页面初始化
// 定义一些全局变量
var current_tab = "temp";  // 当前所在的tab页面
var all_tabs = ['temp', 'salinity',  'current', 'current_xy', 'current_z', 'terrain'];
var current_cut_xyz = null;  // 当前在准备切哪个截面 x y z
var myPlot = null;  // 获取的画图对象
var trange = null;  // 计算得到的将要画图的数据的范围 温盐流
var srange = null;
var current_range = null;
var current_show_traceid = [all_tabs.indexOf('current')];
var is_current_zd_show = false;
var tdat = null; 
var sdat = null;

var current_dat = null;
var clr_bar_t = 'Jet', clr_bar_s = 'Jet', clr_bar_c = 'Jet', clr_bar_cxy = 'Jet', clr_bar_cz = 'Jet',  clr_bar_terrain = 'RdBu';
var current_base_path = '';
var current_files_path = '';
var dem_file_path = '';
var region = 'mjj';

// 定义一些配置信息
var base_path = 'http://localhost/XDA';  
var date_api_url = 'http://localhost:8088/numerical/datelist'; 


// 准备可供显示的的数据文件列表 包括日期选择器 以及各个tab下的file list  需要庄总的api支持
$.getJSON(date_api_url, function (date_data) {
    update_file_path_and_list("temp", tsc_dates[0], '0');
    update_file_path_and_list("current", tsc_dates[0], '0');
})

// 默认模型初始化
initialize_model();

// tab切换时的控制与记录当前的tab页面参数
$('a[data-toggle="tab"]').on('hide.bs.tab', function (e) {
    current_tab = e.relatedTarget.id.replace("-tab", ""); // 更新当前的tab页名称 为所有的其他相关控制做准备

    if (current_tab != "both") {
        // 控制slider的显示与否
        $(".slider").hide();

        // 控制切换 tab 页的时候，对应的可视化界面跟着变化
        Plotly.restyle('drawBox', { visible: false }, Array.from({ length: all_tabs.length - 1 }, (v, k) => k)); // 除开最后一个（地形）隐藏all_tabs中的所有
        if (current_tab == 'current') {
            Plotly.restyle('drawBox', { visible: true }, current_show_traceid.length > 1 ? current_show_traceid : current_show_traceid[0]);
            //  对 vcurrent的silder单独控制
            if (current_show_traceid.includes(all_tabs.indexOf('current_xy'))) {
                sorh_slider('vcurrent', true);
            }
        } else {
            Plotly.restyle('drawBox', { visible: true }, all_tabs.indexOf(current_tab));
        }

        // 控制checkbox的状态变化
        $(".data-show-control").prop("checked", false);
        $("#show-" + current_tab).prop("checked", true);


        sorh_slider(current_tab, true);
    }
})

// 体可视化选择，综合分析tab页 通过几个checkbox控制数据的显示与否
$(".data-show-control").change(function () {
    var control_layer = this.name;
    var show_layer = this.checked;
    $("#loading").show(1000, function () {
        if (control_layer == 'current') {
            Plotly.restyle('drawBox', { visible: show_layer }, current_show_traceid.length > 1 ? current_show_traceid : current_show_traceid[0]);
            if (current_show_traceid.includes(all_tabs.indexOf('current_xy'))) {
                sorh_slider('vcurrent', show_layer);
            }
        } else {
            Plotly.restyle('drawBox', { visible: show_layer }, all_tabs.indexOf(control_layer));
        }

        sorh_slider(control_layer, show_layer);
        show_loading(false);
    })
})

// 地形数据控制
$(".data-show-terrain").change(function () {
    var show_terrain = this.checked;
    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', { visible: show_terrain }, all_tabs.length - 1);
        Plotly.relayout('drawBox', { 'scene.annotations[0].visible': show_terrain }); // label的显示与否

        $(".data-show-terrain").prop("checked", show_terrain);
        // 控制slider的位置微调
        show_terrain ? $('.slider').css("right", "54px") : $('.slider').css("right", "52px");

        show_loading(false);
    })
})

// 日期选择， 更新起报时间的下拉选择及可用的文件列表。暂时先没有写更新可用的起报时刻，假定一天四个时刻都有00 06 12 18
$(".date-select-options").change(function () {
    // console.log($(this).val())
    // 更新可用起报时刻 todo

    // 更新可用文件列表
    update_file_path_and_list(current_tab, $("#" + current_tab + "-selected-date").val(), '0');
})

// 起报时间选择， 更新可用文件的下拉列表和路径
$(".start-pre-time").change(function () {
    // console.log($(this).val())
    update_file_path_and_list(current_tab, $("#" + current_tab + "-selected-date").val(), $(this).val());
})

// 根据选择的起报时间来更新下来选择的文件列表
function update_file_path_and_list(type = 'ts', date = '20190929', start = '0') {
    var url = '';
    var ele = '';
    switch (type) {
        case 'temp':
            // ts_files_path = base_path + region + '/dynamic/' + date + '/' + start + '/ts/3dview/';
            ts_files_path = base_path + '/dynamic/' + date + '/' + start + '/ts/3dview/';
            url = ts_files_path + 'files.json';
            ele = "#temp-selected-time";
            break;
        case 'salinity':
            // ts_files_path = base_path + region + '/dynamic/' + date + '/' + start + '/ts/3dview/';
            ts_files_path = base_path + '/dynamic/' + date + '/' + start + '/ts/3dview/';
            url = ts_files_path + 'files.json';
            ele = "#salinity-selected-time";
            break;
        case 'current':
            // current_files_path = base_path + region + '/dynamic/' + date + '/' + start + '/current/3dview/';
            current_files_path = base_path + '/dynamic/' + date + '/' + start + '/current/3dview/';
            url = current_files_path + 'files.json';
            ele = "#current-selected-time";
            break;
    }
    // console.log(type, url);
    $(ele).empty();
    $.getJSON(url, function (file_data) {
        // console.log(file_data);
        file_data.files.forEach(function (file_name) {
            if (file_name.includes('average')) {
                $(ele).append("<option value='" + file_name + "'>" + file_name.replace('.json', '') + "</option>");
            } else {
                $(ele).append("<option value='" + file_name + "'>" + file_name.substring(0, 4) + "-" + file_name.substring(4, 6) + "-" + file_name.substring(6, 8) + " " + file_name.substring(8, 10) + ":00</option>");
            }
        })
    })
}

// 初始化模型
function initialize_model() {
    var temp = {
        name: 'Temperature',
        x: [119],
        y: [19],
        z: [-1000],
        value: [15],
        visible: false,
        type: 'volume',
        colorbar: {
            len: 0.18,
            y: 0.82,
            yanchor: 'bottom',
            tickformat: '.4n',
            title: {
                text: 'Temp(℃)'
            }
        }
    };

    var salinity = {
        name: 'Salinity',
        x: [119],
        y: [19],
        z: [-1000],
        value: [15],
        visible: false,
        type: 'volume',
        colorbar: {
            len: 0.18,
            y: 0.64,
            yanchor: 'bottom',
            tickformat: '.4n',
            title: {
                text: 'Salinity'
            }
        }
    };

    var current = {
        name: 'Currents',
        x: [119],
        y: [19],
        z: [-1000],
        value: [15],
        visible: false,
        type: 'volume',
        // coloraxis: "coloraxis"
        colorscale: clr_bar_c,
        colorbar: {
            len: 0.18,
            y: 0.46,
            yanchor: 'bottom',
            tickformat: '.3n',
            title: {
                text: 'Current(m)'
            }
        }
    };

    var current_xy = {
        name: 'Currents (v)',
        x: [119],
        y: [19],
        z: [-1000],
        value: [15],
        visible: false,
        type: 'volume',
        // coloraxis: 'coloraxis'
        colorscale: clr_bar_cxy,
        colorbar: {
            len: 0.18,
            y: 0.28,
            yanchor: 'bottom',
            tickformat: '.2n',
            title: {
                text: 'Currents (v)'
            }
        }
    };

    var current_z = {
        name: 'Currents',
        x: [119],
        y: [19],
        z: [-1000],
        u: [1],
        v: [1],
        w: [15],
        visible: false,
        type: 'cone',
        // sizemode: 'absolute',
        sizeref: 0.06,  // 流速方向的锥体大小
        colorscale: clr_bar_cz,
        // colorscale: [[0, 'rgb(128,128,128)'], [1, 'rgb(128,128,128)']],
        showscale: false
    };


    var layout = {
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        scene: {
            aspectratio: {
                x: 1.7,
                y: 1.7,
                z: 0.6
            },
            xaxis: {
                color: "#fff",
                title: { text: 'Longitude （ X ）' }
            },
            yaxis: {
                color: "#fff",
                title: { text: 'Latitude （ Y ）' }
            },
            zaxis: {
                color: "#fff",
                title: { text: 'Depth （ Z ）' }
            },
            camera: {
                eye: { x: -1.25, y: -1.75, z: 1.25 }
            },
        }
    };

    var config = {
        locale: 'zh-CN',
        displaylogo: false,
        displayModeBar: false,
        responsive: true
    };

    dem_file_path = './static/' + region + '-dem.json';
    $.getJSON(dem_file_path, function (dem_data) {
        var terrain = {
            type: 'surface',
            name: 'Terrain',
            x: dem_data.lon,
            y: dem_data.lat,
            z: dem_data.value,
            colorscale: clr_bar_terrain,
            visible: true,
            contours: {
                x: { show: false },
                y: { show: false },
                z: {
                    show: true,
                    usecolormap: true,
                    highlightcolor: "#42f462",
                    project: { z: true }
                }
            },
            colorbar: {
                len: 0.1,
                y: 0,
                yanchor: 'bottom',
                title: {
                    text: 'Depth (m)'
                },
                tickformat: '.2s'
            }
        };

        Plotly.newPlot('drawBox', [temp, salinity,  current, current_xy, current_z, terrain], layout, config);
        myPlot = document.getElementById('drawBox');
        myPlot.on('plotly_click', my_click_handler); // 绑定单击事件

        $(".data-show-terrain").prop("checked", true);
        // $("#show-" + current_tab).prop("checked", true);
    })
}

// 处理在体上点击事件，进而选择剖面  
function my_click_handler(data) {
    // console.log(data);
    var sid = "#" + current_tab + "-selected";
    if (current_cut_xyz == null) {
        return;
    };

    var x = data.points[0].x, y = data.points[0].y, z = data.points[0].z;
    if (current_cut_xyz == 'x') { $(sid + "X").append("<option value='" + x + "'>" + x + "</option>"); };
    if (current_cut_xyz == 'y') { $(sid + "Y").append("<option value='" + y + "'>" + y + "</option>"); };
    if (current_cut_xyz == 'z') { $(sid + "Z").append("<option value='" + z + "'>" + z + "</option>"); };
    if (current_cut_xyz == 'a') { $(sid + "A").append("<option value='" + data.points[0].customdata[0] + "'>" + data.points[0].customdata[0] + "</option>"); };
}


// 根据选择的日期加载模型
function load_ts_model(type = "temp") {
    if ($("#" + type + "-selected-time").val() == null) {
        $('#' + type + '-model-btn').popover('show');
        setTimeout(function () {
            $('#' + type + '-model-btn').popover('hide')
        }, 1500)
        return;
    }

    show_loading(true);
    var url = ts_files_path + $("#" + type + "-selected-time").val();

    $.getJSON(url, function (raw_data) {
        // raw_data 为获取的原始数据
        draw_new_ts(data_prep_ts(raw_data, type), type);
        $("#show-" + type).prop("checked", true);

        show_loading(false);
    });
}

// 将更新的数据模型画出来
function draw_new_ts(dat, type = "temp") {
    var traceid = all_tabs.indexOf(type);
    var vrange = get_max_min(dat.v);

    var update = {
        x: [dat.x], // to apply an array as a value, you need to wrap it in an additional array.
        y: [dat.y],
        z: [dat.z],
        value: [dat.v],
        opacity: 0.5,
        // opacityscale: [[[0, 0], [0.0009, 0.5], [0.001, 0.5], [1, 0.5]]],
        colorscale: type == "temp" ? clr_bar_t : clr_bar_s,
        cmin: vrange.vmin,
        cmax: vrange.vmax,
        isomin: vrange.vmin,
        isomax: vrange.vmax,
        // surface: { show: true, count: 6 }, //是否显示等值面
        visible: true
    };

    Plotly.restyle('drawBox', update, traceid);

    if (type == "temp") {
        tdat = dat;
        trange = vrange;

        init_slider(type, trange)
    } else {
        sdat = dat;
        srange = vrange;

        init_slider(type, srange)
    }
}

// 查看剖面
function draw_tsPM(tab = "temp") {
    // show_loading(true);
    var tsdat = tab == "temp" ? tdat : sdat;
    var vPMMax = 0, vPMMin = 999;
    var selectedJD = [], selectedWD = [], selectedDepth = [];
    var traceid = all_tabs.indexOf(tab);

    // 获取选择要显示的剖面数列
    selectedJD = get_option_list("#" + tab + "-selectedX");
    selectedWD = get_option_list("#" + tab + "-selectedY");
    selectedDepth = get_option_list("#" + tab + "-selectedZ");

    // 根据选取的剖面获取这些剖面的最大最小值
    tsdat.v.forEach(function (val, index) {
        if (selectedJD.includes(tsdat.x[index]) || selectedWD.includes(tsdat.y[index]) || selectedDepth.includes(tsdat.z[index])) {
            if (vPMMax < val) {
                vPMMax = val;
            };
            if (val > 0 && vPMMin > val) {
                vPMMin = val;
            }
        }
    });
    vPMMin = Math.round(vPMMin);
    vPMMax = Math.ceil(vPMMax);

    // console.log(selectedJD, selectedWD, selectedDepth, vPMMin, vPMMax);

    var update = {
        cmin: vPMMin,
        cmax: vPMMax,
        surface: { show: false },
        slices: {
            x: {
                show: selectedJD.length > 0 ? true : false,
                locations: selectedJD
            },
            y: {
                show: selectedWD.length > 0 ? true : false,
                locations: selectedWD
            },
            z: {
                show: selectedDepth.length > 0 ? true : false,
                locations: selectedDepth
            }
        },
        caps: {
            x: {
                show: false
            },
            y: {
                show: false
            },
            z: {
                show: false
            }
        }
    };
    Plotly.restyle('drawBox', update, traceid);

    // 将checkbox设置为false
    $("#" + tab + "-checkboxX").prop("checked", false);
    $("#" + tab + "-checkboxY").prop("checked", false);
    $("#" + tab + "-checkboxZ").prop("checked", false);

    init_slider(tab, { vmin: vPMMin, vmax: vPMMax });

    show_loading(false);
}

// 重新查看体可视化
function reset_ts(tab = "temp") {
    // show_loading(true);
    var traceid = all_tabs.indexOf(tab);
    var vrange = tab == "temp" ? trange : srange;

    var update = {
        cmin: vrange.vmin,
        cmax: vrange.vmax,
        isomin: vrange.vmin,
        isomax: vrange.vmax,
        surface: { show: true, count: 2 },
        slices: {
            x: {
                show: false
            },
            y: {
                show: false
            },
            z: {
                show: false
            }
        },
        caps: {
            x: {
                show: true
            },
            y: {
                show: true
            },
            z: {
                show: true
            }
        }
    };
    Plotly.restyle('drawBox', update, traceid);

    init_slider(tab, vrange)

    show_loading(false);
}

// 对ts原始数据预处理
function data_prep_ts(raw_data, type) {
    var dat = {
        x: raw_data.x.map(x => parseFloat(x.toFixed(3))),
        y: raw_data.y.map(x => parseFloat(x.toFixed(3))),
        z: raw_data.z,
        v: type == "temp" ? raw_data.T.map(t => t == -9999 ? null : t) : raw_data.S.map(s => s == -9999 ? null : s)
    };

    return dat;
}


// 根据选择的日期时间加载流速数据
function load_current_model() {
    if ($("#current-selected-time").val() == null) {
        $('#current-model-btn').popover('show');
        setTimeout(function () {
            $('#current-model-btn').popover('hide')
        }, 1500)
        return;
    }

    show_loading(true);
    var url = current_files_path + $("#current-selected-time").val();

    $.getJSON(url, function (raw_data) {
        // raw_data 为获取的原始数据
        current_dat = data_prep_current(raw_data);
        draw_new_current_volume(current_dat);
        show_loading(false);
    });
}

// 绘制流速的体数据
function draw_new_current_volume(dat) {
    var traceid = all_tabs.indexOf('current');
    var vrange = get_max_min(dat.w);

    var update = {
        x: [dat.x], // to apply an array as a value, you need to wrap it in an additional array.
        y: [dat.y],
        z: [dat.z],
        value: [dat.w],
        opacity: 0.5,
        cmin: vrange.vmin,
        cmax: vrange.vmax,
        isomin: vrange.vmin,
        isomax: vrange.vmax,
        visible: true
    };

    Plotly.restyle('drawBox', update, traceid);

    current_range = vrange;
    init_slider('current', vrange)
}

// 流速的体可视化恢复
function reset_current_volume() {
    // show_loading(true);
    var traceid = all_tabs.indexOf('current');
    var vrange = current_range;

    var update = {
        visible: true,
        cmin: vrange.vmin,
        cmax: vrange.vmax,
        isomin: vrange.vmin,
        isomax: vrange.vmax,
        surface: { show: true, count: 2 },
        slices: {
            x: {
                show: false
            },
            y: {
                show: false
            },
            z: {
                show: false
            }
        },
        caps: {
            x: {
                show: true
            },
            y: {
                show: true
            },
            z: {
                show: true
            }
        }
    };
    Plotly.restyle('drawBox', update, traceid);

    Plotly.restyle('drawBox', { visible: false }, [all_tabs.indexOf('current_xy'), all_tabs.indexOf('current_z')]);
    sorh_slider('vcurrent', false);

    current_show_traceid = [all_tabs.indexOf('current')];
    init_slider('current', vrange)
    show_loading(false);
}

// 流速方向剖面控制是否可视
$("#show-current-zd").change(function () {
    if (is_current_zd_show) {
        var show_czd = this.checked;
        $("#loading").show(1000, function () {
            Plotly.restyle('drawBox', { visible: show_czd }, all_tabs.indexOf('current_z'));
            $("#show-current-zd").prop("checked", show_czd);
            if (show_czd) {
                //保证current_show_traceid中有current_z
                current_show_traceid.push(all_tabs.indexOf('current_z'));
            } else {
                //保证current_show_traceid中没有current_z
                current_show_traceid.pop();
            }

            show_loading(false);
        })
    }
})

// 流速的画剖面函数
function draw_new_current_PM() {
    // show_loading(true);
    // 获取选择要显示的剖面数列
    var selectedJD = [], selectedWD = [], selectedDepth = [];
    selectedJD = get_option_list("#current-selectedX");
    selectedWD = get_option_list("#current-selectedY");
    selectedDepth = get_option_list("#current-selectedZ");

    // 维护当前需要显示的current族的traceid
    current_show_traceid = [all_tabs.indexOf('current')];
    is_current_zd_show = false;

    if (selectedJD.length + selectedWD.length > 0) {
        draw_new_current_xy(current_dat, selectedJD, selectedWD);
        current_show_traceid.push(all_tabs.indexOf('current_xy'));
    }

    if (selectedDepth.length > 0) {
        draw_new_current_z_d(get_data_from_z(current_dat, selectedDepth, 2)); // 2 代表隔一个数据抽一个
        draw_new_current_z_PM(selectedDepth);
        current_show_traceid.push(all_tabs.indexOf('current_z'));
        is_current_zd_show = true;
        $("#show-current-zd").prop("checked", true);
    } else {
        Plotly.restyle('drawBox', { visible: false }, all_tabs.indexOf('current'));
        current_show_traceid.shift();
    }

    show_loading(false);
}

// 绘制流速的xy剖面
function draw_new_current_xy(dat_with_null, selectedJD, selectedWD) {
    var traceid = all_tabs.indexOf('current_xy');
    var dat = {
        x: dat_with_null.x,
        y: dat_with_null.y,
        z: dat_with_null.z,
        v: dat_with_null.v.concat()
    }

    // 根据需要显示的剖面获取最大最小值
    var vPMMax = 0, vPMMin = 9999;
    dat.v.forEach(function (val, index) {
        if (selectedJD.includes(dat.x[index]) || selectedWD.includes(dat.y[index])) {
            if (vPMMax < val) {
                vPMMax = val;
            };
            if (val != null) {
                if (vPMMin > val) {
                    vPMMin = val;
                }
            } else {
                dat.v[index] = -999
            }
        }
    })

    var update = {
        x: [dat.x],
        y: [dat.y],
        z: [dat.z],
        value: [dat.v],
        visible: true,
        cmin: vPMMin,
        cmax: vPMMax,
        isomin: vPMMin,
        isomax: vPMMax,
        opacity: 0.5,
        surface: { show: false },
        slices: {
            x: {
                show: selectedJD.length > 0 ? true : false,
                locations: selectedJD
            },
            y: {
                show: selectedWD.length > 0 ? true : false,
                locations: selectedWD
            }
        },
        caps: {
            x: {
                show: false
            },
            y: {
                show: false
            },
            z: {
                show: false
            }
        }
    };

    Plotly.restyle('drawBox', update, traceid);

    init_slider('vcurrent', { vmax: vPMMax, vmin: vPMMin });
}

// 将更新的数据模型画出来
function draw_new_current_z_d(dat) {
    var traceid = all_tabs.indexOf('current_z'); // current层的id

    var update = {
        x: [dat.x], // to apply an array as a value, you need to wrap it in an additional array.
        y: [dat.y],
        z: [dat.z],
        u: [dat.u],
        v: [dat.v],
        w: [dat.w],
        opacity: 0.5,
        visible: true
    };

    Plotly.restyle('drawBox', update, traceid);
}

// 将更新的数据模型画出来  画面
function draw_new_current_z_PM(selectedDepth) {
    var traceid = all_tabs.indexOf('current'); // current层的id

    var update = {
        visible: true,
        surface: { show: false },
        slices: {
            z: {
                show: true,
                locations: selectedDepth
            }
        },
        caps: {
            x: {
                show: false
            },
            y: {
                show: false
            },
            z: {
                show: false
            }
        }
    };

    Plotly.restyle('drawBox', update, traceid);
}

// 根据选定的z来获取数据，用于画箭头
function get_data_from_z(dat, z_array, xygap = 2) {
    var res = {
        x: [],
        y: [],
        z: [],
        u: [],
        v: [],
        w: []
    };
    var tmpw = [];

    var needx = chouqu(dat.x, xygap), needy = chouqu(dat.y, xygap);

    for (let i = 0; i < dat.z.length; i++) {
        if (z_array.includes(dat.z[i]) && needx.includes(dat.x[i]) && needy.includes(dat.y[i])) {
            res.x.push(dat.x[i])
            res.y.push(dat.y[i])
            res.z.push(dat.z[i])
            res.u.push(dat.u[i])
            res.v.push(dat.v[i])
            tmpw.push(dat.w[i])
        }
    }

    // 更新当前所选剖面的区间
    var vrange = get_max_min(tmpw);
    init_slider('current', vrange)

    res.w = Array(res.x.length).fill(0);

    return res;
}

// 对xyz抽取数据，传入xyz和间隔，返回抽取后的结果
function chouqu(xyz, gap = 5) {
    var unique_xyz = Array.from(new Set(xyz));
    return unique_xyz.filter(function (ele, index) {
        return index % gap == 0
    })
}

// 对current原始数据预处理
function data_prep_current(raw_data) {
    var dat = {
        x: raw_data.x.map(x => parseFloat(x.toFixed(3))),
        y: raw_data.y.map(x => parseFloat(x.toFixed(3))),
        z: raw_data.z,
        u: raw_data.U.map(s => s == -9999 ? null : parseFloat(s.toFixed(3))),
        v: raw_data.V.map(s => s == -9999 ? null : parseFloat(s.toFixed(3))),
        w: raw_data.W.map(s => s == -9999 ? null : parseFloat(s.toFixed(3)))
    };

    return dat;
}


// 启用选择工具
function cut_select(type) {
    // 不同tab下禁用工具
    switch (current_tab) {
        case 'both':
            return;
            break;
        default:
            if (type == 'a') {
                return;
            }
            break;
    }

    $("body").css("cursor", "url('./static/" + type + ".ico'), crosshair");

    current_cut_xyz = type;
}

// 取消选择工具
function clc_select() {
    $("body").css("cursor", "auto");

    current_cut_xyz = null;
}

// 清空当前的剖面选择
function empty_select() {
    // 在声纳和综合分析tab禁用工具
    if (current_tab == 'both') {
        return;
    }

    clear_selectedPM(current_tab)
}

// 清空已选择的剖面，并将对应的checkbox置为未选中
function clear_selectedPM(tab = "temp") {
    var sid = "#" + tab + "-selected";
    $(sid + "X").empty();
    $(sid + "Y").empty();
    $(sid + "Z").empty();
    $(sid + "A").empty();

}

// 查看剖面
function view_select() {
    if (current_tab == 'both') {
        return;
    }

    $("#loading").show(1000, function () {
        switch (current_tab) {
            case "temp":
                draw_tsPM(current_tab)
                break;
            case "salinity":
                draw_tsPM(current_tab)
                break;
            case "current":
                draw_new_current_PM()
                break;
            default:
                // 禁用
                break;
        }
        clc_select()
    })
}

// 重回体可视化
function reset_select() {
    if (current_tab == 'both') {
        return;
    }

    $("#loading").show(1000, function () {
        switch (current_tab) {
            case "temp":
                reset_ts(current_tab)
                break;
            case "salinity":
                reset_ts(current_tab)
                break;
            case "current":
                reset_current_volume()
                break;

            default:
                // 禁用
                break;
        }
    })
}

/*
 滑块控制范围相关代码  滑块控制范围相关代码
 滑块控制范围相关代码  滑块控制范围相关代码
 滑块控制范围相关代码  滑块控制范围相关代码
 滑块控制范围相关代码  滑块控制范围相关代码
*/

// 色带上的调节按钮功能
var tempSlider = document.getElementById('slider-temp');
var saltSlider = document.getElementById('slider-salinity');
var currentSlider = document.getElementById('slider-current');
var vcurrentSlider = document.getElementById('slider-vcurrent');
var opacitySlider = document.getElementById('slider-opacity');
var vcurrentsizeSlider = document.getElementById('slider-vcurrent-size');

noUiSlider.create(tempSlider, {
    orientation: 'vertical',
    tooltips: [wNumb({ decimals: 2 }), wNumb({ decimals: 2 })],
    margin: 0.1,
    direction: 'rtl',
    start: [14.6, 15.4],
    range: {
        'min': [14],
        'max': [16]
    }
});

noUiSlider.create(saltSlider, {
    orientation: 'vertical',
    tooltips: [wNumb({ decimals: 2 }), wNumb({ decimals: 2 })],
    margin: 0.1,
    direction: 'rtl',
    start: [14.6, 15.4],
    range: {
        'min': [14],
        'max': [16]
    }
});

noUiSlider.create(currentSlider, {
    orientation: 'vertical',
    tooltips: [wNumb({ decimals: 2 }), wNumb({ decimals: 2 })],
    margin: 0.1,
    direction: 'rtl',
    start: [14.6, 15.4],
    range: {
        'min': [14],
        'max': [16]
    }
});

noUiSlider.create(vcurrentSlider, {
    orientation: 'vertical',
    tooltips: [wNumb({ decimals: 2 }), wNumb({ decimals: 2 })],
    margin: 0.1,
    direction: 'rtl',
    start: [14.6, 15.4],
    range: {
        'min': [14],
        'max': [16]
    }
});

noUiSlider.create(opacitySlider, {
    tooltips: [wNumb({ decimals: 2 })],
    start: [0.50],
    range: {
        'min': [0],
        'max': [1]
    }
});

noUiSlider.create(vcurrentsizeSlider, {
    tooltips: [wNumb({ decimals: 2 })],
    start: [0.06],
    range: {
        'min': [0.01],
        'max': [0.99]
    }
});


tempSlider.noUiSlider.on('change', function (values, handle) {
    slider_update_ts('temp', values)
    console.log(values)
});

saltSlider.noUiSlider.on('change', function (values, handle) {
    slider_update_ts('salinity', values)
    console.log(values)
});

// 流场根据色带调整可视区域 合速度
currentSlider.noUiSlider.on('change', function (values, handle) {
    // show_loading(true);
    var traceid = [all_tabs.indexOf('current'), all_tabs.indexOf('current_z')];

    var update = {
        isomin: parseFloat(values[0]),
        isomax: parseFloat(values[1])
    };

    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', update, traceid);
    })
    show_loading(false);
});

// 流场根据色带调整可视区域  v方向速度
vcurrentSlider.noUiSlider.on('change', function (values, handle) {
    // show_loading(true);
    var traceid = all_tabs.indexOf('current_xy');

    var update = {
        isomin: parseFloat(values[0]),
        isomax: parseFloat(values[1])
    };

    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', update, traceid);
    })
    show_loading(false);
});

// 调整透明度
opacitySlider.noUiSlider.on('change', function (values, handle) {
    // show_loading(true);
    // console.log(values)
    var traceid = '';
    var update = {
        opacity: parseFloat(values[0])
    };

    switch (current_tab) {
        case 'current':
            traceid = [all_tabs.indexOf('current'), all_tabs.indexOf('current_xy'), all_tabs.indexOf('current_z')]
            break;
        case 'both':
            traceid = Array.from({ length: all_tabs.length }, (v, k) => k)
            break;
        default:
            traceid = all_tabs.indexOf(current_tab)
            break;
    }

    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', update, traceid);
    })

    show_loading(false);
});

// 调整流速方向箭头的大小
vcurrentsizeSlider.noUiSlider.on('change', function (values, handle) {
    // show_loading(true);
    if (!$("#show-current-zd").prop('checked')) {
        return;
    }
    var traceid = all_tabs.indexOf('current_z');
    var update = {
        sizeref: parseFloat(values[0])
    };

    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', update, traceid);
    })
    show_loading(false);
    console.log(values)
});


// 初始化一下slider的范围
function init_slider(type, range) {
    var theSlider = '';
    switch (type) {
        case 'temp':
            theSlider = tempSlider
            break;
        case 'salinity':
            theSlider = saltSlider
            break;
        case 'current':
            theSlider = currentSlider
            break;
        case 'vcurrent':
            theSlider = vcurrentSlider
            break;
    }

    theSlider.noUiSlider.updateOptions({
        range: {
            'min': range.vmin,
            'max': range.vmax
        }
    });

    theSlider.noUiSlider.set([range.vmin, range.vmax])
    sorh_slider(type, true)
}

// 控制slider的显示与否
function sorh_slider(type = "temp", sorh) {
    var eid = "#slider-" + type;
    sorh ? $(eid).show() : $(eid).hide();
}

// silider控制的ts数据模型
function slider_update_ts(type = "temp", values) {
    // show_loading(true);
    var traceid = all_tabs.indexOf(type);

    var update = {
        isomin: parseFloat(values[0]),
        isomax: parseFloat(values[1])
    };

    $("#loading").show(1000, function () {
        Plotly.restyle('drawBox', update, traceid);
    })
    show_loading(false);
}

/*
 一些公用的辅助函数  一些公用的辅助函数
 一些公用的辅助函数  一些公用的辅助函数
 一些公用的辅助函数  一些公用的辅助函数
 一些公用的辅助函数  一些公用的辅助函数
*/

// 获取选择的option的值 为剖面可视化做准备
function get_option_list(eleid) {
    var locations = [];
    $(eleid + " option").each(function () {
        locations.push(parseFloat($(this).val()));
    });

    return locations;
}

// 是否显示loading
function show_loading(torf = false) {
    torf ? $("#loading").show(1000) : $("#loading").hide(1000);
}

// 阻塞进程 实现sleep
function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        continue;
    }
}

// 根据传入的数组获取最大最小值，为着色做准备
function get_max_min(val_array) {
    var vMin = 9999;
    var vMax = 0;
    val_array.forEach(function (val) {
        if (vMax < val) {
            vMax = val;
        };
        if (val != null && vMin > val) {
            vMin = val;
        }
    });

    if (vMin == 0) {
        vMin = 0.001
    }

    return { vmax: vMax, vmin: vMin };
}