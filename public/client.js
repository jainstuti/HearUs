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
const muteCameraButton=document.getElementById('muteCamera');
const muteAudioButton=document.getElementById('muteAudio')
const shareScreenButton=document.getElementById('shareScreen')
const recordButton = document.getElementById("recordScreen");
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const blurBg=document.getElementById('blurBg' )
const recordedVideo = document.querySelector('video#recorded');
const playButton = document.querySelector('button#play');
const downloadButton = document.querySelector('button#download');
const getScreenStream=document.getElementById('getScreenStream');
let mediaRecorder;
let recordedBlobs;
const generateSubtitlesBtn=document.getElementById("start-subtitles-btn");
const subtitlesTextArea=document.getElementById('subtitles-textarea');
const ASLsubtitlesDisplay=document.getElementById('ASL-subtitles-display');
const englishSubtitlesBtn =document.getElementById("eng-subtitles-btn");

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
    unblurBtn.disabled = false;
    blurBtn.disabled = false;
  })
  .catch((err)=>{
    alert("cannot access your camera");
    console.log(err);
});

var conn;
var peer_id;
var currentPeer;
//create peer connection with peer obj i.e. set up a server to connect the two peers on video call
var peer=new Peer({
    host: 'hear-us-org.herokuapp.com',
    // port: "",
    // secure: true,
    path: '/peerjs/HearUs',
    configuration: {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
  });

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
    peer_id=document.getElementById('connId').value;
    if(peer_id){
        conn=peer.connect(peer_id)
    }
    else{
        alert('enter an id');
        return false
    }

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

//mute camera
muteCameraButton.addEventListener('click', ()=>{
    var vidTrack = window.localstream.getVideoTracks();
    vidTrack.forEach(track => track.enabled = !track.enabled);
    muteCameraButton.innerHTML=muteCameraButton.innerHTML===('<i class="fas fa-video-slash" aria-hidden="true"></i>' 
    || '<i class="fas fa-video-slash"></i>')?
     '<i class="fas fa-video" aria-hidden="true"></i>' : '<i class="fas fa-video-slash" aria-hidden="true"></i>';

    unblurBtn.disabled = !unblurBtn.disabled;
    blurBtn.disabled = !blurBtn.disabled;

    unblurBtn.hidden = true;
    blurBtn.hidden = false;
    lVideo.hidden = false;
    canvas.hidden = true;
})

//mute mic
muteAudioButton.addEventListener('click', function muteMic() {
    window.localstream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    muteAudioButton.innerHTML=muteAudioButton.innerHTML===('<i class="fas fa-microphone-slash" aria-hidden="true"></i>' ||
    '<i class="fas fa-microphone-slash"></i>')? 
    '<i class="fas fa-microphone" aria-hidden="true"></i>' : '<i class="fas fa-microphone-slash" aria-hidden="true"></i>';
  })

//share screen
document.getElementById("shareScreen").addEventListener('click', (e)=>{
    navigator.mediaDevices.getDisplayMedia({
        video:{
            cursor: "always",
            height: 580,
            width: 740


        },
        audio:{
            echoCancellation: true,
            noiseSuppression: true
        }
    }).then((stream)=>{
          let videoTrack=stream.getVideoTracks()[0];
          if(!currentPeer) {
              console.log("NO current peer found!");
          }
          // else {
          // }

          console.log("currentPeer.getSenders() is ");
          console.log(currentPeer.getSenders());
          var sender=currentPeer.getSenders().find(function(s){
              console.log(s);
              console.log(videoTrack);
              if(s.track.kind==videoTrack.kind)
                  console.log("match found");
              return s.track.kind==videoTrack.kind;
          })
          if(sender) {
              sender.replaceTrack(videoTrack);
              videoTrack.onended=function(){
                      sender.replaceTrack(window.localstream.getVideoTracks()[0]);
              }
          }
          else {
              console.log("sender is undefined or null or something unreasonable");
          }
    }).catch((err)=>{
        console.error("unable to get display " + err);
    })
})

//blur background
blurBtn.addEventListener('click', e => {
    console.log("blur button clicked..");
    blurBtn.hidden = true;
    unblurBtn.hidden = false;
  
    lVideo.hidden = true;
    canvas.hidden = false;
    
    console.log("Before loadbodypix()");
    loadBodyPix();
    try{
      var blurbgStream = canvas.captureStream();
      blurBg.srcObject=blurbgStream;
      console.log("blurBg " + blurBg.srcObject);
      let videoTrack=blurBg.captureStream().getVideoTracks()[0];

      if(!blurbgStream){
        console.log("stream null");
      }
      console.log("currentPeer "+currentPeer);
      console.log("canvas stream "+blurbgStream);

      var sender=currentPeer.getSenders().find(function(s){
        console.log(s);
        console.log(blurbgStream);
        if(s.track.kind==videoTrack.kind)
            console.log("match found");
        return s.track.kind==videoTrack.kind;
      })
      if(sender) {
          sender.replaceTrack(videoTrack)
      }
      console.log("After loadbodypix()");
    }
    catch(err){
      console.log("BODYPIX...");

      console.log(err.message);
    } 
});

unblurBtn.addEventListener('click', e => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  lVideo.hidden = false;
  canvas.hidden = true;
  let videoTrack=window.localstream.getVideoTracks()[0];
  var sender=currentPeer.getSenders().find(function(s){
    if(s.track.kind==videoTrack.kind)
      console.log("match found");
    return s.track.kind==videoTrack.kind;
  })
  if(sender) {
    sender.replaceTrack(videoTrack);
  }
});

