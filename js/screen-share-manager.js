var lassoUserId = null;
var selectedCollection = -1;
var collectionList;
var integrationChannelSelection = '';
$(function () {

    var logoutButtonClick = false;
	var closeButtonClick = false;
	var closeFromAdd = false;
    checkUserLoggedinToLasso();
    //$("#loader").hide();
    //$("#lassoInputHeaderContent").show();

    $("#loader").hide();
    $("#success-alert").hide();
    $("#headerEditContainer").css("max-width", "100%");
    function checkUserLoggedinToLasso() {

        $("#loader").show();
        $.get(serverUrlBasePath + "/go/api?action=retrieve-loggedin-user-info")
            .done(function (response) {
                $("#headerEditContainer").css("max-width", "100%");

                if (response.response.success == true) {
                    lassoUserId = response.response.data.userId;
                   // showLassoIntegrationInput();
					showLassoAddItemInFrame();
                } else {
                    $("#loader").hide();
                    $("#welcomeMessageHeaderContent").show();
                    $('.editContainerHeader').css("height", "40px");
                }
            })
            .fail(function () {
                console.log('error');
            })
    }

    /**
     *  Load the Iframe
     */
    $('#MainPopupIframe').on("load", function () {
        if (logoutButtonClick) {
            logoutButtonClick = false;
            $("#welcomeMessageHeaderContent").show();
			if ($('#lassoEditContainerHeader').hasClass("editContainerHeaderAddItem")) {
				$('#lassoEditContainerHeader').toggleClass("editContainerHeaderAddItem");
			}
            $("#loader").hide();
            $("#lassoInputHeaderContent").hide();
            $('.editContainerHeader').css("height", "40px");
            return;
        }
        if (closeButtonClick) {
            closeButtonClick = false;
			if(!closeFromAdd)
				$("#reopenMessageHeaderContent").show();
			else
				$("#reopenMessageHeaderContentFromAdd").show();
			if ($('#lassoEditContainerHeader').hasClass("editContainerHeaderAddItem")) {
				$('#lassoEditContainerHeader').toggleClass("editContainerHeaderAddItem");
			}
            $("#loader").hide();
            $("#lassoInputHeaderContent").hide();
            $('.editContainerHeader').css("height", "40px");
            return;
        }		
        $("#loader").hide();
        $("#iframeContainerHeaderContent").show();
        if ($('.editContainerHeader').height() < 60) {
            $('.editContainerHeader').css("height", "148px");
            $("#MainPopupIframe").height(148);
        } 
        console.log('iframe loaded successfully');
    });

    $('#MainPopupIframeAddItem').on("load", function (e) {
        if (logoutButtonClick) {
			e.preventDefault();
            logoutButtonClick = false;
            $("#welcomeMessageHeaderContent").show();
            $("#loader").hide();
            $("#lassoInputHeaderContent").hide();
			if ($('#lassoEditContainerHeader').hasClass("editContainerHeaderAddItem")) {
				$('#lassoEditContainerHeader').toggleClass("editContainerHeaderAddItem");
			}
			$('.editContainerHeader').css("height", "40px !important;");
            return;
        }
        if (closeButtonClick) {
			e.preventDefault();
            closeButtonClick = false;
            if(!closeFromAdd)
				$("#reopenMessageHeaderContent").show();
			else
				$("#reopenMessageHeaderContentFromAdd").show();
            $("#loader").hide();
            $("#lassoInputHeaderContent").hide();
			if ($('#lassoEditContainerHeader').hasClass("editContainerHeaderAddItem")) {
				$('#lassoEditContainerHeader').toggleClass("editContainerHeaderAddItem");
			}
			 $('.editContainerHeader').css("height", "40px !important;");
            return;
        }		
        $("#loader").show();
		if ($('#lassoEditContainerHeader').hasClass("editContainerHeaderAddItem")) {
			
		} else {
			$('#lassoEditContainerHeader').toggleClass("editContainerHeaderAddItem");
		}
		$("#iframeContainerHeaderContentAddItem").show();
		$("#loader").hide();

        console.log('iframe loaded successfully');
    });


    window.addEventListener("message", function (e) {
        console.log(e.data);

        if ($.isNumeric(e.data) && e.data > 100 && e.data < 250) {
            //when there is login/signup failed, the JSP send message with height. We use that to adjust iframe height. 
            //The -43 is to make sure not to display the iframe close symbol at bottom
            $('.editContainerHeader').css("height", (e.data - 43) + "px");
            $("#MainPopupIframe").height(e.data - 43);
            return;
        } else if ($.isNumeric(e.data) && e.data < 250) {
            //when user click login/signup, parent JSP send the height as message. We use it and adjust the height in extension.
            $('.editContainerHeader').css("height", "40px");
            $("#MainPopupIframe").height(149);
        }
        if (e.data == 'logoutLasso') {
			 e.preventDefault();
            $('.headerContent').hide();
			$("#loader").show();
			logoutButtonClick = true;
			closeButtonClick = false;
        }
        if (e.data == 'closeLasso' && !logoutButtonClick ) {
			 e.preventDefault();
            $('.headerContent').hide();
			$("#loader").show();
			logoutButtonClick = false;
			closeButtonClick = true;
        }	
		if (e.data == 'closeLassoAdd' && !logoutButtonClick ) {
			 e.preventDefault();
            $('.headerContent').hide();
			$("#loader").show();
			logoutButtonClick = false;
			closeButtonClick = true;
			closeFromAdd = true;
        }			
		if (e.data == 'addItemLasso') {
           $('.headerContent').hide();
 		   userId = e.data.split('loginSuccess_')[1];
		   $(".saveScreenshotBtn").click();
  		   showLassoAddItemInFrame();
        }
        if (e.data && e.data.indexOf && e.data.indexOf('loginSuccess') != -1) {
           $('.headerContent').hide();
			userId = e.data.split('loginSuccess_')[1];
           //showLassoIntegrationInput();
		    showLassoAddItemInFrame();
        }
        if (e.data && e.data.indexOf && e.data.indexOf('SignupFailed') != -1) {
            $('.editContainerHeader').css("height", "200px");
            $("#MainPopupIframe").height(190);
        }

    }, true);

    function showLassoIntegrationInput() {
        var list = $(".channel-item-options .dropdown-menu");
        $(list).empty();
        $('.headerContent').hide();
        $("#loader").show();
        $.get(serverUrlBasePath + "/go/api?action=retrieve-user-collections")
            .done(function (response) {
                if (response.response.data.listItems) {
                    collectionList = JSON.parse(response.response.data.listItems);
                    populateLassoCollections();
                    $("#lassoInputHeaderContent").show();
                    $("#titleTextbox").val("");

                    $("#loader").hide();
                    addOptionsInSelectChannelDropdown();
                    var lastSelectedDomain = Cookies.get("integration-option-cookie");
                    if (lastSelectedDomain) {
                        $('.integration-channel-dropdown .dropdown-menu a[data-domain="' + lastSelectedDomain + '"]').click();
                    }

                }
            })
            .fail(function () {
                console.log('error');
            })
    }

	function showLassoAddItemInFrame() {
		$("#loader").show();
		resourceRefId = new Date().getTime();
		document.getElementById("resourceRefId").value = "" + resourceRefId + "";
        $('#MainPopupIframeAddItem').attr("src", serverUrlBasePath + "/go/lasso/add-item2?actionType=3&app=1&url=" +encodeURIComponent(screenshot.url) + "&extURL=" +  encodeURIComponent(window.location.href) + "&resourceRefId="+resourceRefId);
	}
	
    function addOptionsInSelectChannelDropdown() {
        var slackCollectionExist = false;
        var list = $(".integration-channel-dropdown .dropdown-menu");
        $(list).empty();
        list.append('<a class="dropdown-item" data-domain="saveToLasso" id="saveToLassoOption" style="padding-top:1px;padding-bottom:1px;padding-left:6px;cursor:pointer;">Save to Lasso</a>');
        $.each(collectionList.userLists, function (key, val) {
            if (val.isSlackMapped == true) {
                slackCollectionExist = true;
            }
        });
        if (slackCollectionExist == false) {
            list.append('<span class="dropdown-item open-lasso-teampage" data-domain="setupIntegrationLink" style="padding-top:1px;padding-bottom:1px;padding-left:6px;padding-right:6px;cursor:pointer;font-weight: bold; color: #333 !important;">Setup other integrations  </span>');
        } else {
            var addedDomains = new Array();
            $.each(collectionList.userLists, function (key, val) {

                if (val.isSlackMapped == true) {
                    if ($.inArray(val.slackTeamDomain, addedDomains) == -1) {
                        addedDomains.push(val.slackTeamDomain);
                        list.append('<a class="dropdown-item" data-domain="' + val.slackTeamDomain + '" style="padding-top:1px;padding-bottom:1px;padding-left:6px;cursor:pointer;">Save to Slack: <span style="font-size: 12px;">' + val.slackTeamDomain + ' </span></a>');
                    }
                }
            });
            list.append('<span class="dropdown-item open-lasso-teampage" data-domain="setupIntegrationLink" style="padding-top:1px;padding-bottom:1px;padding-left:6px;padding-right:6px;cursor:pointer;font-weight: bold; color: #333 !important;">Setup other integrations  </span>');

        }

    }
    function populateLassoCollections() {
        var list = $(".channel-item-options .dropdown-menu");
        $(list).empty();
        list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:6px;font-weight: normal; color: #000 !important;">Select a Collection</span>');
        list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;;padding-left:6px;font-weight: normal; color: #000 !important;">My Collections</span>');
        $.each(collectionList.userLists, function (key, val) {
            if (val.isSharedList == false && val.isTeamList == false) {
                list.append('<a class="dropdown-item lasso-collection" data-id="' + val.listId + '" style="text-transform: lowercase;padding-top:1px;padding-bottom:1px;padding-left:20px;cursor:pointer;font-size: 13px;"">' + val.listTitle + '</a>');
            }
        });

        var prevOwner = '';
        //sometime the team contains all slack collections and we don't display the team header in that case. This variable is to control that behavior
        var isFirstEntryInTeam = false;
        $.each(collectionList.userLists, function (key, val) {
            if (val.isTeamList == false) {
                return;
            }
            if (prevOwner != val.owner) {
                var teamName = val.owner.split(" - ")[1];
                isFirstEntryInTeam = true;
                prevOwner = val.owner;
            }
            if (val.isSlackMapped == false) {
                if (isFirstEntryInTeam == true) {
                    list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:6px;font-weight: normal; color: #000 !important;">team ' + teamName + '</span>');
                    isFirstEntryInTeam = false;
                }
                list.append('<a class="dropdown-item lasso-collection" data-id="' + val.listId + '" style="text-transform: lowercase;padding-top:1px;padding-bottom:1px;padding-left:20px;cursor:pointer;font-size: 13px;"">' + val.listTitle + '</a>');
            }
        });

        prevOwner = '';
        $.each(collectionList.userLists, function (key, val) {
            if (val.isSharedList == false) {
                return;
            }
            if (prevOwner != val.owner) {
                list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:6px;font-weight: normal; color: #000 !important;">Shared by ' + val.owner + '</span>');
                prevOwner = val.owner;
            }
            list.append('<a class="dropdown-item lasso-collection" data-id="' + val.listId + '" style="text-transform: lowercase; padding-top:1px;padding-bottom:1px;padding-left:20px;cursor:pointer;font-size: 13px;"">' + val.listTitle + '</a>');
        });

        list.append('<span class="dropdown-item add-collection" style="padding-top:1px;padding-bottom:1px;;padding-left:6px;font-weight: bold; color: #333 !important;cursor:pointer;">Add a collection</span>');
        var lastAccessId = Cookies.get('lastAccessedLassoCollection');
        if (lastAccessId && $('a[data-id="' + lastAccessId + '"]').length > 0) {
            $('a[data-id="' + lastAccessId + '"]').click()
        } else if (collectionList.defaultListId) {
            if ($('a[data-id="' + collectionList.defaultListId + '"]').length > 0) {
                $('a[data-id="' + collectionList.defaultListId + '"]').click()
            } else {
                var htmlText = 'Select a collection' + ' <span class="caret"></span>';
                $(".channel-item-options .dropdown-menu").closest('.dropdown').find('.dropdown-toggle').html(htmlText);
            }
        }
        integrationChannelSelection = 'lasso';
    }

    function populateLassoSlackCollections(domain) {
        var list = $(".channel-item-options .dropdown-menu");
        $(list).empty();
        list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:6px;font-weight: normal; color: #000 !important;">Select a channel</span>');

        var prevOwner = '';
        var isFirstEntryInTeam = false;
        $.each(collectionList.userLists, function (key, val) {
            if (val.isTeamList == false) {
                return;
            }
            if (prevOwner != val.owner) {
                var teamName = val.owner.split(" - ")[1];
                isFirstEntryInTeam = true;
                prevOwner = val.owner;
            }
            if (val.isSlackMapped == true && val.slackTeamDomain == domain) {
                if (isFirstEntryInTeam == true) {
                    list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:6px;font-weight: normal; color: #000 !important;">team ' + teamName + '</span>');
                    isFirstEntryInTeam = false;
                }
                val.listTitle = val.listTitle.replace('(Slack)', '');
                list.append('<a class="dropdown-item slack-collection" data-domain="' + domain + '" data-id="' + val.listId + '" style="text-transform: lowercase;padding-top:1px;padding-bottom:1px;padding-left:20px;cursor:pointer;font-size: 13px;"">' + val.listTitle + '</a>');
            }
        });
        var lastAccessId = Cookies.get('lastAccessedSlackCollection-'+domain);
        if (lastAccessId && $('a[data-id="' + lastAccessId + '"]').length > 0) {
            $('a[data-id="' + lastAccessId + '"]').click()
        } else if (collectionList.defaultListId) {
            if ($('a[data-id="' + collectionList.defaultListId + '"]').length > 0) {
                $('a[data-id="' + collectionList.defaultListId + '"]').click();
            } else {
                var htmlText = 'Select a channel' + ' <span class="caret"></span>';
                $(".channel-item-options .dropdown-menu").closest('.dropdown').find('.dropdown-toggle').html(htmlText);
            }
        }
        integrationChannelSelection = 'slack';
    }

    /**
     *   Based on reopen button click Iframe of add item will be loaded
     */
    $("#reopenLink").click(function (e) {
        e.preventDefault();
        $("#loader").show();
        //$('#MainPopupIframe').attr("src", serverUrlBasePath + "/go/lasso/add-item?login=true&app=1&url=" +window.location.href);
        $("#reopenMessageHeaderContent").hide();
		$("#reopenMessageHeaderContentFromAdd").hide();
		showLassoAddItemInFrame();
    });
	
	$("#reopenLinkOther").click(function (e) {
        e.preventDefault();
        $("#loader").show();
        //$('#MainPopupIframe').attr("src", serverUrlBasePath + "/go/lasso/add-item?login=true&app=1&url=" +window.location.href);
        $("#reopenMessageHeaderContent").hide();
		$("#reopenMessageHeaderContentFromAdd").hide();
		showLassoAddItemInFrame();
    });
	
	$("#closeWindow").click(function(){
		window.close();
	});
    /**
     *   Based on login button click Iframe of login will be loaded
     */
    $("#loginLink").click(function (e) {
        e.preventDefault();
        $("#loader").show();
        $('#MainPopupIframe').attr("src", serverUrlBasePath + "/go/lasso/add-item?login=true&app=1&url=" + window.location.href);
        $("#welcomeMessageHeaderContent").hide();
    });

    /**
     *   Based on signup button click Iframe of signup will be loaded
     */
    $("#signupLink").click(function (e) {
        e.preventDefault();
        $("#loader").show();
        $('#MainPopupIframe').attr("src", serverUrlBasePath + "/go/register-BMV?app=1&url=" + window.location.href);
        $("#welcomeMessageHeaderContent").hide();
    });

    $(".logoutBtn").click(function (e) {
        e.preventDefault();
        $("#loader").show();
        $('#MainPopupIframe').attr("src", serverUrlBasePath + "/go/logout?url=" + window.location.href);
        logoutButtonClick = true;
    });


    $('.integration-channel-dropdown .dropdown-menu').on('click', 'a', function () {
        var domain = $(this).data("domain");
        if (domain) {
            if (domain == 'saveToLasso') {
                populateLassoCollections();
            } else {
                populateLassoSlackCollections(domain);
            }
            Cookies.set("integration-option-cookie", domain);
        }
    });

    $('.integration-channel-dropdown .dropdown-menu').on('click', 'span', function () {
        if ($(this).hasClass("open-lasso-teampage")) {
            window.open(serverUrlBasePath + '/go/lasso/team-settings?source=capture&type=slack', '_blank');
        }
    });


    $('.channel-item-options .dropdown-menu').on('click', 'a', function () {
        selectedCollection = $(this).data("id");
        if ($(this).hasClass('lasso-collection', )) {
            Cookies.set('lastAccessedLassoCollection', $(this).data("id"));
        } else if ($(this).hasClass('slack-collection', )) {
            var domain = '';
            if ($(this).data("domain")) {
                domain = $(this).data("domain");
            }
            Cookies.set('lastAccessedSlackCollection-' + domain, $(this).data("id"));
        }
    });

    $('.dropdown-menu').on('click', 'a', function () {
        var text = $(this).html();
        var htmlText = text + ' <span class="caret"></span>';
        $(this).closest('.dropdown').find('.dropdown-toggle').html(htmlText);
    });

    $(".saveScreenshotBtn").click(function (e) {
        e.preventDefault();
        var title = $("#titleTextbox").val();
        var data = new FormData();
        var imagedata = getImageData();
        $("#loader").show();
        //if (selectedCollection == -1) {
        //    alert('Please select collection');
        //    return;
        //}
        var apiAction = 'screenshot-add-item'
        //$("#success-alert").text("Saved to Lasso");
        if (integrationChannelSelection == 'slack') {
            apiAction = 'screenshot-send-to-slack';
            $("#success-alert").text("Saved to Slack");

        }
        var viewPort = viewport();
        var browerName = 'Chrome';
		var resourceRefId = $("#resourceRefId").val();
		var actionType = $("#actionType").val();

        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: serverUrlBasePath + "/go/api?action=" + apiAction,
            data: jQuery.param({
                title: title, screenshotImageBase64: imagedata, listId: selectedCollection, url: screenshot.url,
                zoomLevel: screenshot.browserProperties.zoomLevel,
                chromeVersion: browerName + ' ' + screenshot.browserProperties.chromeVersion,
                screenSize: screenshot.browserProperties.screenSize,
                osVersion: screenshot.browserProperties.osVersion,
                pixelRatio: screenshot.browserProperties.pixelRatio,
                viewport: viewPort, resourceRefId: resourceRefId, actionType: actionType
            }),
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            // contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {
                $("#loader").hide();
                //$("#success-alert").fadeTo(1000, 500).slideUp(1, function () {
                    //$("#success-alert").slideUp(500);
                //});
                $("#titleTextbox").val('');
                console.log("SUCCESS : ", data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("failed ! Status: " + textStatus);
                console.log("Error: " + errorThrown);
            }
        });
    });


    $('.channel-item-options .dropdown-menu ').on('click', '.add-collection', function () {
        openAddImageModal();
    });


    function openAddCollectionModal() {
        $("#loader").show();
        $("#collectionNameText").val('');
        var list = $(".collection-grouping-options .dropdown-menu");
        $(list).empty();
        list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:2px;font-weight: bold;">Personal</span>');
        list.append('<a class="dropdown-item" data-id="0"  style="padding-top:1px;padding-bottom:1px;padding-left:10px;cursor:pointer;">My Collections</a>');

        $.get(serverUrlBasePath + "/go/api?action=retrieve-user-groups-and-corral-types")
            .done(function (response) {
                if (response.response.data.teams) {
                    var teams = JSON.parse(response.response.data.teams);
                    if (teams.length > 0) {
                        list.append('<span class="dropdown-item" style="padding-top:1px;padding-bottom:1px;padding-left:2px;font-weight: bold;">Team</span>');
                        $.each(teams, function (key, val) {
                            list.append('<a class="dropdown-item" data-id="' + val.teamId + '" style="padding-top:1px;padding-bottom:1px;padding-left:10px;cursor:pointer;font-size: 13px;">' + val.teamName + ' team</a>');
                        });
                    }
                }

                list = $(".corral-type-options .dropdown-menu");
                $(list).empty();
                var firstKey = '';
                $.each(response.response.data.corralTypes, function (key, value) {
                    if (value == 'Screenshots') {
                        firstKey = key;
                    }
                    list.append('<a class="dropdown-item" data-id="' + key + '" style="padding-top:1px;padding-bottom:1px;padding-left:10px;font-size: 13px;">' + value + '</a>');
                });

                $("#myModal").modal({ backdrop: 'static', keyboard: false });
                $('a[data-id="0"]').click()
                $('a[data-id="' + firstKey + '"]').click()

                $("#loader").hide();
            }).fail(function () {
                console.log('error');
            });
    }

    var selectedGroup = -1;
    var selectedCorralType = -1;
    $('.collection-grouping-options .dropdown-menu').on('click', 'a', function () {
        selectedGroup = $(this).data("id");
    });
    $('.corral-type-options .dropdown-menu').on('click', 'a', function () {
        selectedCorralType = $(this).data("id");
    });

    $("#addCollectionBtn").click(function (e) {
        e.preventDefault();
        var data = new FormData();
        if ($("#collectionNameText").val() == '') {
            alert("Please enter collection name");
            return;
        }
        $("#loader").show();
        $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: serverUrlBasePath + "/go/api?action=lasso-add-project",
            headers: {
                "Accept": "application/json"
            },
            data: jQuery.param({ projectName: $("#collectionNameText").val(), teamId: selectedGroup, projectTypeId: selectedCorralType }),
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            timeout: 600000,
            success: function (data) {
                showLassoIntegrationInput();
                $("#myModal").modal('hide');
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert("failed ! Status: " + textStatus);
                console.log("Error: " + errorThrown);
            }
        });
    });

    function openAddImageModal() {
        $("#myModalImage").show();
    }
	
    function viewport() {
        var myWidth = 0, myHeight = 0;
        var viewportWidth = $(window).width();
        var viewportHeight = $(window).height();
        return viewportWidth + 'x' + viewportHeight;

        /* var myWidth = 0, myHeight = 0;
         if (typeof (window.innerWidth) == 'number') {
             //Non-IE
             myWidth = window.innerWidth;
             myHeight = window.innerHeight;
         } else if (document.documentElement &&
             (document.documentElement.clientWidth
                 || document.documentElement.clientHeight)) {
             //IE 6+ in 'standards compliant mode'
             myWidth = document.documentElement.clientWidth;
             myHeight = document.documentElement.clientHeight;
         } else if (document.body &&
             (document.body.clientWidth
                 || document.body.clientHeight)) {
             //IE 4 compatible
             myWidth = document.body.clientWidth;
             myHeight = document.body.clientHeight;
         }
         return myWidth +'x'+myHeight;*/
    }
});

