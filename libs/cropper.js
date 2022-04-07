
var cropperLoaded=false;
var removeClip;
var cropperLoadTime = Date.now();
var cropperOpen = false;
var x1,x2,y1,y2;
var detectMouseMoveEvent;
var current,prev;
function loadCropper () {
		if (cropperLoaded) {
			return;
		}
		cropperLoaded=true;

		removeClip = function() {
			if (window.crop && window.crop.icons && Date.now() - cropperLoadTime > 1000 ) {
				removeClipInstant();
				cropperOpen = false;
			}
		};
		function removeClipInstant() {
			window.crop.icons.detach();
			$('#crop_helper').add('.crop_handle').remove();
			$(document).off('.removeCrop');
		}

		showCropOverFlow=function(x1,y1,x2,y2) {
			removeClipInstant();
		
			if (x1 < x2) {
				rx1 = x1;
				rx2 = x2;
			} else {
				rx1 = x2;
				rx2 = x1;
			}
			if (y1 < y2) {
				ry1 = y1;
				ry2 = y2;
			} else {
				ry1 = y2;
				ry2 = y1;
			}
			x1 = rx1;
			x2 = rx2;
			y1 = ry1;
			y2 = ry2;


			$('<div id=crop_helper><div id=crop_center class="selectedArea"></div><div id=crop_helper_bottom></div><div id=crop_helper_left></div><div id=crop_helper_top></div><div id=crop_helper_right></div></div>').appendTo(document.body);


			$('#crop_helper').css({
				// position:'absolute',
				// width:'100%',
				// height:'100%',
				// top:'0px',
				// left: -  ($(document).width() - $(document.body).width()) + 'px'
			})
			if (window.crop.move) $('#crop_helper').css('cursor', window.crop.move + '-resize');
			$('#crop_helper *').css({
				'background-color': 'black',
				'opacity': '0.5',
				'position': 'absolute',
				'z-index': 1000000000000
			});
			$('#crop_helper_left').css({
				'background-color': '000',
				left: 0,
				top: 0,
				width: x1,
				height: $(document).height()
			});
			$('#crop_helper_top').css({
				'background-color': '000',
				left: x1,
				top: 0,
				width: x2 - x1,
				height: y1
			});
			$('#crop_helper_bottom').css({
				'background-color': '000',
				left: x1,
				top: y2,
				width: x2 - x1,
				height: $(document).height() - y2
			});
			$('#crop_helper_right').css({
				'background-color': '000',
				left: x2,
				top: 0,
				width: $(document).width() - x2,
				height: $(document).height()
			});
			$('#crop_center').css({
				'background-color': 'black',
				cursor: 'crosshair',
				opacity:0.6,
				left: x1,
				top: y1,
				width: x2 - x1,
				height: y2 - y1
			});
			$('#crop_center').data('cord', {
				x1: x1,
				x2: x2,
				y1: y1,
				y2: y2
			});


			hw = 8
			e = $('<div class=crop_handle></div>').css({
				width: hw,
				height: hw,
				'background-color': 'white',
				position: 'absolute',
				'z-index': 1000000000001
			})
			obj = {
				'ne': {
					x: x2 - hw + 4,
					y: y1 - 4
				},
				'nw': {
					x: x1 - 4,
					y: y1 - 4
				},
				'se': {
					x: x2 - hw + 4,
					y: y2 - hw + 4
				},
				'sw': {
					x: x1 - 4,
					y: y2 - hw + 4
				},
				// 'n': {
				// 	x: x1 + (x2 - x1) / 2,
				// 	y: y1
				// },
				// 's': {
				// 	x: x1 + (x2 - x1) / 2,
				// 	y: y2 - hw
				// },
				// 'w': {
				// 	y: y1 + (y2 - y1) / 2,
				// 	x: x1
				// },
				// 'e': {
				// 	y: y1 + (y2 - y1) / 2,
				// 	x: x2 - hw
				// }
			};
			var icons = window.crop.icons;
			// icons.hide();
			icons.css({
				'z-index': 1000000000005,
				position: 'absolute'
			}).appendTo('#crop_helper')
			// .position({
			// 	my: 'right top',
			// 	at: 'right bottom+6',
			// 	of: $('#crop_center')
			// });
			position1 = {
				left: $('#crop_center').offset().left,
				top: $('#crop_center').offset().top + $('#crop_center').height() + 10,
				position: 'static'
			}
			position2 = {
				left: $('#crop_center').offset().left,
				top: $('#crop_center').offset().top - icons.height() - 10,
				position: 'static'
			}
			// console.log(icons.width())
			position3 = {
				left: ($(window).width() - icons.width()) / 2,
				top: 0,
				position: 'fixed'
			};
			position = position3
			icons.css({
				left: position.left,
				top: position.top,
				position: position.position
			})

			for (var i in obj)
				e.clone().data('cord', i).css({
					left: obj[i].x,
					top: obj[i].y,
					cursor: i + '-resize'
				}).appendTo( $('#crop_helper') );
		}
		$(document).on('keyup', function(e) {
			removeClip()
		});
		$(document).on('click', 'div[id*=crop_helper_]', function() {
			removeClip()
		})

		scrollOnMove=function(e) {
			if (e.pageY > document.body.scrollTop + $(window).height() - 30)
				document.body.scrollTop += 30
			if (e.pageY < document.body.scrollTop + 30)
				document.body.scrollTop -= 30
		}

		$(document).on('mousedown', '#crop_center', function(e) {
			$(document).on('mousemove.cropcenter', function(e) {
				if (window.crop.startX) {
					window.crop.x1 += e.pageX - window.crop.startX
					window.crop.x2 += e.pageX - window.crop.startX
					window.crop.y1 += e.pageY - window.crop.startY
					window.crop.y2 += e.pageY - window.crop.startY
				}
				showCropOverFlow(window.crop.x1,window.crop.y1,window.crop.x2,window.crop.y2);
				window.crop.startX = e.pageX
				window.crop.startY = e.pageY
				scrollOnMove(e);
				e.stopPropagation();
				return false
			})
			$(document).on('mouseup.cropcenter', function(e) {
				window.crop.startX = null
				window.crop.startY = null
				$(document).off('.cropcenter');
				e.stopPropagation();
				return false
			})
		})
		$(document).on('mousedown', '.crop_handle', function(e) {
			var lastScreenX, lastScreenY;
			scrollOnMove(e)
			$(document).on('mousemove.handle', {
				cord: $(e.target).data('cord')
			}, function(e) {
				if (lastScreenX) {
					var dirX = lastScreenX < e.screenX ? 'right' : 'left'
					var dirY = lastScreenY < e.screenY ? 'down' : 'up'
				}
				lastScreenX = e.screenX;
				lastScreenY = e.screenY;
				cord = e.data.cord
				if (cord == 'se') {
					window.crop.x2 = e.pageX;
					window.crop.y2 = e.pageY
				}
				if (cord == 'sw') {
					window.crop.x1 = e.pageX;
					window.crop.y2 = e.pageY
				}
				if (cord == 'nw') {
					window.crop.x1 = e.pageX;
					window.crop.y1 = e.pageY
				}
				if (cord == 'ne') {
					window.crop.x2 = e.pageX;
					window.crop.y1 = e.pageY
				}
				// if (cord == 'w') {
				// 	window.crop.x1 = e.pageX;
				// }
				// if (cord == 'e') {
				// 	window.crop.x2 = e.pageX;
				// }
				// if (cord == 'n') {
				// 	window.crop.y1 = e.pageY;
				// }
				// if (cord == 's') {
				// 	window.crop.y2 = e.pageY;
				// }
				window.crop.move = cord
				scrollOnMove(e)
				showCropOverFlow(window.crop.x1,window.crop.y1,window.crop.x2,window.crop.y2)
				e.stopPropagation();
				return;
			})
			$(document).on('mouseup.handle', function(e) {
				window.crop.move = null
			//	showCropOverFlow()
				$(document).off('.handle');
				e.stopPropagation();
				return false
			})
			e.stopPropagation();
			return false
		});
	
	
}

