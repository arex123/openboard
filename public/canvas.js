let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redu = document.querySelector(".redu");
let undo = document.querySelector(".undo");


let penColor = "black";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = [];
let track = 0;

// API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

let mouseDown = false;
//mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // })
    let data = {
        x:e.clientX,
        y:e.clientY
    }
    socket.emit("beginPath",data); //sending data to server
})

canvas.addEventListener("mousemove",(e) =>{
    if(mouseDown) {
        // drawStroke({
            //     x:e.clientX,
            //     y: e.clientY
            //    ,color: eraserFlag ? eraserColor : penColor,
            //     width: eraserFlag ? eraserWidth : penWidth
            // })
            let data = {
                x:e.clientX,
                y: e.clientY
               ,color: eraserFlag ? eraserColor : penColor,
                width: eraserFlag ? eraserWidth : penWidth
            }
            socket.emit("drawStroke",data);
    }
})

canvas.addEventListener("mouseup",(e)=>{
    mouseDown = false;


    //storing data for undo redu
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

//redu-undo

undo.addEventListener("click", (e) =>{
    if(track > 0) track--;
      // take action
      let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("reduundo",data);
})

redu.addEventListener("click", (e) =>{
    if(track < undoRedoTracker.length - 1) track++; 

    // take action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("reduundo",data);

})

function undoRedoCanvas(trackObj){
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;

    let url = undoRedoTracker[track];
    let img = new Image(); //new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}


function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj){
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) =>{
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e)=>{
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

eraserWidthElem.addEventListener("change",(e)=>{
    eraserWidth = eraserWidthElem.value;
})

eraser.addEventListener("click",(e)=>{
    if(eraserFlag){
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserColor;
    }else{
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) =>{
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})


//receiving data from server
socket.on("beginPath",(data)=>{
    beginPath(data);
} )

socket.on("drawStroke",(data)=>{
    drawStroke(data);
})

socket.on("reduundo",(data)=>{
    undoRedoCanvas(data);
})