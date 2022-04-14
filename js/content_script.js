function zoomLevel() {
    return document.width / jQuery(document).width()
}

const delay = t=> new Promise(r=>setTimeout(r,t))
var hideTheScrollBars;
var cropData;
var $window = $(window);
localStorage['captureWithScroll'] = 0;
var screenshot = {
    dummyFunction: function (data) {
        chrome.tabs.getSelected(null, function (tab) { // null defaults to current window
            var title = tab.title;
            var url = tab.url;
            var description;
            if (chrome.runtime.lastError) {
                //console.error(chrome.runtime.lastError);
            }
        });
    },
    uploadExistingImage: function (data) {
        screenshot.load(screenshot.addScreen);
        screenshot.createBrowserProperties();
        this.showPopup = true;
        if (data.callback) data.callback(true)
        return true;
    },
    captureVisible: function (data) {
        $.extend(screenshot, {
            scroll: false,
            cropData: null,
            retries: 0,
            showScrollBar: true,
            processFixedElements: false
        }, data);
        localStorage['captureWithoutScroll']++;
        screenshot.load(screenshot.addScreen);
        screenshot.createBrowserProperties();
        this.showPopup = false;
        if (data.callback)
        data.callback(true)
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
        if (data.callback) data.callback(true)
        return true;
    },
    captureRegion: function (data) {
        
        this.showPopup = false;
        
        screenshot.tryGetUrl(function () {
            
            screenshot.createBrowserProperties();
            page.onRequest({
                type: 'loadCropperWithoutSelect'
            }, null, function (response) {
                if (response != "success") {
                    alert("Please refresh page and try again.");
                    console.log("Content script is not loaded.");
                }
                else {
                    console.log('callback to loadCropperWithoutSelect');
                }
            });
            

        });
        if (data.callback) data.callback(true)
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
    browserProperties: {},

    tryGetUrl: function (callback) {
        chrome.runtime.sendMessage({ data: "myId" }, sender => {
            
            let w = sender.tab;
        //chrome.tabs.query({ currentWindow: true, active: true }, function (w) {
           // w = w[0];
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
        page.onRequest($.extend({
            cropData: screenshot.cropData,
            type: 'takeCapture',
            start: true,
            scroll: screenshot.scroll,
            showScrollBar: screenshot.showScrollBar,
            processFixedElements: screenshot.processFixedElements
        }, data), null, screenshot.ans);
        //takeCapture(screenshot.ans, );
        return;
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
                mess = { left: 0, top: 0, finish: true };
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
            if ((mess.top || parseInt(mess.top) == 0)) {
                screenshot.screens.push({ left: parseInt(mess.left), top: parseInt(mess.top), data: data });
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
            chrome.runtime.sendMessage({ data: "captureVisibleTab" }, cb);
            
            return;
            chrome.windows.update(screenshot.thisWindowId, { focused: true }, function () {
                chrome.tabs.update(screenshot.thisTabId, { active: true }, function () {
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
        page.onRequest({ type: 'finish' });
        //chrome.tabs.sendMessage(screenshot.thisTabId, { type: 'finish' });
        var img = [];
        screenshot.canvas = document.createElement('canvas');
        var firstTime = true;
        var i = 0;
        loadImage =  function (i) {
            ctx = screenshot.canvas.getContext('2d');
            img[i] = $('<img tag=' + i + '/>');
            img[i].on("load", async function () {
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
                    await chrome.storage.local.set({ screenshot: screenshot,  'dataURL': screenshot.canvas.toDataURL() });
                    chrome.runtime.sendMessage({ data: "createTab", url: chrome.runtime.getURL('screenshot.html') })
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
        chrome.runtime.sendMessage({ data: "myId" }, sender => {
            chrome.runtime.sendMessage({ data: "getZoom" }, zoomFactor => {
                let w = sender.tab;
                screenshot.browserProperties.zoomLevel = Math.round(zoomFactor * 100);
                //chrome.tabs.query({ currentWindow: true, active: true }, function (w) {
                //w = w[0];
                //chrome.tabs.getZoom(screenshot.thisTabId, function (zoomFactor) { screenshot.browserProperties.zoomLevel = Math.round(zoomFactor * 100); });
                screenshot.browserProperties.chromeVersion = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/)[0].split("/")[1];
                screenshot.browserProperties.screenSize = screen.width + " x " + screen.height;
                screenshot.browserProperties.osVersion = navigator.appVersion.split("(")[1].split(";")[0];
                screenshot.browserProperties.pixelRatio = window.devicePixelRatio;
                if (chrome.runtime.lastError) {
                    //console.error(chrome.runtime.lastError);
                }
            });
        });
    }
};


chrome.runtime.onMessage.addListener(function (data, sender, callback) {
    switch (data.data) {
        case "captureVisible":
            screenshot.captureVisible({ ...data, callback: callback });
            break;
        case "captureFullPage":
            screenshot.captureAll({ ...data, callback: callback });
            break;
        case "captureRegion":
            screenshot.captureRegion({ ...data, callback: callback });
            break;
        case "uploadExistingImage":
            screenshot.uploadExistingImage({ ...data, callback: callback });
            break;
        case "bookmarkWebPage":
            screenshot.dummyFunction();
            break;
        case "getPageInfo": callback({
            url : document.location.toString(),
            title : document.title,
            description : $('meta[name=description]').attr('content'),
        }); break;
        case "addNote":
            screenshot.dummyFunction();
            break;
        default:
            console.log(data);
    }
    return true;
});








function exchangeElementStyle(element, styles, value) {
    if (!Array.isArray(styles)) {
        styles = [styles];
    }
    styles.forEach(function (style) {
        if (!element.hasOwnProperty('style_' + style)) {
            element['style_' + style] = element.style.getPropertyValue(style) || null;
            element['style_' + style + '_priority'] = element.style.getPropertyPriority(style) || null;
        }
        element.style.setProperty(style, value, 'important');
    });
}
function restoreElementStyle(element, styles) {
    if (!Array.isArray(styles)) {
        styles = [styles];
    }
    styles.forEach(function (style) {
        if (element.hasOwnProperty('style_' + style)) {
            element.style.removeProperty(style); // does not work with shorthand properties (background -> background-attachment)
            //element.style.setProperty(style, '', 'important');
            element.style.setProperty(style, element['style_' + style], element['style_' + style + '_priority']);
        }
    });
}
var page = {
    isWidthScroll: false,
    isHeightScroll: false,
    scrollLeft: 0,
    scrollTop: 0,
    windowWidth: 0,
    windowHeight: 0,
    documentWidth: 0,
    documentHeight: 0,
    currentX: 0,
    cropData: null,
    currentY: 0,
    scrollBarWidth: 0,
    elm: null,
    fixedTopElements: [],
    fixedBottomElements: [],
    setVars: function (cropData) {
        if (cropData.y2 > document.height) cropData.y2 = document.height;
        if (cropData.x2 > document.width) cropData.x2 = document.width;

        page.isWidthScroll = page.checkWidthScroll();
        page.isHeightScroll = page.checkHeightScroll();
        page.windowWidth = window.innerWidth;
        // if (!cropData) page.windowWidth+=  (page.isWidthScroll ? -16 : 0);
        page.documentWidth = document.body.scrollWidth;
        page.documentHeight = document.body.scrollHeight;
        if(page.documentHeight==0){
            var body = document.body, html = document.documentElement;
            var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
            page.documentHeight =height;
        }
        page.windowHeight = window.innerHeight;
        // if(!cropData)			page.windowHeight+= (page.isHeightScroll ? -16 : 0);
        page.currentX = 0;
        page.currentY = 0;

        if (cropData && cropData.y1 > $(window).scrollTop() && cropData.x1 > document.body.scrollLeft) {
            page.currentY = $(window).scrollTop()
            page.currentX = document.body.scrollLeft
        } else {
            page.currentX = cropData.x1;
            page.currentY = cropData.y1
        }
    },
    scrollToCurrent: function () {
        $(window).scrollTop(page.currentY);
        $(window).scrollLeft(page.currentX);
    },
    saveScrollPos: function () {
        page.scrollLeft = $(window).scrollLeft();
        page.scrollTop = $(window).scrollTop();
    },
    restoreScrollPos: function () {
        page.currentX = page.scrollLeft;
        page.currentY = page.scrollTop;
        page.scrollToCurrent();
    },
    computeNextScreen: function () {
        if (cropData)
            if (page.currentX + page.windowWidth > cropData.x2 && page.currentY + page.windowHeight > cropData.y2) return false
        if (page.currentX + page.windowWidth < page.documentWidth) {
            page.currentX += page.windowWidth;
            return true;
        } else {
            page.currentX = 0;
            if (page.currentY + page.windowHeight >= page.documentHeight)
                return false
            else {
                page.currentY += page.windowHeight;
                return true;
            }
        }
    },
    checkWidthScroll: function () {
        return (document.body.clientWidth < document.body.scrollWidth);
    },
    checkHeightScroll: function () {
        return (document.body.clientHeight < document.body.scrollHeight);
    },
    enableScrollbar: function (enableFlag) {
        if (enableFlag) {
            try {
                //don't hide&show scrollbars when user select region
                if (hideTheScrollBars) {
                    restoreElementStyle(document.body, ['overflow-x', 'overflow-y']);
                }
            } catch (e) {
            }
        } else {
            try {
                exchangeElementStyle(document.body, ['overflow-x', 'overflow-y'], 'hidden');
                hideTheScrollBars = true;
            } catch (e) {
            }
        }
    },
    fixedElementCheck: function () {
        //Hide fixed element
        //Add there visibility to custom tag
        if (document.defaultView.getComputedStyle(document.body)['background-attachment'] == 'fixed') {
            exchangeElementStyle(document.body, ['background-attachment'], 'initial');
        }

        var nodeIterator = document.createNodeIterator(
            document.documentElement,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        var currentNode;
        var windowHeight = $window.height();
        while (currentNode = nodeIterator.nextNode()) {
            var nodeComputedStyle = document.defaultView.getComputedStyle(currentNode, "");
            // Skip nodes which don't have computeStyle or are invisible.
            if (!nodeComputedStyle) {
                return;
            }
            var nodePosition = nodeComputedStyle.getPropertyValue("position");
            if (nodePosition == "fixed") {
                if ($(currentNode).position().top < windowHeight / 2) {
                    //show on Top
                    if (page.fixedTopElements.indexOf(currentNode) < 0) {
                        page.fixedTopElements.push(currentNode);
                    }
                    if (document.body.scrollHeight < windowHeight * 2) {
                        exchangeElementStyle(currentNode, ['position'], 'absolute');
                    }
                } else {
                    //show on bottom
                    if (page.fixedBottomElements.indexOf(currentNode) < 0) {
                        page.fixedBottomElements.push(currentNode);
                    }
                }
            }
        }
    },
    fixedElementRestore: function () {
        page.fixedTopElements.forEach(function (element) {
            restoreElementStyle(element, ['display', 'position']);
        });
        page.fixedBottomElements.forEach(function (element) {
            restoreElementStyle(element, ['display', 'position']);
        });
        restoreElementStyle(document.body, ['background-attachment']);
        page.fixedTopElements.length = 0;
        page.fixedBottomElements.length = 0;
    },
    hideFixedElement: function (inPosition) {
        var elements;
        if (inPosition == 'top') {
            elements = page.fixedTopElements;
        } else {
            elements = page.fixedBottomElements;
        }
        elements.forEach(function (element) {
            exchangeElementStyle(element, ['display'], 'none');
        });
    },
    showFixedElement: function (inPosition /* =top/bottom */) {
        var elements;
        if (inPosition == 'top') {
            elements = page.fixedTopElements;
        } else {
            elements = page.fixedBottomElements;
        }
        elements.forEach(function (element) {
            restoreElementStyle(element, ['display']);
        });
    },

    restore: function () {
        page.enableScrollbar(true);
        page.restoreScrollPos();
        setTimeout(page.fixedElementRestore, 1000);
    },
    load_cropper: function(){
    
        // Added support for set background black
            var $createbackground = $('body');
            var $cropdiv = $('<div class="custom-load-dynamic-for-crop"></div>');
            var x= 0;
            if(sessionStorage.getItem("checkPageReload")){
                x = sessionStorage.getItem("checkPageReload");  
            }
            if(x==0){
            x=1;
            sessionStorage.setItem("checkPageReload",x);    
            var $button = $('<button />', {'class' : 'lasso-screen-capture-ext clickDragBtn'},{'tag':'open'},{'disabled':'true'});
            
            var $buttonImg = $('<img />', {'id' : 'cropImage'});
            $buttonImg.attr({'src': chrome.runtime.getURL("img/drag_icon.png")});
            $buttonImg.appendTo($button);
          
            $buttonSpan = $('<span>Click and drag area</span>');
            $buttonSpan.appendTo($button);
            $button.appendTo($createbackground);
             $cropdiv.appendTo($createbackground);
            setTimeout(function(){ 
                $button.remove(); 
            }, 2000);
            $button.css({
                'z-index':'1000000000005'
            });
            $cropdiv.css({
                 'position': 'fixed',
                     'left': 0,
                     'top': 0,
                     'width': '100%',
                     'height': '100%',
                    'z-index':'1000000000000', 
                    'background': 'black',
                    'opacity':0.5
                }); 
         } 
   
         $(document).on('mousedown','body .custom-load-dynamic-for-crop',function(e){
            x1=e.pageX;
            y1=e.pageY;
            x2=x1;
            y2=y1;
            $button.remove();
            $cropdiv.remove();
            sessionStorage.clear();
            load_cropper_without_selection(x1,y1,x2,y2);
        });
 },
    onRequest: async function (mess, sender, callback) {
        console.log(mess.type)
        if (mess.type == 'checkExist') {
            callback();
            return;
        }
        await delay(200);
        if (mess.start) {
            page.saveScrollPos();
            var defaults = {
                x1: 0,
                x2: 32768,
                y1: 0,
                y2: 32765,
                scrollTop: $(window).scrollTop(),
                scrollLeft: document.body.scrollLeft
            };
            if (!mess.scroll) {
                defaults.x1 = window.scrollX;
                defaults.y1 = window.scrollY;
                defaults.x2 = window.innerWidth + defaults.x1;
                defaults.y2 = window.innerHeight + defaults.y1;
            }
            cropData = $.extend(defaults, mess.cropData);

            maxDimensionForCanvas = Math.pow(2, 15) - 100;
            if (cropData.y2 - cropData.y1 > maxDimensionForCanvas) cropData.y2 = cropData.y1 + maxDimensionForCanvas
            if (cropData.x2 - cropData.x1 > maxDimensionForCanvas) cropData.x2 = cropData.x1 + maxDimensionForCanvas
            // for(var key in cropData) {cropData[key]=cropData[key] * zoomLevel()  }
        }
        if (mess.type == 'takeCapture') {
            var ans = {};

            if (mess.start) {
                dectect_zoom();
                page.setVars(cropData);
                if (mess.scroll && !mess.showScrollBar) {
                    page.enableScrollbar(false);
                }
                if (mess.scroll && mess.processFixedElements) {
                    page.fixedElementCheck();
                }
            }
            page.scrollToCurrent();
            if (mess.scroll && mess.processFixedElements) {
                setTimeout(function () {
                    page.fixedElementCheck();
                    if (mess.start) {
                        page.hideFixedElement('bottom')
                    } else {
                        page.hideFixedElement('top')
                    }
                    if (ans.finish) {
                        page.showFixedElement('bottom');
                        if ($(window).scrollTop() < $window.height()) {
                            page.showFixedElement('top');
                        }
                    }
                }, 50);
            }
            var scrollTop = $(window).scrollTop()

            ans.top = parseInt($(window).scrollTop() * zoomLevel() - cropData.y1 * zoomLevel(), 10);
            ans.left = parseInt(document.body.scrollLeft * zoomLevel() - cropData.x1 * zoomLevel(), 10);

            ans.finish = !mess.scroll || !page.computeNextScreen();
            if (ans.finish) {
                ans.width = parseInt((cropData.x2 - cropData.x1), 10) * zoomLevel();
                ans.height = parseInt((cropData.y2 - cropData.y1), 10) * zoomLevel();
                ans.url = document.location.toString();
                ans.title = document.title;
                ans.description = $('meta[name=description]').attr('content');
                if (window.onfinish)
                    window.onfinish()
            }

            callback(ans);
        }
        if (mess.type == 'finish') {
            page.restore();
        }
        if (mess.type == 'loadCropperWithoutSelect') {
            page.load_cropper();
            callback("success");
        }
    }
};
function takeCapture(callback,mess) {
    
}
chrome.runtime.onMessage.addListener(page.onRequest);

function dectect_zoom() {
    (function (e, t, n) {
        "use strict";
        "undefined" != typeof module && module.exports ? module.exports = n(t, e) : "function" == typeof define && define.amd ? define(function () {
            return n(t, e)
        }) : e[t] = n(t, e)
    })(window, "detectZoom", function () {
        var e = function () {
                return window.devicePixelRatio || 1
            },
            t = function () {
                return {
                    zoom: 1,
                    devicePxPerCssPx: 1
                }
            },
            n = function () {
                var t = Math.round(100 * (screen.deviceXDPI / screen.logicalXDPI)) / 100;
                return {
                    zoom: t,
                    devicePxPerCssPx: t * e()
                }
            },
            r = function () {
                var t = Math.round(100 * (document.documentElement.offsetHeight / window.innerHeight)) / 100;
                return {
                    zoom: t,
                    devicePxPerCssPx: t * e()
                }
            },
            i = function () {
                var t = 90 == Math.abs(window.orientation) ? screen.height : screen.width,
                    n = t / window.innerWidth;
                return {
                    zoom: n,
                    devicePxPerCssPx: n * e()
                }
            },
            s = function () {
                var t = function (e) {
                        return e.replace(/;/g, " !important;")
                    },
                    n = document.createElement("div");
                n.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0", n.setAttribute("style", t("font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;"));
                var r = document.createElement("div");
                r.setAttribute("style", t("width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;")), r.appendChild(n), document.body.appendChild(r);
                var i = 1e3 / n.clientHeight;
                return i = Math.round(100 * i) / 100, document.body.removeChild(r), {
                    zoom: i,
                    devicePxPerCssPx: i * e()
                }
            },
            o = function () {
                var e = f("min--moz-device-pixel-ratio", "", 0, 10, 20, 1e-4);
                return e = Math.round(100 * e) / 100, {
                    zoom: e,
                    devicePxPerCssPx: e
                }
            },
            u = function () {
                return {
                    zoom: o().zoom,
                    devicePxPerCssPx: e()
                }
            },
            a = function () {
                var t = window.top.outerWidth / window.top.innerWidth;
                return t = Math.round(100 * t) / 100, {
                    zoom: t,
                    devicePxPerCssPx: t * e()
                }
            },
            f = function (e, t, n, r, i, s) {
                function o(n, r, i) {
                    var a = (n + r) / 2;
                    if (0 >= i || s > r - n) return a;
                    var f = "(" + e + ":" + a + t + ")";
                    return u(f).matches ? o(a, r, i - 1) : o(n, a, i - 1)
                }

                var u, a, f, l;
                window.matchMedia ? u = window.matchMedia : (a = document.getElementsByTagName("head")[0], f = document.createElement("style"), a.appendChild(f), l = document.createElement("div"), l.className = "mediaQueryBinarySearch", l.style.display = "none", document.body.appendChild(l), u = function (e) {
                    f.sheet.insertRule("@media " + e + "{.mediaQueryBinarySearch " + "{text-decoration: underline} }", 0);
                    var t = "underline" == getComputedStyle(l, null).textDecoration;
                    return f.sheet.deleteRule(0), {
                        matches: t
                    }
                });
                var c = o(n, r, i);
                return l && (a.removeChild(f), document.body.removeChild(l)), c
            },
            l = function () {
                var e = t;
                return isNaN(screen.logicalXDPI) || isNaN(screen.systemXDPI) ? window.navigator.msMaxTouchPoints ? e = r : "orientation" in window && "string" == typeof document.body.style.webkitMarquee ? e = i : "string" == typeof document.body.style.webkitMarquee ? e = s : navigator.userAgent.indexOf("Opera") >= 0 ? e = a : window.devicePixelRatio ? e = u : o().zoom > .001 && (e = o) : e = n, e
            }();
        return {
            zoom: function () {
                return l().zoom
            },
            device: function () {
                return l().devicePxPerCssPx
            }
        }
    });
    document.width = (Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth));
    document.height = (Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight));
    zoomLevel = function () {
        return devicePixelRatio
    }
}