function loadBodyPix() {
  var options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  }
  
  bodyPix.load(options)
    .then(net => perform(net))
    .catch(err => {
      console.log("inside bodypix.load");
      console.log(err);
    })
}
  
async function perform(net) {
  while (blurBtn.hidden) {
    const segmentation = await net.segmentPerson(lVideo);
    const backgroundBlurAmount = 6;
    const edgeBlurAmount = 2;
    const flipHorizontal = false;

    bodyPix.drawBokehEffect(
      canvas, lVideo, segmentation, backgroundBlurAmount,
      edgeBlurAmount, flipHorizontal);
  }
}

//genrate asl subtitles
generateSubtitlesBtn.addEventListener('click', ()=>{
  try{
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
  }
  catch(e) {
    console.log(e);
  }
  // var speechRecognitionList = new SpeechGrammarList();
  // recognition.grammars = speechRecognitionList;
  recognition.continuous = true;
  recognition.lang = 'en-US';
  // recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.start();
  recognition.onstart = function() { 
    console.log('Voice recognition activated. Try speaking into the microphone.');
  }
  
  // recognition.onspeechend = function() {
  //   instructions.text('You were quiet for a while so voice recognition turned itself off.');
  // }
  
  recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
      console.log('No speech was detected. Try again.');  
    };
  }
  let newSubtitles=subtitlesTextArea.value;

  recognition.onresult = function(event) {
    // console.log("results ");
    // console.log(event);
    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far. 
    // We only need the current one.
    let current = event.resultIndex;
  
    // Get a transcript of what was said.
    let transcript = event.results[current][0].transcript;
    // console.log(typeof transcript);
    let aslSubtitles = document.createElement("div");
    var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
    for (let i = 0; i < transcript.length; i++) {
      console.log("in for");
      if(transcript[i].match(/^[0-9a-z]+$/)){
        console.log("regex");
        let aslChar = document.createElement("img");
        aslChar.src="assets/images/ASL_letters/"+transcript[i].toLowerCase()+".jpg";
        console.log(aslChar.src);
        aslSubtitles.appendChild(aslChar);
      }
    }
    
    // Add the current transcript to the contents of our Note.
    // There is a weird bug on mobile, where everything is repeated twice.
    // There is no official solution so far so we have to handle an edge case.
    // var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
  
    // if(!mobileRepeatBug) {
      newSubtitles += transcript;
      subtitlesTextArea.value=newSubtitles;
      updateScrollGeneral(subtitlesTextArea);
      ASLsubtitlesDisplay.appendChild(aslSubtitles);
      updateScrollGeneral(ASLsubtitlesDisplay);
    // }
  };

})

