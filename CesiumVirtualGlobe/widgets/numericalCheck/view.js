var thisWidget;
var myCheckNumerical;//图表

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }
    myCheckNumerical = echarts.init(document.getElementById('echartsViewNumericalCheck'), 'dark');
    setEchartsData(thisWidget.data);

}


//动力预报时序图 图表
function setEchartsData(charsData) {
    if (charsData == null || myCheckNumerical == null) return;
    var url = baseUrlConfig.baseUrl + "numerical/checkNumerical/" + charsData.currentType + "/"
        + charsData.platType + "/" + charsData.id + "/" + charsData.date + "/" + charsData.num;
    $.get(url, function (res) {
        drawChart(charsData.currentType, charsData.platType, res)
    })
}

function drawChart(type, platType, data) {
    switch (type) {
        case "温度":
        case "温度平均":
            var numerical = data.numerical;
            var xAxis = [];
            var numericalData = []
            var realData = []
            numerical.forEach(function (item) {
                xAxis.push(moment(item.date).format("YYYY-MM-DD HH:mm:ss"));
                numericalData.push([moment(item.date).format("YYYY-MM-DD HH:mm:ss"), item.value])
            })
            if (platType == "yw") {
                data.realData.forEach(function (item) {
                    xAxis.push(moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"));
                    realData.push([moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"), item.temperature]);
                });
            } else if (platType == "fb") {
                data.realData.forEach(function (item) {
                    xAxis.push(moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"));
                    realData.push([moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"), item.ctdtemperature]);
                });
            }
            xAxis.sort(function (a, b) { return b < a ? 1 : -1 })
            var option = {

                backgroundColor: 'rgba(0,0,0,0.3)',
                title: {
                    text: '温度时序验证',
                },
                legend: {
                    data: ['预报值', '实测值'],
                    left: 500,
                    top: 15
                },
                grid: {
                    left: 10,
                    right: 10,
                    bottom: 10,
                    containLabel: true
                },
                toolbox: {
                  show: true,
                  top: 0,
                  feature: {
                    dataZoom: {
                      yAxisIndex: "none"
                    },
                    restore: {},
                    saveAsImage: {}
                  },
                  iconStyle: {
                    borderColor: "#fff"
                  }
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    type: 'category',
                    data: xAxis
                },
                yAxis: {
                    type: 'value',
                    min: 23,
					          max: 26
                    //scale: true
                },
                series: [{
                    name: '预报值',
                    data: numericalData,
                    type: 'line',
                    smooth: true,
                    connectNulls: true
                }, {
                    name: '实测值',
                    data: realData,
                    type: 'line',
					smooth: true,
                    connectNulls: true,
                    itemStyle: {
                        color: '#10A7DB'
                    }
                }]
            };
            myCheckNumerical.setOption(option);
            break;
        case "盐度":
        case "盐度平均":
            var numerical = data.numerical;
            var xAxis = [];
            var numericalData = []
            var realData = []
            numerical.forEach(function (item) {
                xAxis.push(moment(item.date).format("YYYY-MM-DD HH:mm:ss"));
                numericalData.push([moment(item.date).format("YYYY-MM-DD HH:mm:ss"), item.value])
            })
            if (platType == "yw") {
                data.realData.forEach(function (item) {
                    xAxis.push(moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"));
                    realData.push([moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"), item.salinity]);
                });
            } else if (platType == "fb") {
            }
            xAxis.sort(function (a, b) { return b < a ? 1 : -1 })

            var option = {
                title: {
                    text: '盐度时序验证',
                },
                grid: {
                    left: 10,
                    right: 10,
                    bottom: 10,
                    containLabel: true
                },
                legend: {
                    data: ['预报值', '实测值'],
                    left: 500,
                    top: 15
                },
				toolbox: {
                  show: true,
                  top: 0,
                  feature: {
                    dataZoom: {
                      yAxisIndex: "none"
                    },
                    restore: {},
                    saveAsImage: {}
                  },
                  iconStyle: {
                    borderColor: "#fff"
                  }
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    type: 'category',
                    data: xAxis
                },
                yAxis: {
                    type: 'value',
                   // scale: true
					min: 32,
					max :35
                },
                series: [{
                    name: '预报值',
                    data: numericalData,
                    type: 'line',
                    smooth: true,
                    connectNulls: true
                }, {
                    name: '实测值',
                    data: realData,
                    type: 'line',
					smooth: true,
                    connectNulls: true
                }]
            };
            myCheckNumerical.setOption(option);
            break;
        case "流场":
        case "流场平均":
            var numerical = data.numerical;
            var xAxis = [];
            var numericalData = []
            var realData = []
            numerical.forEach(function (item) {
                xAxis.push(moment(item.date).format("YYYY-MM-DD HH:mm:ss"));
                numericalData.push([moment(item.date).format("YYYY-MM-DD HH:mm:ss"), item.value])
            })
            if (platType == "jaqb" || platType == "jafb") {
                data.realData.forEach(function (item) {
                    xAxis.push(moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"));
                    realData.push([moment(item.time_stamp).format("YYYY-MM-DD HH:mm:ss"), item.surface_velocity]);
                });
            }
            xAxis.sort(function (a, b) { return b < a ? 1 : -1 })

            var option = {
                title: {
                    text: '流场时序验证',
                },
                legend: {
                    data: ['预报值', '实测值'],
                    right: 10,
                    top: 10
                },
                grid: {
                    left: 10,
                    right: 10,
                    bottom: 10,
                    containLabel: true
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    type: 'category',
                    data: xAxis
                },
                yAxis: {
                    type: 'value',
                    scale: true
                },
                series: [{
                    name: '预报值',
                    data: numericalData,
                    type: 'line',
                    smooth: true,
                    connectNulls: true
                }, {
                    name: '实测值',
                    data: realData,
                    type: 'line',
					smooth: true,
                    connectNulls: true
                }]
            };
            myCheckNumerical.setOption(option);
            break;
    }
}

