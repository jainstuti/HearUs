const socket=io();

const message=document.getElementById('message');
const handle=document.getElementById('handle');
const output=document.getElementById('output');
const button=document.getElementById('button');
const typing=document.getElementById('typing');

function updateScroll(){
    const chatWindow=document.getElementById('chat-window') ;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
function updateScrollGeneral(el){
  // const el=document.getElementById(id) ;
  el.scrollTop = el.scrollHeight;
}

button.addEventListener('click', (e)=>{
    e.preventDefault();
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    })
    message.value="";
    // typing.innerHTML="";
})

message.addEventListener('keypress', ()=>{
    socket.emit('userTyping', handle.value);
});

socket.on('userMessage', (data)=>{
    if(data.handle===handle.value){
    var right=document.createElement('p');
    right.setAttribute("id", "left");
    right.style.backgroundColor = 'hsl(120, 64%, 79%)';
    right.style.textAlign="right";
        right.innerHTML="<strong>You:</strong> "+data.message;
    output.appendChild(right);
    }
    else{
    output.innerHTML += '<p><strong>'+ data.handle+': </strong>'+data.message+'</p>';
    }
    updateScroll();
})

socket.on('userTyping', (data)=>{
    typing.innerHTML='<p><em>'+ data+' is typing </em></p>'
})



const endCallButton = document.getElementById('endCall');
const lVideo=document.getElementById('lVideo');
const rVideo=document.getElementById('rVideo');
const callButton=document.getElementById('call_button');
const connectButton=document.getElementById('conn_button');
let mediaRecorder;
let recordedBlobs;
//--------------------video call feature----------------------

//get local media
const constraints={
    audio: true,
    video: true
}

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    lVideo.srcObject = stream;
    window.localstream=stream;
    window.peer_stream=stream;
  })
  .catch((err)=>{
    alert("cannot access your camera");
    console.log(err);
});

var conn;
var peer_id;
var currentPeer;
//create peer connection with peer obj i.e. set up a server to connect the two peers on video call
var peer=new Peer();

//display local id on DOM
peer.on('open', function(){
    document.getElementById('displayId').innerHTML=peer.id;
    // conn.on('data', function(data) {
    //     console.log('Received', data);
    //   });
})

peer.on('connection', function(connection){
    conn= connection;
    peer_id=connection.peer;
    document.getElementById('connId').value=peer_id;
})

peer.on('error', function(err){
    console.log("an error has occured "+err);
})
//connect with peer
connectButton.addEventListener('click', function(){
    peer_id=document.getElementById('connId').value;
    if(peer_id){
        conn=peer.connect(peer_id)
    }
    else{
        alert('enter an id');
        return false
    }
})

//accept call
peer.on('call', function(call){
    var acceptCall = true;

    if(acceptCall){
        console.log("inside ACCEPT CALL");
        call.answer(window.localstream);
        call.on('stream', function(stream){
            console.log("inside CALL");
            currentPeer=call.peerConnection;
            console.log("current peer is : ");
            console.log(currentPeer);
            window.peer_stream=stream;
            rVideo.srcObject=stream;
        });
    }
    else{
        console.log("call denied");
    }
})

peer.on('destroyed', ()=>{
    console.log("destroy");
})

//initiate call
callButton.addEventListener('click', function(){
    console.log("calling peer: "+peer_id);
    console.log(peer);
    var call=peer.call(peer_id, window.localstream);

    call.on('stream', function(stream){
        window.peer_stream=stream;
        rVideo.srcObject=stream;
        currentPeer=call.peerConnection;
    })
})

//end call
endCallButton.addEventListener('click', function (){
    // conn.close();
    peer.destroy();
})


