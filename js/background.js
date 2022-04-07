try {
	console.log("Service worker")
	var malikkhan = {test:1};
	importScripts('utility.js');
	importScripts('screenshot.js');
	console.log("screenshot", screenshot);
	chrome.tabs.query({}, function (tabs) {
		tabs.forEach(async tab => {
			if (tab.url.startsWith("http")) {
				let results = await chrome.scripting.executeScript({
					target: {
						//allFrames: true,
						tabId: tab.id,
					},
					files: ['libs/jquery.js', 'libs/cropper.js', 'js/content_script.js'],
				});
				await chrome.scripting.insertCSS({
					target: { tabId: tab.id },
					files: ['css/content-script-style.css']
				})
			}
			
			
		});
	});
} catch (error) {
	console.log(error)
}
var api = {
	init: function () {
		chrome.runtime.onMessage.addListener(function (data, sender, callback) {

			switch (data.data) {
				case "createTab": chrome.tabs.create({ url: data.url });
				case "captureVisibleTab": chrome.tabs.captureVisibleTab(null, {
					format: 'png'
				}, callback); break;
				case "myId": callback(sender); break;
				case "getZoom": chrome.tabs.getZoom(sender.tab.id, callback); break;
				case "captureVisible":
					screenshot.captureVisible({ ...data, callback: callback });
					break;
				case "captureFullPage":
					screenshot.captureAll({ ...data, callback: callback });
					break;
				case "captureRegion":
					screenshot.captureRegion();
					break;
				case "uploadExistingImage":
					screenshot.uploadExistingImage();
					break;
				case "bookmarkWebPage":
					screenshot.dummyFunction();
					break;
				case "addNote":
					screenshot.dummyFunction();
					break;
				default:
					console.log(data);
			}
			return true;
		});

	}
};
api.init();

function checkVflLoad() {
	if (typeof removeLasso === 'undefined') {
		alert('Failed to load the Lasso in this website');
	}
}

function removeLasso() {
	try {
		document.getElementById('vflDiv').remove();
	} catch (e) { }
}
function checkMimeType(theURL) {
	if (document.contentType != null) {
		request = true;
		if (document.contentType.indexOf('text/html') == -1) {
			isHTMLContent = false;
		}
	} else {
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
		} else {
			request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		var isHeadSuccess = false;
		try {
			request.open('HEAD', document.location, false);
			request.send(null);
			if (request.getResponseHeader('content-type') != null) {
				isHeadSuccess = true;
				if (request.getResponseHeader('content-type').indexOf(
					'text/html') == -1) isHTMLContent = false;
				else isHTMLContent = true;
			}
		} catch (e) { }
		if (!isHeadSuccess) {
			var actionURL =
				'https://www.lasso.net/go/api?action=mime-type-from-URL';
			var param = 'url=' + theURL;
			if (window.XMLHttpRequest) {
				request = new XMLHttpRequest();
			} else {
				request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			request.open('POST', actionURL, false);
			request.setRequestHeader('Content-type',
				'application/x-www-form-urlencoded');
			request.setRequestHeader('Accept', 'application/json');
			request.send(param);
			content = request.responseText;
			var res = JSON.parse(content);
			var status = res.response.success;
			if (status && status == true) {
				var contentType = res.response.data.contentType;
				console.log(contentType);
				if (contentType && contentType.indexOf('text/html') == -1)
					isHTMLContent = false;
			} else {
				console.log('OOPS! something went wrong.')
			}
		}
	}
}

