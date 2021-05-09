xr = {}

;(function() {

    xr.loadImage = function loadImage(url) {
        return new Promise(function(resolve) {
            var image = new Image()
            image.onload = function() { resolve(image) }
            image.src = url
        })
    }
    
    xr.randomizeColor = function randomizeColor(base, amount) {
        var randomized = base.slice(0)
        randomized[0] += (1 - 2 * Math.random()) * amount
        randomized[1] += (1 - 2 * Math.random()) * amount
        randomized[2] += (1 - 2 * Math.random()) * amount
        return randomized
    }
    
    xr.randomVerticalRectangleSplit = function randomVerticalRectangleSplit(x1, y1, totalW, totalH, randRatio) {
        var x2 = x1 + totalW
        var y2 = y1 + totalH
    
        var rectangles = []
        var x = x1
        var y = y1
        while (y < y2) {
            var w = totalW
            var h = Math.round(Math.max(Math.min(totalH * Math.random() * randRatio, y2 - y), 1))
            rectangles.push([x, y, w, h])
            y += h
        }
    
        return rectangles
    }
    
    xr.rgbToString = function rgbToString (rgbArray) {
        return 'rgb(' + rgbArray[0] + ',' + rgbArray[1] + ',' + rgbArray[2] + ')'
    }

})()