//var protocol = "http:";
//var server = '//localhost:8080/go/';
	
var protocol = "https:";
var server ="//www.lasso.net/go/";

var popup = {
	
    ready: function () {
        $(".capture-screenshot").click(popup.captureVisible);
        $(".capture-fullpage").click(popup.captureFullPage);
        $(".capture-region").click(popup.captureRegion);
		$(".upload-existing-image").click(popup.uploadExistingImage);
		$(".annotate-existing-image").click(popup.annotateExistingImage);
		$(".add-note").click(popup.addNote);
		$(".bookmark-web-page").click(popup.bookmarkWebPage);
    },
    captureVisible: function () {
        popup.sendMessage({
            data: "captureVisible"
        });
    },
    captureFullPage: function () {
        popup.sendMessage({
            data: "captureFullPage"
        });
    },
    captureRegion: function() {
        popup.sendMessage({
            data: "captureRegion",
        });
		setTimeout(function(){window.close();},250);
    },
    uploadExistingImage: function() {
		popup.sendMessage({
            data: "uploadExistingImage",
        });
    },
    annotateExistingImage: function() {
        popup.sendMessage({
            data: "annotateExistingImage",
        });
    },
    bookmarkWebPage: function() {
		chrome.tabs.query({active: true, currentWindow: true },function(tab) { // null defaults to current window
			var title = tab.title;
			var url = tab.url;
			var description;
		
			sessionStorage.removeItem('openNewWindowForBookmarkLateItem');
					var request = false;
					var isHTMLContent = true;
					var description = '';
					var metaRobotContent = '';
					var isRobotsMetaTagMatch = false;
					var isRobotsNoIndexMatch = false;
					try {
						//checkMimeType(url);
						request = true;
					} catch (e) {
						request = false;
						
					}
					if (request == false) {
						console.log('OOPS! check content type request timeout.');
					}
					var urlPrefix = server;
					var metas = document.getElementsByTagName('meta');
					for (var i = 0; i < metas.length; i++) {
						if (metas[i].getAttribute('name') && metas[i].getAttribute('name')
							.toLowerCase() == 'robots') {
							metaRobotContent = metas[i].getAttribute('content');
							break;
						}
					}
					var array = metaRobotContent.split(',');
					for (var i = 0; i < array.length; i++) {
						if (array[i].toLowerCase().indexOf('none') > -1) isRobotsMetaTagMatch =
							true;
						if (array[i].toLowerCase().indexOf('noindex') > -1) isRobotsNoIndexMatch =
							true;
					}
					if (isRobotsMetaTagMatch || isRobotsNoIndexMatch) {
						var lassoURL = protocol + urlPrefix + 'lasso/view-item?url=' +
							encodeURIComponent(url) + '&title=&desc=&login=true&isOpenedFromExtension=true';
					} else {
						for (var i = 0; i < metas.length; i++) {
							if (metas[i].getAttribute('name') && metas[i].getAttribute('name')
								.toLowerCase() == 'description') {
								description = metas[i].getAttribute('content');
								break;
							}
							if (!description && metas[i].getAttribute('property') && metas[i]
								.getAttribute('property').toLowerCase() == 'og:description') {
								description = metas[i].getAttribute('content');
								break;
							}
							if (!description && metas[i].getAttribute('property') && metas[i]
								.getAttribute('property').toLowerCase() == 'dc:description') {
								description = metas[i].getAttribute('content');
								break;
							}
						}
						var lassoURL = protocol + urlPrefix + 'lasso/add-item2?url=' +
							encodeURIComponent(url) + '&actionType=1' + '&title=' +
							encodeURIComponent(title) + '&desc=' + encodeURIComponent(
								description) + '&login=true&isOpenedFromExtension=true';
					}
					openNewWindow(lassoURL);
					window.close();
			 if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
            }
		});
		
    },
    addNote: function() {
		chrome.tabs.query({active: true, currentWindow: true },function(tab) { // null defaults to current window
			var title = tab.title;
			var url = tab.url;
			var description;
			
					sessionStorage.removeItem('openNewWindowForBookmarkLateItem');
					var request = false;
					var isHTMLContent = true;
					var description = '';
					var title = '';
					var metaRobotContent = '';
					var isRobotsMetaTagMatch = false;
					var isRobotsNoIndexMatch = false;
					try {
						//checkMimeType(url);
						request = true;
					} catch (e) {
						request = false;
						
					}
					if (request == false) {
						console.log('OOPS! check content type request timeout.');
					}
					var urlPrefix = server;
					var metas = document.getElementsByTagName('meta');
					for (var i = 0; i < metas.length; i++) {
						if (metas[i].getAttribute('name') && metas[i].getAttribute('name')
							.toLowerCase() == 'robots') {
							metaRobotContent = metas[i].getAttribute('content');
							break;
						}
					}
					var array = metaRobotContent.split(',');
					for (var i = 0; i < array.length; i++) {
						if (array[i].toLowerCase().indexOf('none') > -1) isRobotsMetaTagMatch =
							true;
						if (array[i].toLowerCase().indexOf('noindex') > -1) isRobotsNoIndexMatch =
							true;
					}
					if (isRobotsMetaTagMatch || isRobotsNoIndexMatch) {
						var lassoURL = protocol + urlPrefix + 'lasso/view-item?url=' +
							encodeURIComponent(url) + '&title=&desc=&login=true&app=1&isOpenedFromExtension=true';
					} else {
						for (var i = 0; i < metas.length; i++) {
							if (metas[i].getAttribute('name') && metas[i].getAttribute('name')
								.toLowerCase() == 'description') {
								description = metas[i].getAttribute('content');
								break;
							}
							if (!description && metas[i].getAttribute('property') && metas[i]
								.getAttribute('property').toLowerCase() == 'og:description') {
								description = metas[i].getAttribute('content');
								break;
							}
							if (!description && metas[i].getAttribute('property') && metas[i]
								.getAttribute('property').toLowerCase() == 'dc:description') {
								description = metas[i].getAttribute('content');
								break;
							}
						}
						var lassoURL = protocol + urlPrefix + 'lasso/add-item2?url=' +
							encodeURIComponent(url) + '&actionType=4' + '&title=' +
							'' + '&desc=' + '' + '&login=true&isOpenedFromExtension=true';
					}
					openNewWindow(lassoURL);
					window.close();
			 if (chrome.runtime.lastError) {
                        //console.error(chrome.runtime.lastError);
             }
		});
		
    },	
    sendMessage: function (data) {
        chrome.runtime.sendMessage(data, function (x) {
            console.log(data);
			this.close();
        });
    }
};
function openNewWindow(lassoURL) {
        var percentageWidth = screen.width / 100;
        var percentageheight = screen.height / 100;
        var width = 1250;
        if(screen.width < 1250 ) {
                width = screen.width - (screen.width / 100) * 10;
        }
        var height = 310;
        var left = screen.width/2 - width/2;
        var top = 5;
        var params = 'width='+width+',height='+height+',left='+left+',top='+top;
        newwindow = window.open(lassoURL + '&openNewWindow=true','Add Item', params,true);
}
$(popup.ready);
