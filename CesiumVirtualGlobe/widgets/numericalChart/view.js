var thisWidget;
var myChartNumerical;//图表

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    myChartNumerical = echarts.init(document.getElementById('echartsViewNumerical'), 'dark');
    setEchartsData(thisWidget.data);

}


//动力预报时序图 图表
function setEchartsData(charsData) {
    if (charsData == null || myChartNumerical == null) return;
    console.log(charsData)

    var url = baseUrlConfig.baseUrl + "numerical/" + charsData.loc + "/" + charsData.type + "/" + charsData.level + "/" + charsData.num + "/" + charsData.datetime;
    var baseMoment = charsData.datetime;
    var title = "";
    switch (charsData.type) {
        case "温度": title = "Temperature: "; break;
        case "温度平均": title = "温度"; break;
        case "盐度": title = "盐度"; break;
        case "盐度平均": title = "盐度"; break;
        case "流场": title = "流场"; break;
        case "流场平均": title = "流场"; break;
        case "水位": title = "水位"; break;
        case "水位平均": title = "水位"; break;
    }

    $.get(url, function (res) {

        var xAxisData = [];
        var yAxisData = [];

        res.forEach(element => {
            var tempDate = moment(baseMoment).add(element.date, 'hours').format('YYYY-MM-DD HH:mm:ss');
            xAxisData.push(tempDate)
            yAxisData.push(element.value);
        });
        var option = {
            backgroundColor: 'rgba(0,0,0,0.3)',
            title: {
                text: title + 'Time-Series ',
            },
            legend: {
                    
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
                data: xAxisData
            },
            yAxis: {
                type: 'value',
                scale: true
            },
            series: [{

                data: yAxisData,
                type: 'line',
                smooth: true,
                symbol: 'circle'
                
            }]
        };
        myChartNumerical.setOption(option);
    })


}

