
var thisWidget;

//当前页面业务  
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

  
    plotEdit.loadConfig();
}


function changeOpenShowHide() {
    var openlis = $(this).siblings();
    var opent = $(this).children('.tree_icon');
    openlis.toggle();
    if (openlis.is(":hidden")) {
        opent.html('+');
    } else {
        opent.html('-');
    }
}

 
//属性编辑相关 
var plotEdit = { 
    config: null, 
    loadConfig: function () {
        var that = this;
        $.getJSON("config/attr.json", function (data) {
            that.config = data; 

            if (that._last_attr)
                that.startEditing(that._last_attr);
        });
    },
    _last_attr: null,
    //选中标号，激活属性面板
    startEditing: function (attr) {
        this._last_attr = attr || {};
        if (this.config == null) return;
  
        var arrFun = [];
        var inHtml = '';
        
        //==============style==================
        for (var i = 0; i < this.config.length; i++) {
            var config = this.config[i];
            inHtml += '<div> <div class="open" > <i class="tree_icon">-</i>'+ config.lable+'</div >  <div class="mp_attr"><table>';

            var parname = config.name; 
            var parattr = this._last_attr[parname] || {};

            for (var idx = 0; idx < config.list.length; idx++) {
                var edit = config.list[idx];
                if (edit.type == "hidden") continue;

                var attrName = edit.name;
                var attrVal = parattr[attrName];

                var input = this.getAttrInput(parname, attrName, attrVal, edit);
                if (input.fun)
                    arrFun.push({ parname: parname, name: attrName, value: attrVal, edit: edit, fun: input.fun });

                inHtml += '<tr  id="' + parname + 'tr_' + attrName + '" > <td class="nametd">'
                    + edit.label + '</td>  <td>' + input.html + '</td>  </tr>';
            }
            inHtml += '</table></div></div>';
        } 
    
        $("#attrView").html(inHtml); 
        $('.open').click(changeOpenShowHide);

        //执行各方法
        for (var idx = 0; idx < arrFun.length; idx++) {
            var item = arrFun[idx];
            item.fun(item.parname, item.name, item.value, item.edit);
        } 
    }, 
    //单击地图空白，释放属性面板
    stopEditing: function () {  
        $("#attrView").html(''); 
    },
    //获取各属性的编辑html和change方法
    getAttrInput: function (parname, attrName, attrVal, edit) {
        if (attrVal == null || attrVal == undefined)
            attrVal = "";

        var that = this;

        var inHtml = '';
        var fun = null;
        switch (edit.type) {
            default:
            case "label":
                inHtml = attrVal;
                break;
            case "text":
                inHtml = '<input id="' + parname + attrName + '" type="text" value="' + attrVal + '"   class="mp_input" />';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = $(this).val();
                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
            case "textarea":
                attrVal = attrVal.replace(new RegExp("<br />", "gm"), "\n");
                inHtml = '<textarea  id="' + parname + attrName + '"     class="mp_input" style="height:50px;resize: none;" >' + attrVal + '</textarea>';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = $(this).val();
                        if (attrVal.length == 0) attrVal = "文字";
                        attrVal = attrVal.replace(/\n/g, "<br />");

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
            case "number":
                inHtml = '<input id="' + parname + attrName + '" type="number" value="' + attrVal + '"    class="mp_input"/>';
                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = Number($(this).val());

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;

            case "combobox":
                inHtml = '<select id="' + parname + attrName + '" class="mp_select"    data-value="' + attrVal + '" >';
                for (var jj = 0; jj < edit.data.length; jj++) {
                    var temp = edit.data[jj];
                    inHtml += '<option value="' + temp.value + '">' + temp.text + '</option>';
                }
                inHtml += '</select>';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).select();   //绑定样式
                    $('#' + parname + attrName).change(function () {
                        var attrVal = $(this).attr('data-value');

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;

            case "radio":
                var _name_key = parname + attrName;
                inHtml = '  <div class="radio radio-info radio-inline">\
                                <input type="radio" id="' + _name_key + '_1" value="1"  name="' + _name_key + '"  ' + (attrVal ? 'checked="checked"' : '') + '>\
                                <label for="' + _name_key + '_1"> 是</label>\
                            </div>\
                            <div class="radio radio-info radio-inline">\
                                <input type="radio" id="' + _name_key + '_2" value="2" name="' + _name_key + '" ' + (attrVal ? '' : 'checked="checked"') + ' ">\
                                <label for="' + _name_key + '_2"> 否 </label>\
                            </div>';

                fun = function (parname, attrName, attrVal, edit) {
                    $('input:radio[name="' + parname + attrName + '"]').change(function () {
                        var attrVal = $(this).val() == "1";
                        that.updateAttr(parname, attrName, attrVal);

                        that.changeViewByAttr(parname, edit.impact, attrVal);
                    });
                    that.changeViewByAttr(parname, edit.impact, attrVal);
                };
                break;
            case "color":
                inHtml = '<input id="' + parname + attrName + '"  class="mp_input" style="width: 100%;"  value="' + attrVal + '" />';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).minicolors({
                        position: "bottom right",
                        control: "saturation",
                        change: function (hex, opacity) {
                            that.updateAttr(parname, attrName, hex);
                        }
                    });
                };
                break;
            case "slider":
                inHtml = '<input id="' + parname + attrName + '"  type="text" value="' + (attrVal * 100) + '" />';
                fun = function (parname, attrName, attrVal, edit) {
                    var _width = $('.mp_tree').width() * 0.7 - 10;
                    $('#' + parname + attrName).progress(_width);   //绑定样式 
                    $('#' + parname + attrName).change(function () {
                        var attrVal = Number($(this).val()) / 100;

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
            case "window":
                inHtml = '<input id="' + parname + attrName + '" type="text" value="' + attrVal + '" readonly   class="mp_input" />';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("click", function (e) {

                        thisWidget.showEditAttrWindow({
                            data: that._last_attr,
                            parname: parname,
                            attrName: attrName,
                            attrVal: attrVal
                        });

                    });

                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = $(this).val();
                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
        }
        return { html: inHtml, fun: fun };
    },
    //联动属性控制
    changeViewByAttr: function (parname, arrimpact, visible) {
        if (arrimpact && arrimpact.length > 0) {
            for (var jj = 0; jj < arrimpact.length; jj++) {
                var attrName = arrimpact[jj];
                if (visible) {
                    $('#' + parname + 'tr_' + attrName).show();
                }
                else {
                    $('#' + parname + 'tr_' + attrName).hide();
                }
            }
        }
    },
    //属性面板值修改后触发此方法
    updateAttr: function (parname, attrName, attrVal) {
        this._last_attr[parname] = this._last_attr[parname] || {};
        this._last_attr[parname][attrName] = attrVal;

        thisWidget.updateAttr2map(this._last_attr);
    }

};





(function ($) {
    //下拉菜单默认参数
    var defaluts = {
        select: "mp_select",
        select_text: "mp_select_text",
        select_ul: "mp_select_ul"
    };

    $.fn.extend({
        // 下拉菜单
        "select": function (options) {
            var opts = $.extend({}, defaluts, options);
            return this.each(function () {
                var that = $(this);
                //模拟下拉列表
                if (that.data("value") !== undefined && that.data("value") !== '') {
                    that.val(that.data("value"));
                }
                var _html = [];
                _html.push("<div class=\"" + that.attr('class') + "\">");
                _html.push("<div class=\"" + opts.select_text + "\">" + that.find(":selected").text() + "</div>");
                _html.push("<ul class=\"" + opts.select_ul + "\">");
                that.children("option").each(function () {
                    var option = $(this);
                    if (that.data("value") == option.val()) {
                        _html.push("<li data-value=\"" + option.val() + "\">" + option.text() + "</li>");
                    } else {
                        _html.push("<li data-value=\"" + option.val() + "\">" + option.text() + "</li>");
                    }
                });
                _html.push("</ul>");
                _html.push("</div>");
                var select = $(_html.join(""));
                var select_text = select.find("." + opts.select_text);
                var select_ul = select.find("." + opts.select_ul);
                that.after(select);
                that.hide();
                //下拉列表操作
                select.click(function (event) {
                    $(this).toggleClass('mp_selected');
                    $(this).find("." + opts.select_ul).slideToggle().end().siblings("div." + opts.select).find("." + opts.select_ul).slideUp();
                    event.stopPropagation();
                });
                $("body").click(function () {
                    select_ul.slideUp();
                });
                select_ul.on("click", "li", function () {
                    var li = $(this);
                    var val = li.addClass("selecton").siblings("li").removeClass("selecton").end().data("value").toString();
                    if (val !== that.attr("data-value")) {
                        select_text.text(li.text());
                        that.attr("data-value", val);
                        that.change();
                    }
                });
            });
        },
        // 复选框
        "checkbox": function () {
            return this.each(function () {
                var that = $(this);
                var $input = that.siblings("input");
                if ($input.prop("disabled") == true) {
                    that.addClass("pnui-check-disbaled");
                } else if ($input.prop("checked") == true) {
                    that.addClass("pnui-checked");
                } else {
                    that.removeClass("pnui-checked");
                }
                that.on("click", function () {
                    if ($input.prop("disabled") == true) {
                        return false;
                    } else if (that.hasClass("pnui-checked")) {
                        $input.removeAttr("checked");
                        that.removeClass("pnui-checked");
                    } else {
                        $input.attr("checked", "checked");
                        that.addClass("pnui-checked");
                    }
                });
                $(".checkall").click(function () {
                    var that = $(this);
                    var $checkallbox = that.parents('.checkallbox');
                    var $checkchild = $checkallbox.find(".pnui-chkbox");
                    that.toggleClass("pnui-checked");
                    $checkchild.each(function () {
                        $(this).toggleClass("pnui-checked");
                    });
                    if (that.hasClass("pnui-checked")) {
                        $checkchild.siblings("input").attr("checked", "checked");
                        $checkchild.addClass("pnui-checked");
                    } else {
                        $checkchild.siblings("input").removeAttr("checked");
                        $checkchild.removeClass("pnui-checked");
                    }
                });
            });
        },
        // 单选框
        "radio": function () {
            return this.each(function () {
                var that = $(this);
                if (that.children("input").prop("disabled") == true) {
                    that.children(".pnui-rdobox").removeClass().addClass("pnui-rdobox pnui-radio-disbaled");
                } else if (that.children("input").prop("checked") == true) {
                    that.siblings().children('input').removeAttr("checked");
                    that.siblings().children(".pnui-rdobox").removeClass("pnui-checked");
                    that.children(".pnui-rdobox").addClass("pnui-checked");
                } else {
                    that.siblings().children('input').prop("checked", "checked");
                    that.siblings().children(".pnui-rdobox").addClass("pnui-checked");
                    that.children(".pnui-rdobox").removeClass("pnui-checked");
                }
                that.on("click", function () {
                    var that = $(this);
                    if (that.children("input").prop("disabled") == true) {
                        return false;
                    } else if (that.children("input").prop("checked") == true) {
                        that.siblings().children('input').prop("checked", "checked");
                        that.siblings().children(".pnui-rdobox").addClass("pnui-checked");
                        that.children("input").removeAttr("checked");
                        that.children(".pnui-rdobox").removeClass("pnui-checked");
                    } else {
                        that.siblings().children('input').removeAttr("checked");
                        that.siblings().children(".pnui-rdobox").removeClass("pnui-checked");
                        that.children("input").prop("checked", "checked");
                        that.children(".pnui-rdobox").addClass("pnui-checked");
                    }
                });
            });
        },
        //滑动条 
        progress: function (max) {
            var opts = {
                progress: "puiprogress",
                progress_bg: "puiprogress_bg",
                progress_btn: "puiprogress_btn",
                progress_bar: "puiprogress_bar",
                progress_text: "puiprogress_text"
            };
            return this.each(function () {
                var that = $(this);
                //模拟进度条
                var _html = [];
                _html.push("<div class=\"" + opts.progress + "\">");
                _html.push("<div class=\"" + opts.progress_bg + "\">");
                _html.push("<div class=\"" + opts.progress_bar + "\">" + "</div>");
                _html.push("</div>");
                _html.push("<div class=\"" + opts.progress_btn + "\">" + "</div>");
                _html.push("<div class=\"" + opts.progress_text + "\">" + that.val() + "%</div>");
                _html.push("</div>");
                var pro = $(_html.join(""));
                var progress_bg = pro.find("." + opts.progress_bg);
                var progress_btn = pro.find("." + opts.progress_btn);
                var progress_bar = pro.find("." + opts.progress_bar);
                var progress_text = pro.find("." + opts.progress_text);
                that.after(pro);
                that.hide();
                //进度条操作
                var tag = false, ox = 0, left = 0, bgleft = 0;
                pro.css('width', max);

                var _val = Number(that.val());
                left = max * _val / 100;
                progress_btn.css('left', left);
                progress_bar.width(left);
                progress_text.html(parseInt(_val) + '%');

                progress_btn.mousedown(function (e) {
                    ox = e.pageX - left;
                    tag = true;
                });
                $(document).mouseup(function () {
                    tag = false;
                });
                pro.mousemove(function (e) {//鼠标移动
                    if (tag) {
                        left = e.pageX - ox;
                        if (left <= 0) {
                            left = 0;
                        } else if (left > max) {
                            left = max;
                        }
                        progress_btn.css('left', left);
                        progress_bar.width(left);
                        var _val = parseInt((left / max) * 100);
                        progress_text.html(_val + '%');

                        that.val(_val);
                        that.change();
                    }
                });
                progress_bg.click(function (e) {//鼠标点击
                    if (!tag) {
                        bgleft = progress_bg.offset().left;
                        left = e.pageX - bgleft;
                        if (left <= 0) {
                            left = 0;
                        } else if (left > max) {
                            left = max;
                        }
                        progress_btn.css('left', left);
                        progress_bar.animate({ width: left }, max);
                        var _val = parseInt((left / max) * 100);
                        progress_text.html(_val + '%');

                        that.val(_val);
                        that.change();
                    }
                });

            });
        }


    });
})(jQuery);