function load_cropper_without_selection(x1,y1,x2,y2,rect) {
	cropperOpen = false;
	loadCropper();
	if (cropperOpen) {
		return;
	}
	removeClip();
	cropperOpen = true;
	cropperLoadTime = Date.now();
	window.crop = rect || {
		x1:document.body.scrollLeft,
		x2:document.body.scrollLeft,
		y1:document.body.scrollTop,
		y2:document.body.scrollTop
	};

	$('html').css('position','inherit');
	
	var $toolbar = $('<div class="uniqueDivForCustomLoad"></div>');
    // var $button = $('<button />', {'class' : 'clickDragBtn'},{'tag':'open'});
    // var $buttonImg = $('<img />', {'id' : 'cropImage'});
    // $buttonImg.attr({'src': chrome.runtime.getURL("img/drag_icon.png")});
    // $buttonImg.appendTo($button);
  
    // $buttonSpan = $('<span>Click and drag area</span>');
    // $buttonSpan.appendTo($button);
	// $button.appendTo($toolbar);

	window.crop.icons = $toolbar;

	// plugins_to_show = defaultPlugins.slice();
	// plugins_to_show = $.grep(plugins_to_show, function(o) {
	// 	return (
	// 		// o.key!='openscreenshot' &&
	// 	o.key != 'googledrive'
	// 	)
	// })

	
	showCropOverFlow(x1,y1,x2,y2);
}


