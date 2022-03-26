const express=require("express");
const app=express();
const http=require('http');
const { ExpressPeerServer } = require('peer')

const PORT=process.env.PORT || 4000;


const server = http.createServer(app)

const peerServer = ExpressPeerServer(server, {
    path: '/videocall'
})

app.use('/peerjs', peerServer)

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

app.use(express.static('public'));


server.listen(PORT, ()=>{
    console.log("listening on port "+PORT);
});


const io=require('socket.io')(server);
io.on('connection', (socket)=>{
    console.log("client connected "+socket.id);
    socket.on('userMessage', (data)=>{
        io.sockets.emit('userMessage', data)
    });
    socket.on('userTyping', (data)=>{
        socket.broadcast.emit('userTying', data);
    });
});