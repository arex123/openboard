const express = require('express');
const socket = require('socket.io');

const app = express()
app.use(express.static("public")); //automatically it will render index.html 

const port = process.env.PORT || 5000;
let server = app.listen(port,()=>{
    console.log("Listening to port "+port);
})

let io = socket(server);
io.on("connection",(socket)=>{
    console.log("Made socket connection");


    //receiving data from frontend
    socket.on("beginPath",(data) => {
        //Now send data to all connected computer
        io.sockets.emit("beginPath",data);
    })

    socket.on("drawStroke",(data)=>{
        io.sockets.emit("drawStroke",data);
    })

    socket.on("reduundo",(data)=>{
        io.sockets.emit("reduundo",data);
    })
})