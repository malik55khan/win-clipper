var screenshot = chrome.extension.getBackgroundPage().screenshot;

function viewer_obj() {
    this.init = function () {
        if (screenshot.canvas) {

            img = $('#screenshot')[0];
            try {
                img.src = screenshot.canvas.toDataURL()
            }
            catch (exception) {
                alert('Failed to load image');
                return;
            }
            screenshot.canvas.width = screenshot.canvas.height = 1
            screenshot.canvas.remove()
            screenshot.canvas = null
            delete screenshot.canvas
        }
    }
}

var viewer = new viewer_obj();
$(function () {
    viewer.init();
});














