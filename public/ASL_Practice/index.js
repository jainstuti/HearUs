const URL = "ASL_Practice/asl_model/";
const words = ["Hello", "Yes", "No", "I Love You", "Thank You"];
const wordToPredict = document.getElementById("wordToPredict");
const generateWordBtn = document.getElementById("generateWordBtn");
const startPracticeBtn = document.getElementById("startPracticeBtn")
const predictions = document.getElementById("predictions");
const HintButton = document.getElementById("HintButton");
const hint = document.getElementById("hint");

let model, webcam, labelContainer, maxPredictions;
const classes = {
    "Class 1": "Hello",
    "Class 2": "I Love You",
    "Class 3": "Yes",
    "Class 4": "Thanks",
    "Class 5": "No"
};

const prob = {
    "Hello": 0,
    "I Love You": 0,
    "Yes": 0,
    "Thanks": 0,
    "No": 0
};

var predictedClass = "";
var predictedPro;
generateWordBtn.addEventListener('click', () => {
    console.log("clicked");
    var idx = Math.random();
    console.log(idx);
    idx *= 10;
    console.log(idx);
    idx = Math.floor(idx % 5);
    console.log(idx);
    wordToPredict.innerHTML = words[idx];
    hint.src = "";
})

HintButton.addEventListener("click", () => {
    hint.src = "ASL_Practice/images/" + wordToPredict.innerHTML + ".jpeg";
})
startPracticeBtn.addEventListener('click', async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
});

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
//     webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
//     await webcam.setup(); // request access to the webcam
//     await webcam.play();
//     window.requestAnimationFrame(loop);

//     // append elements to the DOM
//     document.getElementById("webcam-container").appendChild(webcam.canvas);
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        var cl = classes[prediction[i].className];
        var pr = prediction[i].probability.toFixed(2);
        prob[cl] = pr;
        // var sortable = [];
        // for (var p in prob) {
        //     sortable.push([p, prob[p]]);
        // }

        // sortable.sort(function(a, b) {
        //     return a[1] - b[1];
        // });
        // var objSorted = {}
        // sortable.forEach(function(item){
        //     objSorted[item[0]]=item[1]
        // })
        // var maxP=0;

        // for(let i=0; i<sortable.length; i++){
        //     if(sortable[i][1]>=0.3){
        //         // console.log(sortable[i][1]+": "+sortable[i][0]);
        //         // var pred=sortable[i][1]+": "+sortable[i][0]
        //         labelContainer.childNodes[i].innerHTML =sortable[i][1]+": "+sortable[i][0];
        //     }

        // }
        labelContainer.childNodes[i].innerHTML = cl + ": " + prob[cl];

    }
}