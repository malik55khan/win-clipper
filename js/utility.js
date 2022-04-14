var localStorage = {}, screen;
var protocol = "https:";
var server = "//www.lasso.net/go/";
var webLink = "https://www.lasso.net/go/index.jsp";
chrome.windows.getCurrent({}, win => {
    screen = win;
}
)