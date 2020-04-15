
$.fn.extend({
		//---元素拖动插件
    dragging:function(data){   
		var that = $(this);
		var xPage;
		var yPage;
		var X;//
		var Y;//
		var xRand = 0;//
		var yRand = 0;//
		var father = that.parent();
		var defaults = {
			move : 'both',
			randomPosition : true ,
			hander:1
		}
		var opt = $.extend({},defaults,data);
		var movePosition = opt.move;
		var random = opt.randomPosition;
		
		var hander = opt.hander;
		
		if(hander == 1){
			hander = that; 
		}else{
			hander = that.find(opt.hander);
		}
		
			
		//---初始化
		//father.css({"position":"relative","overflow":"hidden"});
		father.css({"position":"relative"});
		//that.css({"position":"absolute"});
		//hander.css({"cursor":"move"});
		that.find('*').not('img').mousedown(function(e) {
			e.stopPropagation();
		});

		var faWidth = father.width();
		var faHeight = father.height();
		var thisWidth = that.width()+parseInt(that.css('padding-left'))+parseInt(that.css('padding-right'))+parseInt(that.css('border-left-width'))+parseInt(that.css('border-right-width'));
		var thisHeight = that.height()+parseInt(that.css('padding-top'))+parseInt(that.css('padding-bottom'))+parseInt(that.css('border-top-width'))+parseInt(that.css('border-bottom-width'));
		
		var mDown = false;//
		var positionX;
		var positionY;
		var moveX ;
		var moveY ;
		
		/*if(random){
			$thisRandom();
		}
		function $thisRandom(){ //随机函数
			that.each(function(index){
				var randY = parseInt(Math.random()*(faHeight-thisHeight));///
				var randX = parseInt(Math.random()*(faWidth-thisWidth));///
				if(movePosition.toLowerCase() == 'x'){
					$(this).css({
						left:randX
					});
				}else if(movePosition.toLowerCase() == 'y'){
					$(this).css({
						top:randY
					});
				}else if(movePosition.toLowerCase() == 'both'){
					$(this).css({
						top:randY,
						left:randX
					});
				}
				
			});	
		}*/
		
		hander.mousedown(function(e){
			//father.children().css({"zIndex":"0"});
			//that.css({"zIndex":"1"});
			mDown = true;
			X = e.pageX;
			Y = e.pageY;
			positionX = that.position().left;
			positionY = that.position().top;
			return false;
		});
			
		$(document).mouseup(function(e){
			mDown = false;
		});
		
		$(document).mousemove(function(e){
			faWidth = father.width();
			faHeight = father.height();
			thisWidth = that.width()+parseInt(that.css('padding-left'))+parseInt(that.css('padding-right'))+parseInt(that.css('border-left-width'))+parseInt(that.css('border-right-width'));
			thisHeight = that.height()+parseInt(that.css('padding-top'))+parseInt(that.css('padding-bottom'))+parseInt(that.css('border-top-width'))+parseInt(that.css('border-bottom-width'));
			xPage = e.pageX;//--
			moveX = positionX+xPage-X;
			
			yPage = e.pageY;//--
			moveY = positionY+yPage-Y;
			
			function thisXMove(){ //x轴移动
				if(mDown == true){
					that.css({"left":moveX});
				}else{
					return;
				}
				if(moveX < 0){
					that.css({"left":"0"});
					return 0;
				}
				if(moveX > (faWidth-thisWidth)){
					that.css({"left":faWidth-thisWidth});	
					return 	faWidth-thisWidth;				
				}
				return moveX;
			}
			
			function thisYMove(){ //y轴移动
				if(mDown == true){
					that.css({"top":moveY});
				}else{
					return;
				}
				if(moveY < 0){
					that.css({"top":"0"});
				}
				if(moveY > (faHeight-thisHeight)){
					that.css({"top":faHeight-thisHeight});
				}
				return moveY;
			}

			function thisAllMove(){ //全部移动
				if(mDown == true){
					that.css({"left":moveX,"top":moveY});
				}else{
					return;
				}
				if(moveX < 0){
					that.css({"left":"0"});
				}
				if(moveX > (faWidth-thisWidth)){
					that.css({"left":faWidth-thisWidth});
				}

				if(moveY < 0){
					that.css({"top":"0"});
				}
				if(moveY > (faHeight-thisHeight)){
					that.css({"top":faHeight-thisHeight});
				}
			}
			if(movePosition.toLowerCase() == "x"){
				var _X = thisXMove();		
				if(_X && typeof opt.moveHandler == "function"){
					//opt.moveHandler(_X);
					opt.moveHandler.apply(hander,[_X]);
					//moveHandler.hander.apply(hander,)
				}
			}else if(movePosition.toLowerCase() == "y"){
				thisYMove();				
			}else if(movePosition.toLowerCase() == 'both'){
				thisAllMove();
			}
		});
    }
}); 