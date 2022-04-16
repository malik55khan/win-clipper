let settings = {
    menuLeftMargin: 120,
    menuFromTop: 0,
    fadeSpeed:200
}
var menuActions = {
    onRenameClick: (params, id) => { alert(params) },
    onDeleteClick: (params) => { alert(params) },
    onArchiveClick: (params) => { alert(params) },
    onInviteClick: (params) => { alert(params) },
    onShareClick: (params) => { alert(params) },
    onStarClick: (params) => { alert(params) },
}
$(() => {
    $('body,html,document').on('mousemove', function (e) { 
        $('#mouse-x').html(e.clientX)
        $('#mouse-y').html(e.clientY)
    })
    $(".liElement").off('hover');
    $('.liElement a').on('mousedown', function (e) {
        if (e.button == 2) {
            document.oncontextmenu = function () { return false; };
            rightClick(this, e)
            return false;
        }
        hideMenu();
        return true;
    })
    $("body,html,document").on('click', function () {
        document.oncontextmenu = () => true;
        hideMenu();
    });
})

function hideMenu() {
    $("body,document").find('.context-menu').hide(settings.fadeSpeed);
    setTimeout(() => {$('.contextmenu-list-area').hide();}, 1000)
}

function rightClick(elem, e) {
    e.preventDefault();
    $('#mouse-click-x').html(e.clientX)
    $('#mouse-click-y').html(e.clientY);
    hideMenu();
    
    let container = "#left-side-menu ul";
    let contextMenu = $(elem).parent().find('.context-menu');
    
    let contextPosition = {
        height: contextMenu.height(),
        width: contextMenu.width()
    }, menuContainerPosition = {
        height: $(container).height(),
        width: $(container).width()
    }
    menuContainerPosition = screen;
    let verticalPosition = "", horizonalPosition=""
    if (e.clientY < menuContainerPosition.height / 2) verticalPosition = 'top';
    else verticalPosition = 'bottom';
    if (e.clientX < menuContainerPosition.width / 2) horizonalPosition = "right";
    else horizonalPosition = "left";
    if (verticalPosition == "top" && horizonalPosition == "left") {
        if (contextPosition.width > e.clientX) {
            horizonalPosition = "right"
        }
    }
    verticalPosition = "top"; horizonalPosition = "right";
    if (verticalPosition == "top" && horizonalPosition == "right") {
        contextMenu.find(".menu").addClass("menu-top-right").removeClass('menu-top-left').removeClass('menu-bottom-left')
        contextMenu.css({ left: e.pageX+10 + "px", top: e.clientY-10 + "px" })
    } else if (verticalPosition == "top" && horizonalPosition == "left") {
        contextMenu.find(".menu").addClass("menu-top-left").removeClass('menu-top-right').removeClass('menu-bottom-left')
        contextMenu.css({ left: e.pageX - contextPosition.width -10 + "px", top: e.clientY - 10 + "px" })
    } else if (verticalPosition == "bottom" && horizonalPosition == "left") {
        contextMenu.find(".menu").addClass("menu-bottom-left").removeClass('menu-top-right').removeClass("menu-top-left")
        contextMenu.css({ left: e.pageX - contextPosition.width - 10 + "px", top: e.clientY - contextPosition.height + 10 + "px" })
    } else if (verticalPosition == "bottom" && horizonalPosition == "right") {
        contextMenu.find(".menu").addClass("menu-bottom-right").removeClass("menu-bottom-left").removeClass('menu-top-right').removeClass("menu-top-left")
        contextMenu.css({ left: e.pageX + 10 + "px", top: e.clientY - contextPosition.height + 10 + "px" })
    }
    contextMenu.show(settings.fadeSpeed);
}