/**
 * Reference: https://github.com/shuding/apple-pencil-safari-api-test/blob/gh-pages/index.js
 */
const requestIdleCallback = window.requestIdleCallback || function (fn) { setTimeout(fn, 1) };
let canvas = null
let context = null
let lineWidth = 0
let isMousedown = false
let points = []

let clearFlag = false

const strokeHistory = []

export function initApplePencil(width, height) {
    canvas = document.querySelectorAll('canvas')[0]
    canvas.width = width
    canvas.height = height
    context = canvas.getContext('2d')

    // fill white
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'black'

    for (const ev of ["touchstart", "mousedown"]) {
        canvas.addEventListener(ev, function (e) {
            if (clearFlag) {
                strokeHistory.length = 0
                clearFlag = false
            }
            let pressure = 0.1;
            let x, y;
            const rect = e.target.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
                if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"]
                }
                x = e.touches[0].pageX
                y = e.touches[0].pageY
            } else {
                pressure = 1.0
            }
        
            isMousedown = true
        
            lineWidth = Math.log(pressure + 1) * 20 // Weber–Fechner law ?
            context.lineWidth = lineWidth// pressure * 50;
        
            points.push({ x, y, lineWidth })
            drawOnCanvas(points)
        })
      }
      
    for (const ev of ['touchmove', 'mousemove']) {
        canvas.addEventListener(ev, function (e) {
            if (clearFlag) {
                strokeHistory.length = 0
                clearFlag = false
            }
            if (!isMousedown) return
            e.preventDefault()
        
            let pressure = 0.1
            let x, y
            const rect = e.target.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
                if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"]
                }
                x = e.touches[0].pageX 
                y = e.touches[0].pageY
            } else {
                pressure = 1.0
            }
        
            // smoothen line width
            lineWidth = (Math.log(pressure + 1) * 20 * 0.2 + lineWidth * 0.8) // Weber–Fechner law ?
            points.push({ x, y, lineWidth })
        
            drawOnCanvas(points);
        })
    }
      
    for (const ev of ['touchend', 'touchleave', 'mouseup']) {
        canvas.addEventListener(ev, function (e) {
            if (clearFlag) {
                strokeHistory.length = 0
                clearFlag = false
            }
            let pressure = 0.1;
            let x, y;
            const rect = e.target.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
            if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
                if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"]
                }
                x = e.touches[0].pageX
                y = e.touches[0].pageY
            } else {
                pressure = 1.0
            }
        
            isMousedown = false
        
            requestIdleCallback(function () { strokeHistory.push([...points]); points = []})
        
            lineWidth = 0
        })
    };
}

/**
 * This function takes in an array of points and draws them onto the canvas.
 * @param {array} stroke array of points to draw on the canvas
 * @return {void}
 */
function drawOnCanvas (stroke) {
    context.strokeStyle = 'black'
    context.fillStyle = 'black'
    context.lineCap = 'round'
    context.lineJoin = 'round'

    const l = stroke.length - 1
    if (stroke.length >= 3) {
        const xc = (stroke[l].x + stroke[l - 1].x) / 2
        const yc = (stroke[l].y + stroke[l - 1].y) / 2
        context.lineWidth = stroke[l - 1].lineWidth
        context.quadraticCurveTo(stroke[l - 1].x, stroke[l - 1].y, xc, yc)
        context.stroke()
        context.beginPath()
        context.moveTo(xc, yc)
    } else {
        const point = stroke[l];
        context.lineWidth = point.lineWidth
        context.strokeStyle = point.color
        context.beginPath()
        context.moveTo(point.x, point.y)
        context.stroke()
    }
}

/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
export function undoDraw () {
    // if clear button was clicked just before undo button, then recover the canvas
    if(clearFlag){
        clearFlag = false
    } else {
        strokeHistory.pop()
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = 'white'
        context.fillRect(0, 0, canvas.width, canvas.height)
    }
    strokeHistory.map(function (stroke) {
        if (strokeHistory.length === 0) return

        context.beginPath()

        let strokePath = [];
        stroke.map(function (point) {
            strokePath.push(point)
            drawOnCanvas(strokePath)
        })
    })
}

/**
 * Clear the entire canvas
 * @return {void}
 */
export function clearDraw () {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    clearFlag = true
}

export function clearAll () {
    strokeHistory.length = 0
    clearDraw()
    clearFlag = false
}

export function getCanvasAsImage() {
    if (clearFlag) {
        return null
    }
    if (strokeHistory.length === 0) {
        return null
    }

    return canvas.toDataURL('image/png')
}