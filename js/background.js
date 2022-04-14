try {
	console.log("Service worker")
	importScripts('utility.js');
	importScripts('screenshot.js');
	
	//addDynamicScripts();
} catch (error) {
	console.log(error)
}
const showAlert = tabId => chrome.scripting.executeScript({ target: { tabId: tabId }, func: showMsg = () => alert("Please refresh page and try again.") });
function addDynamicScripts() {
	chrome.tabs.query({}, function (tabs) {
		tabs.forEach(async tab => {
			if (tab.url.startsWith("view-source:https:")) {
				let results = await chrome.scripting.executeScript({
					target: {
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
}
var api = {
	
	async addNote() {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tab) { // null defaults to current window
			tab = tab.shift();
			var url = tab.url;
			var request = false;
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
			var lassoURL = protocol + urlPrefix + 'lasso/add-item2?url=' +
				encodeURIComponent(url) + '&actionType=4' + '&title=' + '' +
				'&desc=' + '' + '&login=true&isOpenedFromExtension=true';
			chrome.windows.create({ height: 300, url: lassoURL, type: "popup" });
			if (chrome.runtime.lastError) {
				//console.error(chrome.runtime.lastError);
			}

		});
	},
	async addBookmark() {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tab) { // null defaults to current window
			tab = tab.shift()
			var title = tab.title;
			var url = tab.url;
			var description;
			//sessionStorage.removeItem('openNewWindowForBookmarkLateItem');
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
			var lassoURL = protocol + urlPrefix + 'lasso/add-item2?url=' +
				encodeURIComponent(url) + '&actionType=1' + '&title=' +
				encodeURIComponent(title) + '&desc=' + encodeURIComponent(
					description) + '&login=true&isOpenedFromExtension=true';


			chrome.windows.create({ height: 300, url: lassoURL, type: "popup" });

			if (chrome.runtime.lastError) {
				//console.error(chrome.runtime.lastError);
			}
		});
	},
	async sendTabMessage(data) {
		let tab = (await chrome.tabs.query({ active: true, currentWindow: true })).shift();
		chrome.tabs.sendMessage(tab.id, data, (x) => {
			if (data.callback) data.callback(x);
			if (x == undefined) showNotification("Please refresh page and try again.")
		})
	}
};

chrome.runtime.onMessage.addListener(function (data, sender, callback) {
	console.log(data.data);
	switch (data.data) {
		case "createTab": chrome.tabs.create({ url: data.url });
		case "captureVisibleTab": chrome.tabs.captureVisibleTab(null, {
			format: 'png'
		}, callback); break;
		case "myId": callback(sender); break;
		case "getZoom": chrome.tabs.getZoom(sender.tab.id, callback); break;
		case "captureVisible":
			api.sendTabMessage({ ...data, callback: callback });
			break;
		case "captureFullPage":
			api.sendTabMessage({ ...data, callback: callback });
			break;
		case "captureRegion":
			api.sendTabMessage({ ...data, callback: callback });
			break;
		case "uploadExistingImage":
			api.sendTabMessage({ ...data, callback: callback });
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

function setUpContextMenus() {
	let type = "normal", contexts = ["all"], documentUrlPatterns = ["*://*/*"];
	chrome.contextMenus.create({
		title: 'Visible area image',
		id: 'captureVisible',
		type,
		//documentUrlPatterns,
		contexts
	});
	chrome.contextMenus.create({
		title: 'Entire page image',
		id: 'captureFullPage',
		type,
		//documentUrlPatterns,
		contexts
	});
	chrome.contextMenus.create({
		title: 'Custom area image',
		id: 'captureRegion',
		type,
		//documentUrlPatterns,
		contexts
	});
	chrome.contextMenus.create({
		title: 'Add Bookmark',
		id: 'ab',
		type,
		//documentUrlPatterns,
		contexts
	});
	chrome.contextMenus.create({
		title: 'Add Note',
		id: 'an',
		type,
		//documentUrlPatterns,
		contexts
	});

}
function showNotification(msg,time=3000) { 
	let id = "notif_" + Math.random().toString().substr(2)
	chrome.notifications.create(id,
		{
			type: "basic",
			iconUrl: "../img/lasso-icon.png",
			title: "Lasso Notification!",
			message: msg,
		},()=>setTimeout( ()=>chrome.notifications.clear(id), time)
		
	);
}

chrome.contextMenus.onClicked.addListener(itemData => {
	chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
		console.log(itemData.menuItemId)
		switch (itemData.menuItemId) {
			case "an": api.addNote(); break;
			case "ab": api.addBookmark(); break;
			case "captureVisible":
			case "captureFullPage":
			case "captureRegion":
				if (!tab.url.startsWith("http")) {
					showNotification("This function isn't supported on this type of page");
					return;
				}
				chrome.tabs.sendMessage(tab.id, { data: itemData.menuItemId }, (x) => {
					if (x == undefined) showNotification("Please refresh page and try again.")
				}); break;
		}
	})
})

chrome.runtime.onInstalled.addListener(function (info) {
	if (info.reason == "install") {
		chrome.tabs.create({ url: webLink });
	}
	setUpContextMenus();
});
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
	if (changeInfo.status == "complete") {
		//addDynamicScripts();
	}

});


chrome.action.onClicked.addListener(function (tab) {
	
})