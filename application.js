// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/j2pZ9CNMf/";

let model, webcam, labelContainer, maxPredictions;
let predictWait = 2000;
let likelyImageNode;
let likelyProbabilityNode;
let weedClasses = ['dandelion', 'thistle', 'shot-weed'];

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    likelyImageNode = document.getElementById('most-likely-image');
    likelyProbabilityNode = document.getElementById('most-likely-probability');

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
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    setTimeout(loop, predictWait);
}

function sort_probability(a,b) {
    return b.probability - a.probability;
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    prediction.sort(sort_probability);
    likelyImageNode.src = "class-images/" + prediction[0].className.toLowerCase().replace(/\s/g, '-') + '.jpg';
    likelyProbabilityNode.innerHTML = prediction[0].className + ' ' + (prediction[0].probability * 100).toFixed(1) + '%';
    
    /*for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

    }*/
}