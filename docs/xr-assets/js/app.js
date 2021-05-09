// TODO : promise polyfill
// TODO : fetch polyfill
var xrSiteContainer = document.querySelector('#xr-site')
var xrLogoCanvasModel = document.querySelector('#xr-logo-canvas-model')
var xrLogoCanvas = document.querySelector('#xr-logo-canvas')

var LOGO_URL = './xr-assets/xr-logo.png'
var SCRAMBLE = {
    rectWRatio: 0.005,
    rectHRatio: 0.2,
    baseBgColor: [68, 170, 60],
    bgColorRandomize: 50,
    logoAlpha: 0.3,
    scrollRatioIncrement: 0.02,
}
var CONTEXT = {
    logo: null,
    scrollRatio: 0,
    previousScrollRatio: -1,
    canvasModelCtx: xrLogoCanvasModel.getContext('2d'),
    canvasCtx: xrLogoCanvas.getContext('2d'),
    canvasRectanglesData: null,
}

function initializeCanvasDraw() {
    var rect = xrLogoCanvas.getBoundingClientRect()
    var width = rect.width
    var height = rect.height
    
    xrLogoCanvas.width = width
    xrLogoCanvas.height = height
    xrLogoCanvasModel.width = width
    xrLogoCanvasModel.height = height

    var rectWidth = Math.max(Math.round(width * SCRAMBLE.rectWRatio), 1)
    var rectanglesData = []
    for (var x = 0; x < width; x += rectWidth) {
        var cappedRectWidth = Math.min(rectWidth, width - x)
        var rectangles = xr.randomVerticalRectangleSplit(x, 0, cappedRectWidth, height, SCRAMBLE.rectHRatio)
        rectangles.forEach(function(rectangle) {
            var rgb = xr.randomizeColor(SCRAMBLE.baseBgColor, SCRAMBLE.bgColorRandomize)
            rectanglesData.push({
                rectangle: rectangle,
                rgb: rgb,
                scrollRatioThresh: Math.random()
            })
        })
    }
    CONTEXT.canvasRectanglesData = rectanglesData
    drawModelCanvas()

    rectanglesData.forEach(function(rectangleDatum) {
        rectangleDatum.imageData = CONTEXT.canvasModelCtx.getImageData.apply(CONTEXT.canvasModelCtx, rectangleDatum.rectangle)
    })
}

function drawModelCanvas() {
    CONTEXT.canvasRectanglesData.forEach(function(rectangleDatum) {
        var rectangle = rectangleDatum.rectangle
        var rgb = rectangleDatum.rgb
        CONTEXT.canvasModelCtx.fillStyle = xr.rgbToString(rgb)
        CONTEXT.canvasModelCtx.fillRect.apply(CONTEXT.canvasModelCtx, rectangle)
    })

    CONTEXT.canvasModelCtx.globalAlpha = SCRAMBLE.logoAlpha
    var logoSize = Math.min(xrLogoCanvas.width, xrLogoCanvas.height)
    CONTEXT.canvasModelCtx.drawImage(
        CONTEXT.logo, (xrLogoCanvas.width - logoSize) / 2, (xrLogoCanvas.height - logoSize) / 2, logoSize, logoSize)
    CONTEXT.canvasModelCtx.globalAlpha = 1.0
}

function refreshDrawingCanvas() {
    CONTEXT.canvasRectanglesData.forEach(function(rectangleDatum) {
        if (CONTEXT.scrollRatio < rectangleDatum.scrollRatioThresh || CONTEXT.previousScrollRatio > rectangleDatum.scrollRatioThresh) {
            return
        }
        var rectangle = rectangleDatum.rectangle
        CONTEXT.canvasCtx.putImageData(rectangleDatum.imageData, rectangle[0], rectangle[1])
    })
}

function onWindowResize() {
    initializeCanvasDraw()
}  

function initialize() {
    window.onresize = onWindowResize

    var initPromise = xr.loadImage(LOGO_URL)
        .then(function(image) {
            CONTEXT.logo = image
        })
        .then(function() {
            onWindowResize()
        })
    return initPromise
}


function onWheel() {
    CONTEXT.previousScrollRatio = CONTEXT.scrollRatio
    CONTEXT.scrollRatio += SCRAMBLE.scrollRatioIncrement
    refreshDrawingCanvas()
    if (CONTEXT.scrollRatio >= 1) {
        document.body.onwheel = undefined
        xrSiteContainer.setAttribute('class', 'scrolled')
    }
}

document.body.onwheel = onWheel

initialize()
    .then(function() {
        console.log('INITIALIZED')
    })