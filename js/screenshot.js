
var screenshot = {
	dummyFunction:function(data){
		chrome.tabs.getSelected(null,function(tab) { // null defaults to current window
			var title = tab.title;
			var url = tab.url;
			var description;
			if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
            }
		});
	},
	uploadExistingImage:function (data){
		screenshot.load(screenshot.addScreen);
        screenshot.createBrowserProperties();
		this.showPopup = true;
		return true;
	},
    captureVisible: function (data) {
        screenshot = {
            ...screenshot, ...{
                scroll: false,
                cropData: null,
                retries: 0,
                showScrollBar: true,
                processFixedElements: false
            }, ...data
}
        localStorage['captureWithoutScroll']++;
        screenshot.load(screenshot.addScreen);
        screenshot.createBrowserProperties();
		this.showPopup = false;
		return true;
    },
    captureAll: function (data) {
        $.extend(screenshot, {
            scroll: true,
            cropData: null,
            retries: 0,
            showScrollBar: false,
            processFixedElements: true
        }, data);
        localStorage['captureWithScroll']++;
        screenshot.load(screenshot.addScreen);
        screenshot.createBrowserProperties();
		this.showPopup = false;
		return true;
    },
    captureRegion:function() {
        console.log('captureRegion');
		this.showPopup = false;
        screenshot.tryGetUrl(function () {
            console.log('tryGetUrl', screenshot.thisTabId);
            screenshot.createBrowserProperties();
            chrome.tabs.sendMessage(screenshot.thisTabId, $.extend({
                type: 'loadCropperWithoutSelect'
            }, {}), function (response) {
                if (response != "success") {
                    alert("Please refresh page and try again.");
                    console.log("Content script is not loaded.");
                }
                else {
                    console.log('callback to loadCropperWithoutSelect');
                }
            });

        });
		return true;
    },
    scroll: false,
    cropData: null,
    retries: 0,
    showScrollBar: false,
    processFixedElements: false,

    executeOnPermission_array: [],
    apppick: null,
    screenShotParams: null,
    screens: [],
    lastImg: '',
    thisTab: null,
    thisTabId: '',
    thisTabTitle: '',
    url: '',
    title: '',
    canvas: '',
    canvasToDataURL: '',
    thisTabZoomLevel: '',
    chromeVersion: '',
    osVersion: '',
    thisTabPixelRatio: '',
    windowScreenSize: '',
    browserProperties:{},
    
    tryGetUrl: function (callback) {

        chrome.tabs.query({currentWindow: true, active: true}, function (w) {
            w = w[0];
            screenshot.thisTab = w;
            screenshot.thisTabId = w.id;
            screenshot.thisTabTitle = w.title;
            screenshot.url = w.url;
            screenshot.title = w.title;
            screenshot.thisWindowId = w.windowId
			
           callback(screenshot.url);
		    if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
            }
        });

    },
    load: function (callback) {
        screenshot.tryGetUrl(function () {
            var realCallback = callback;
            screenshot.screens = [];
            screenshot.description = '';
            callback = function () {
                setTimeout(realCallback, (parseInt(0, 10) || 0) * 1000)
            };
            if (!localStorage['captureCount']) localStorage['captureCount'] = 0;
            callback();
        })
    },
    addScreen: function (data) {
        screenshot.retries++;
        
        chrome.tabs.sendMessage(screenshot.thisTabId, {
            cropData: screenshot.cropData,
            type: 'takeCapture',
            start: true,
            scroll: screenshot.scroll,
            showScrollBar: screenshot.showScrollBar,
            processFixedElements: screenshot.processFixedElements,
            ...data
        }, screenshot.ans);
    },
    ans: function (mess) {
        if (!mess && chrome.runtime.lastError) {
            if (screenshot.retries > 1 && screenshot.scroll) {
                alert("Please refresh page and try again.");
                console.log("Can not take this page screen shot");
                return;
            } else if (screenshot.retries > 1) {
                mess = {left: 0, top: 0, finish: true};
            } else {
                screenshot.addScreen();
                return;
            }
        }
        if (mess.top == null) {
            mess.top = 0;
            mess.left = 0
        }

        var upCrop = 0
        var leftCrop = 0;
        if (screenshot.cropData) {
            upCrop = screenshot.cropData.x1
            upCrop = screenshot.cropData.x1
        }
        var cb = function (data) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            if ((mess.top || parseInt(mess.top) == 0 )) {
                screenshot.screens.push({left: parseInt(mess.left), top: parseInt(mess.top), data: data});
            }
            if (mess.finish) {
                screenshot.screenShotParams = mess;
                screenshot.createScreenShot();
            } else {
                screenshot.addScreen({
                    start: false
                });
            }
        };
        setTimeout(function () {
            chrome.windows.update(screenshot.thisWindowId, {focused: true}, function () {
                chrome.tabs.update(screenshot.thisTabId, {active: true}, function () {
                    if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
                    }
                    chrome.tabs.captureVisibleTab(null, {
                        format: 'png'
                    }, cb);
                })
            })
        }, 400);
    },
    createScreenShot: function () {
        var mess = screenshot.screenShotParams;
        chrome.tabs.sendMessage(screenshot.thisTabId, {type: 'finish'});
        var img = [];
        screenshot.canvas = document.createElement('canvas');
        var firstTime = true;
        var i = 0;
        loadImage = function (i) {
            ctx = screenshot.canvas.getContext('2d');
            img[i] = $('<img tag=' + i + '/>');
            img[i].on("load", function () {
                var i;
                i = parseInt($(this).attr('tag'));
                if (firstTime) {
                    screenshot.canvas.width = mess.width || img[i][0].width;
                    screenshot.canvas.height = mess.height || img[i][0].height;
                    firstTime = false;
                }
                i = parseInt($(this).attr('tag'));
                ctx.drawImage(img[i][0], screenshot.screens[i].left, screenshot.screens[i].top);
                screenshot.screens[i].data = null
                img[i][0].src = '';
                img[i].off('load')
                img[i][0] = null;
                img[i].remove()
                img[i] = null
                if (i == screenshot.screens.length - 1) {
                    chrome.tabs.create({url: chrome.extension.getURL('screenshot.html')});
                    return;
                }
                loadImage(++i);
            });
            try {
                img[i].attr('src', screenshot.screens[i].data);
                delete screenshot.screens[i].data;
            } catch (e) {

            }
        }
        loadImage(0);
    },
    createBrowserProperties: function () {

        chrome.tabs.query({ currentWindow: true, active: true }, function (w) {
            w = w[0];
            chrome.tabs.getZoom(screenshot.thisTabId,function(zoomFactor){  screenshot.browserProperties.zoomLevel = Math.round(zoomFactor * 100);  });
            screenshot.browserProperties.chromeVersion = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/)[0].split("/")[1];
            screenshot.browserProperties.screenSize = screen.width + " x " + screen.height;
            screenshot.browserProperties.osVersion = navigator.appVersion.split("(")[1].split(";")[0];
            //screenshot.browserProperties.pixelRatio = window.devicePixelRatio;
			 if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
            }
        });
    }
};