// //generate english subtitles
// ///////////////////////////////// 

/* <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"></script> */


let model, webcam, labelContainer, maxPredictions;
async function initiate(){
  // the link to your model provided by Teachable Machine export panel
  console.log("generate button clicked");
//   const URL = "https://teachablemachine.withgoogle.com/models/5EX24fZdd/";
  const URL = "https://teachablemachine.withgoogle.com/models/1rxHrxddy/"


  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model =  await tmImage.load(modelURL, metadataURL);
  console.log('Model loaded ', model)
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = false; // whether to flip the webcam
  // webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  // await webcam.setup(); // request access to the webcam
  // await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  // document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) { // and class labels
      labelContainer.appendChild(document.createElement("div"));
  }

}

englishSubtitlesBtn.addEventListener('click', initiate);

// Load the image model and setup the webcam
// async function init() {
//     const modelURL = URL + "model.json";
//     const metadataURL = URL + "metadata.json";

//     // load the model and metadata
//     // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
//     // or files from your local hard drive
//     // Note: the pose library adds "tmImage" object to your window (window.tmImage)
//     model = await tmImage.load(modelURL, metadataURL);
//     maxPredictions = model.getTotalClasses();

//     // Convenience function to setup a webcam
//     const flip = true; // whether to flip the webcam
//     // webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
//     // await webcam.setup(); // request access to the webcam
//     // await webcam.play();
//     window.requestAnimationFrame(loop);

//     // append elements to the DOM
//     // document.getElementById("webcam-container").appendChild(webcam.canvas);
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }

async function loop() {
    // webcam.update(); // update the webcam frame
    await predict();
    // let probs=await predict();
    // let initMaxProbClass={class: probs.maxProbClass,
    //                     prob: probs.maxProb
    // };
    // while(probs.allProb[initMaxProbClass.class]-initMaxProbClass.prob<=0.2){
    //   maxProb=predict();
    // }
    // labelContainer.innerHTML += initMaxProbClass.class+" ";
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    // const prediction = await model.predict(webcam.canvas);
    const prediction = await model.predict(rVideo);
    // let maxProb=0;
    // let maxProbClass="";
    // let allProb={};
    for (let i = 0; i < maxPredictions; i++) {
    //   if(maxProb<prediction[i].probability){
    //     maxProb=prediction[i].probability;
    //     maxProbClass=prediction[i].className;
    //   }
    //   allProb[prediction[i].className]=prediction[i].probability;
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            if(prediction[i].probability>0.5){
                labelContainer.innerHTML = classPrediction;
            }
        // labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    // return {maxProb, maxProbClass, allProb};
}

////////////////////////////////
//record screen
async function init(constraints) {
  try {
    const recordStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    handleSuccess(recordStream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
  }
}

async function getTheStream(){
  const constraints = {
    video: true,
    audio: true
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
}

getScreenStream.addEventListener('click', ()=>{
  getTheStream();
})
recordButton.addEventListener('click', () => {
    console.log("record btn clicked");
    startRecording();
});

playButton.addEventListener('click', () => {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});


downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.mp4';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9,opus'};
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.start();
  mediaRecorder.ondataavailable = handleDataAvailable;
  console.log('MediaRecorder started', mediaRecorder);
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);

    playButton.disabled = false;
    downloadButton.disabled = false;
  };
}

function stopRecording() {
  mediaRecorder.stop();
}

function handleSuccess(stream) {
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;
}



