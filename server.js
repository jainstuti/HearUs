const express=require("express");
const app=express();
const http=require('http');
const { ExpressPeerServer } = require('peer')

const PORT=process.env.PORT || 4000;


const server = http.createServer(app)

const peerServer = ExpressPeerServer(server, {
    path: '/HearUs'
})

const path = require('path')
const multer = require('multer')
const { spawn } = require('child_process')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index', { videoPresent: false })
})

app.get('/asl', (req, res) => {
    res.render('asl', { videoPresent: false })
})

app.get('/aslpractice', (req, res) => {
    res.render('practice')
})


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.')[1])
    }
})
const upload = multer({ storage })
app.post('/upload', upload.single('userVideo'), async (req, res) => {
    const file = req.file
    const { filename } = file
    const name = filename.split('.')[0], extension = filename.split('.')[1]

    const python = spawn('python', ['./process_video.py', `${name}.${extension}`, `${name}.vtt`])
    python.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    python.on('exit', () => {
        console.log('Created subtitle')
        res.render('asl', { videoPresent: true, videoName: file.filename, subtitleName: `${name}.vtt` })
    })
})



app.use('/peerjs', peerServer)

app.get('/videocall', (req, res)=>{
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