$(document).on('mousemove','body #crop_helper',function(e){
	x1=e.pageX;
	y1=e.pageY
	current = sessionStorage.getItem('current');
	prev = sessionStorage.getItem('prev');
	if(current) {
		if(current == 'mousemove' && prev == 'mouseup'){
		e.stopPropagation();
		return;
		}
	}
	else{
		showCropOverFlow(x1,y1,x2,y2);
		e.stopPropagation();
		sessionStorage.clear();
		return;
	}
});

$(document).on('mouseup','body .crop_handle',function(e){

	// validate the co-ordinates of the cropper
		if((x2-x1)!=0) {
			removeClip();
			if(x2 < x1){
				rx = x1;
				x1 = x2;
				x2 = rx;
			}
			if(y2 < y1) {
				ry = y1;
				y1 = y2;
				y2 = ry;
			}
				chrome.runtime.sendMessage({
					data: 'captureFullPage',
					showScrollBar: true,
					disableHeaderAndFooter: true,
					processFixedElements: false,
					cropData: {
						x1: x1,
						x2: x2,
						y1: y1,
						y2: y2,
						scrollTop: document.body.scrollTop,
						scrollLeft: document.body.scrollLeft
					}
				})
			// removing all dynamic div, events binded to div.
			$( '.custom-load-dynamic-for-crop' ).unbind('mousedown');
			$( '#crop_helper' ).unbind('mousemove');
			$( '.crop_handle' ).unbind('mouseup');
			$( '#crop_helper' ).remove();
			$( '.custom-load-dynamic-for-crop' ).remove();
	}
else{
			sessionStorage.setItem('current','mouseup');
			sessionStorage.setItem('prev','mousemove');
			$('#crop_center').remove();
			$('.crop_handle').remove();
			$( '#crop_helper' ).unbind('mousemove');
			$( '.crop_handle' ).unbind('mouseup');
}
});

$(document).on('mousedown','body #crop_helper',function(e){
	
	x1=e.pageX;
	y1=e.pageY;
	x2=x1;
	y2=y1;
	sessionStorage.clear();
	showCropOverFlow(x1,y1,x2,y2);
});