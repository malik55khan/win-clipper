

chrome.runtime.onMessage.addListener(function (data, sender, callback) { 
    chrome.tabs.query({}, (tabs) => {
        
        let tab = tabs.find(tab => tab.url.startsWith("http"));
        chrome.tabs.sendMessage(tab.id,data);
    });
})
chrome.storage.local.get((storage) => {
    

    var canvas = new fabric.Canvas('annotate-canvas');
    var colorToUse = "#000000";
    var currentObjectToDraw;
    var redoObjects = [];
    var deltaX, deltaY, line, tringle, currentActiveDrawingObj;
    canvas.selection = false;
    var canvasImageContainsSelectedAreaCapture = false;
    var textPaddingTopBottom = 8;
    var textPaddingLeftRight = 10;
    $(function () {
        
        fabric.Image.fromURL(storage.dataURL, function (img) {
            canvasImageContainsSelectedAreaCapture = false;
            //fabric.Image.fromURL("screenshot.png", function (img) {
            // debugger;
            console.log("Image-width: " + img.width + " Window: " + window.innerWidth);
            var widthToConsider = 1000;
            if (window.innerWidth) {
                widthToConsider = window.innerWidth * 1;
                //The reason behind -30 is, sometime its observed that image width is coming 15px lesser than window width inside visible capture. So in that case, image went to small 80%
                if (img.width < window.innerWidth - 30) {
                    widthToConsider = img.width * 0.8;
                    //           canvasImageContainsSelectedAreaCapture = true;
                }
            }

            $(".editContainer").css("max-width", widthToConsider);
            canvas.setHeight(img.height * widthToConsider / img.width);
            canvas.setWidth(widthToConsider);

            if (!canvasImageContainsSelectedAreaCapture) {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height
                });
            } else {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: 0.8,
                    scaleY: 0.8
                });
            }
            canvas.renderAll();
        });
    
    });

    canvas.on('object:added', (e) => {
        $(".button.undo").css("pointer-events", "auto");
    });

    canvas.on('object:scaling', (e) => {
        var o;
        if (e.target.getObjects) {
            o = e.target.getObjects()[1];
        } else {
            o = e.target;
        }
        console.log(o.strokeWidthUnscaled + " " + o.strokeWidth + " " + o.scaleX);
        if (!o.strokeWidthUnscaled && o.strokeWidth) {
            o.strokeWidthUnscaled = o.strokeWidth;
        }
        if (o.strokeWidthUnscaled) {
            o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
        }
    })

    function updateModifications(savehistory) {
        if (savehistory === true) {
            myjson = JSON.stringify(canvas);
            console.log(myjson);

        }
    }

    $('.button.rectangle').click(function () {
        $('.button').removeClass("active");
        $(this).addClass("active");
        currentObjectToDraw = "rectangle"
    });

    $('.button.oval').click(function () {
        $('.button').removeClass("active");
        $(this).addClass("active");
        currentObjectToDraw = "oval";
    });

    $('.button.text').click(function () {
        $('.button').removeClass("active");
        $(this).addClass("active");
        currentObjectToDraw = "text";

    });


    $('.button.arrow').click(function () {
        $('.button').removeClass("active");
        $(this).addClass("active");
        currentObjectToDraw = "arrow";

    });


    function getArrow(x, y) {
        var points = [x, y, x, y];
        line = new fabric.Line(points, {
            strokeWidth: 3,
            fill: colorToUse,
            stroke: colorToUse,
            originX: 'center',
            originY: 'center',
            id: 'arrow_line',
            uuid: generateUUID(),
            type: 'arrow'
        });
        var centerX = (line.x1 + line.x2) / 2;
        var centerY = (line.y1 + line.y2) / 2;
        deltaX = line.left - centerX;
        deltaY = line.top - centerY;

        triangle = new fabric.Triangle({
            left: line.get('x1') + deltaX,
            top: line.get('y1') + deltaY,
            originX: 'center',
            originY: 'center',
            selectable: false,
            pointType: 'arrow_start',
            angle: -45,
            width: 20,
            height: 20,
            fill: colorToUse,
            id: 'arrow_triangle',
            uuid: line.uuid
        });
        currentActiveDrawingObj = line;

    }

    var TextboxWithPadding = fabric.util.createClass(fabric.IText, {
        _renderBackground: function (ctx) {
            if (!this.backgroundColor) {
                return;
            }
            var dim = this._getNonTransformedDimensions();
            ctx.fillStyle = this.backgroundColor;
            // alert((-dim.x / 2 - textPaddingLeftRight) +" "+
            //      ( -dim.y / 2 - textPaddingTopBottom) +" "+
            //      ( dim.x + textPaddingLeftRight * 2) +" "+
            //      (dim.y + textPaddingTopBottom * 2));
            ctx.fillRect(
                -dim.x / 2 - textPaddingLeftRight,
                -dim.y / 2 - textPaddingTopBottom,
                dim.x + textPaddingLeftRight * 2,
                dim.y + textPaddingTopBottom * 2
            );
            // if there is background color no other shadows
            // should be casted
            this._removeShadow(ctx);
        }
    });

    function getText(x, y) {

        var text = new TextboxWithPadding('Doubleclick and type', {
            fontFamily: 'Avenir-Book',
            fontSize: 20,
            fontWeight: 'bold',
            left: x,
            top: y,
            fill: colorToUse,
            backgroundColor: "#FFFF99",
            showTextBoxBorder: true,
            textboxBorderColor: 'black'

        });
        text.on('mousedblclick', function (options) {
            if (options.target && options.target.text && options.target.text == 'Doubleclick and type') {
                options.e.preventDefault();
                this.selectLine(this.getSelectionStartFromPointer(options.e));
                options.e.preventDefault();
                this.selectLine(this.getSelectionStartFromPointer(options.e));
            }
        
        });
        return text;

    }
    function getRectangle(x, y) {
        var rect = new fabric.Rect({
            left: x,
            top: y,
            width: 0,
            height: 0,
            stroke: colorToUse,
            strokeWidth: 3,
            angle: 0,
            padding: 10,
            fill: 'transparent'
        });
        currentActiveDrawingObj = rect;
        return rect;
    }

    function getOval(x, y) {
        var oval = new fabric.Ellipse({
            left: x,
            top: y,
            originX: 'left',
            originY: 'top',
            rx: 0,
            ry: 0,
            angle: 0,
            fill: 'transparent',
            stroke: colorToUse,
            strokeWidth: 3,
        });
        currentActiveDrawingObj = oval;
        return oval;
    }

    canvas.observe('mouse:down', function (e) { mousedown(e); });
    canvas.observe('mouse:move', function (e) { mousemove(e); });
    canvas.observe('mouse:up', function (e) { mouseup(e); });

    var started = false;
    var drawingStartX = 0;
    var drawingStartY = 0;

    /* Mousedown */
    function mousedown(e) {
        if (!currentObjectToDraw) {
            return;
        }
        started = true;
        drawingStartX = e.absolutePointer.x;
        drawingStartY = e.absolutePointer.y;

        var drawingObject;
        if (currentObjectToDraw == 'rectangle') {
            drawingObject = getRectangle(drawingStartX, drawingStartY);
        } else if (currentObjectToDraw == 'oval') {
            drawingObject = getOval(drawingStartX, drawingStartY);
        } else if (currentObjectToDraw == 'text') {
            drawingObject = getText(drawingStartX, drawingStartY);
            drawingObject.setShadow({
                color: "#b0b0b0",
                blur: 7,
                offsetX: 2,
                offsetY: 2
            });
        } else if (currentObjectToDraw == 'arrow') {
            getArrow(drawingStartX, drawingStartY);
            canvas.add(line, triangle);
        }

        if (currentObjectToDraw && currentObjectToDraw != 'arrow') {
            canvas.add(drawingObject);
            canvas.renderAll();
            // canvas.setActiveObject(drawingObject);
        }

    }


    /* Mousemove */
    function mousemove(e) {
        if (!started) {
            return;
        }

        currentX = e.absolutePointer.x;
        currentY = e.absolutePointer.y;
        var drawingObject = currentActiveDrawingObj;
        if (currentObjectToDraw == 'oval') {
            freeDrawingMouseMoveOval(drawingObject, currentX, currentY);
        } else if (currentObjectToDraw == 'rectangle') {
            var w = Math.abs(currentX - drawingStartX),
                h = Math.abs(currentY - drawingStartY);
            drawingObject.set('width', w).set('height', h);
        } else if (currentObjectToDraw == 'arrow') {
            line.set({
                x2: currentX,
                y2: currentY
            });
            triangle.set({
                'left': currentX + deltaX,
                'top': currentY + deltaY,
                'angle': _FabricCalcArrowAngle(line.x1,
                    line.y1,
                    line.x2,
                    line.y2)
            });
        }
        canvas.renderAll();

    }

    /* Mouseup */
    function mouseup(e) {
        if (started) {
            started = false;
        } else {
            return;
        }

        if (currentObjectToDraw == 'arrow') {
            var group = new window.fabric.Group([line, triangle], {
                borderColor: 'black',
                cornerColor: 'green',
                lockScalingFlip: true,
                typeOfGroup: 'arrow',
                userLevel: 1,
                name: 'my_ArrowGroup',
                uuid: currentActiveDrawingObj.uuid,
                type: 'arrow'
            });
            canvas.remove(line, triangle);// removing old object
            currentActiveDrawingObj = group;
            canvas.add(group);


        }
        var objs = canvas.getObjects();
        for (var i = 0; i < objs.length; i++) {
            objs[i].setCoords();
        }
        currentObjectToDraw = null;
        $('.button').removeClass("active");
    }

    function freeDrawingMouseMoveOval(drawingObject, currentX, currentY) {
        var rx = Math.abs(drawingStartX - currentX) / 2;
        var ry = Math.abs(drawingStartY - currentY) / 2;
        var drawingObject = currentActiveDrawingObj;

        if (rx > drawingObject.strokeWidth) {
            rx -= drawingObject.strokeWidth / 2
        }
        if (ry > drawingObject.strokeWidth) {
            ry -= drawingObject.strokeWidth / 2
        }
        drawingObject.set({ rx: rx, ry: ry });

        if (drawingStartX > currentX) {
            drawingObject.set({ originX: 'right' });
        } else {
            drawingObject.set({ originX: 'left' });
        }
        if (drawingStartY > currentY) {
            drawingObject.set({ originY: 'bottom' });
        } else {
            drawingObject.set({ originY: 'top' });
        }

    }

    $('.button.undo').click(function () {
        if (canvas.getObjects().length == 0) {
            //disable buttons
            return;
        }
        var toUndo = canvas.getObjects()[canvas.getObjects().length - 1];
        canvas.remove(toUndo);
        redoObjects.push(toUndo);
        $(".button.redo").css("pointer-events", "auto");
        if (canvas.getObjects().length == 0) {
            $(this).css("pointer-events", "none")
        }
    });

    $('.button.redo').click(function () {
        if (redoObjects.length == 0) {
            return;
        }
        var toRedo = redoObjects.pop();
        canvas.add(toRedo);
        if (redoObjects.length == 0) {
            $(this).css("pointer-events", "none")
        }

    });
    $('.browse-image').click(function () {
        $("#myModalImage").show();
    });
    var imageLoader = document.getElementById('uploddImageTag');

    if (typeof imageLoader !== 'undefined' && imageLoader != null)
        imageLoader.addEventListener('change', handleImage, false);
    function handleImage(e) {
        $("#myModalImage").hide();
        var img;
        var reader = new FileReader();
        reader.onload = function (event) {
            var data = event.target.result;
            fabric.Image.fromURL(data, function (img) {
			
                canvasImageContainsSelectedAreaCapture = false;
                console.log("Image-width: " + img.width + " Window: " + window.innerWidth);
                var widthToConsider = 1000;
			
                if (window.innerWidth) {
                    widthToConsider = window.innerWidth * 1;
                    //The reason behind -30 is, sometime its observed that image width is coming 15px lesser than window width inside visible capture. So in that case, image went to small 80%
                    if (img.width < window.innerWidth - 30) {
                        widthToConsider = img.width * 0.8;
                    }
                }
			
                $(".editContainer").css("max-width", widthToConsider);
                canvas.setHeight(img.height * widthToConsider / img.width);
                canvas.setWidth(widthToConsider);
			
                if (!canvasImageContainsSelectedAreaCapture) {
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                        scaleX: canvas.width / img.width,
                        scaleY: canvas.height / img.height
                    });
                } else {
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                        scaleX: 0.8,
                        scaleY: 0.8
                    });
                }
                canvas.renderAll();
                $('#annotate-canvas').show();
                $('.upper-canvas').show();
            });
		  
       
        }
        reader.readAsDataURL(e.target.files[0]);
    }
    $('#colorPickerButton').click(function () {
        $("#colorPickerButton").addClass('active');
        if ($("#colorPickerExpansionDiv").is(':hidden')) {
            $("#colorPickerExpansionDiv").show();
        } else {
            $("#colorPickerExpansionDiv").hide();
        }

    });
    $('.choose-color').click(function () {
        colorToUse = $(this).data('colorcode');
        $("#colorPickerButton").css("background-color", colorToUse);
        $("#colorPickerExpansionDiv").hide();
        $("#colorPickerButton").removeClass('active');

    });

    $('html').keyup(function (e) {
        var selection = canvas.getActiveObject();
        if (selection && selection.type == 'i-text' && selection.isEditing) {
            //no need to remove as delete key is pressed in text editing
            return;
        }
        if (e.keyCode == 46) {
            deleteSelectedObjectsFromCanvas();
        }
    });

    function deleteSelectedObjectsFromCanvas() {
        var selection = canvas.getActiveObject();
        if (selection.type === 'activeSelection') {
            selection.forEachObject(function (element) {
                canvas.remove(element);
            });
        }
        else {
            canvas.remove(selection);

        }
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }



    ////////////////////////////////////////////////////////////////////////////////////////////////
    //External Plugin start
    /////////////////////////////////////////////////////////////////////////////////////////////////

    $('.save-to-clipboard').on('click', function (e) {
        var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        var version = raw ? parseInt(raw[2], 10) : false;
        if (version && version >= 76) {
            navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
                if (result.state === 'granted') {
                    var imgData;
                    if (canvasImageContainsSelectedAreaCapture) {
                        imgData = canvas.toDataURL({
                            format: 'png',
                            multiplier: 1.2
                        });
                    } else {
                        imgData = canvas.toDataURL({
                            format: 'png',
                            multiplier: canvas.backgroundImage.width / canvas.width
                        });
                    }

                    var strDataURI = imgData.substr(22, imgData.length);
                    var blob = dataURLtoBlob(imgData);
                    var item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(function () {

                    }, function (error) {
                        // console.error("unable to write to clipboard. Error:");
                        console.log(error.message);
                        clipboardCopyLegacy(scope);
                    });
                } else {
                    console.log("clipboard-permissoin not granted: " + result);
                    clipboardCopyLegacy(scope);
                }
            });
        } else {
            clipboardCopyLegacy(scope);
        }

    });

    $('.save').on('click', function (e) {
        downloadCanvas();
    });

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    function downloadCanvas() {
        var link = document.createElement("a");
        var imgData;
        if (canvasImageContainsSelectedAreaCapture) {
            imgData = canvas.toDataURL({
                format: 'png',
                multiplier: 1.2
            });
        } else {
            imgData = canvas.toDataURL({
                format: 'png',
                multiplier: canvas.backgroundImage.width / canvas.width
            });
        }
        var strDataURI = imgData.substr(22, imgData.length);
        var blob = dataURLtoBlob(imgData);
        var objurl = URL.createObjectURL(blob);
        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "" + ("0" + (currentdate.getMonth() + 1)).slice(-2) + "" + ("0" + currentdate.getDate()).slice(-2) + "-"
            + ("0" + currentdate.getHours()).slice(-2)
            + ("0" + currentdate.getMinutes()).slice(-2)
            + ("0" + currentdate.getSeconds()).slice(-2);
        var filename;
        filename = datetime + '-lasso-screenshot.png';
        link.download = filename;
        link.href = objurl;
        link.click();
    }


    function clipboardCopyLegacy(scope) {
        var image = scope.image_base64()
        mod = $('<div style=z-index:10000000000000;position:fixed;width:100%;top:5%><center><span style="display:inline-block;background-color:white;padding:10px;border:1px solid black"><h2>Right click the image and choose "Copy Image"</h2><img style="max-width:80%;max-height:80%"></span></center></div>');
        $("img", mod).attr("src", 'data:image/png;base64,' + image);
        mod.appendTo(document.body);
        window.setTimeout(function () {
            $(document).one("click", function () {
                mod.remove()
            })
        }, 0)
    }

    var _FabricCalcArrowAngle = function (x1, y1, x2, y2) {
        var angle = 0, x, y;
        x = (x2 - x1);
        y = (y2 - y1);
        if (x === 0) {
            angle = (y === 0) ? 0 : (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
        } else if (y === 0) {
            angle = (x > 0) ? 0 : Math.PI;
        } else {
            angle = (x < 0) ? Math.atan(y / x) + Math.PI :
                (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
        }
        return (angle * 180 / Math.PI + 90);
    };
    function generateUUID() {
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }


    /**
     * Get the image data from canvas
     */
    function getImageData() {
        var imgData;
        if (canvasImageContainsSelectedAreaCapture) {
            imgData = canvas.toDataURL({
                format: 'png',
                multiplier: 1.2
            });
        } else {
            imgData = canvas.toDataURL({
                format: 'png',
                multiplier: canvas.backgroundImage.width / canvas.width
            });
        }
        return imgData;
    }
    $('.closeButtonUpload').click(function () {
        $("#myModalImage").hide();
    });
    var left = screen.width / 2 - 180;
    var topPx = screen.height / 3 - 105;
    $(".addCorralImage").css("left", left + "px");
    $(".addCorralImage").css("top", topPx + "px");
    if (typeof storage.screenshot.showPopup !== 'undefined' && storage.screenshot.showPopup == true) {
        $('.browse-image').click();
        $('#annotate-canvas').hide();
        $('.upper-canvas').hide();
    }
});