var localStorage = {}, screen;
chrome.windows.getCurrent({}, win => {
    console.log(win);
    screen = win;
}
)