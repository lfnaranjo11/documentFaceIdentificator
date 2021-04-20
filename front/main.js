const userFeedBack = document.querySelector('#userFeedBack');
const canvas = document.querySelector('#id_you_like');
var refreshSquare;

var video = document.querySelector('#videoElement');
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./public/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./public/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./public/models'),
])
  .then(() => {
    var x = document.getElementsByClassName('loader')[0];

    if (x.style.display === 'none') {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }

    startVideo();
  })
  .catch((e) => {
    console.log(e);
  });

video.setAttribute('width', window.innerWidth);
video.setAttribute('height', window.innerHeight);
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);
var ctx = canvas.getContext('2d');
var video = document.querySelector('#videoElement');

function startVideo() {
  userFeedBack.innerHTML = 'Make sure the id is whitin the yellow box';
  var logo = document.getElementsByClassName('logo')[0];
  logo.style.display = 'none';

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .then(function (stream) {
        var size = stream.getTracks()[0].getSettings();
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      })
      .catch(function (err0r) {
        console.log('Something went wrong!');
      });
  }
}
video.addEventListener('play', () => {
  var targetStillnes = 10;
  var stillenes = 0;
  var posicionX = 0;
  var posicionY = 0;
  const displaySize = { width: video.width, height: video.height };
  refreshSquare = setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    if (detections) {
      const detectionsForSize = faceapi.resizeResults(detections, {
        width: video.width,
        height: video.height,
      });
      if (
        isStill(
          posicionX,
          posicionY,
          detections.detection._box._x,
          detections.detection._box._y
        )
      ) {
        stillenes += 1;
      } else {
        stillenes = 0;
      }
      if (stillenes == targetStillnes) {
        doScreenshot();
      }
      var msgToUser = stillMsg(stillenes, targetStillnes);
      const faceBox = new faceapi.draw.DrawBox(
        detectionsForSize.detection._box,
        {
          label: msgToUser,
          fontSize: 100,
          boxColor: stillColor(stillenes, targetStillnes),
          lineWidth: 4,
        }
      );
      faceBox.draw(canvas);
      const documentBox = new faceapi.draw.DrawBox(
        sizeDocumentBox(detectionsForSize.detection._box),
        {
          label: stillMsg(stillenes, targetStillnes),
          boxColor: 'rgba(250, 236, 40, 1)',
          lineWidth: 8,
          drawLabelOptions: {
            fontSize: 50,
          },
        }
      );
      documentBox.draw(canvas);

      posicionX = detections.detection._box._x;
      posicionY = detections.detection._box._y;
    }
  }, 200);
});

const isStill = (oldX, oldY, x, y) => {
  var precision = 5;
  if (Math.sqrt(Math.pow(oldX - x, 2) + Math.pow(oldY - y, 2)) < precision) {
    return true;
  }
  return false;
};
const stillMsg = (stillenes, targetStillnes) => {
  try {
    if (stillenes <= 1) {
      return 'Detecting';
    } else if (stillenes <= targetStillnes / 2) {
      return ' stay Still';
    } else if (stillenes < targetStillnes) {
      return ' stay Still';
    } else if (stillenes == targetStillnes) {
      return 'taking picture';
    } else if (stillenes >= targetStillnes) {
      return 'picture taken';
    }
  } catch (e) {}
  return 'picture taked';
};
const stillColor = (stillenes, targetStillnes) => {
  try {
    if (stillenes <= 1) {
      return 'rgb(220,220,220,1)';
    } else if (stillenes <= targetStillnes / 2) {
      return 'rgba(0, 0, 0, 1)';
    } else if (stillenes < targetStillnes) {
      return 'rgb(144,238,144, 1)';
    } else if (stillenes == targetStillnes) {
      return 'rgb(34,139,34, 1)';
    }
  } catch (e) {}
  return 'rrgb(34,139,34, 1)';
};
const sizeDocumentBox = (box) => {
  var xLeftResize = 100;
  var xRigthResize = 400;
  var yUpperResize = 20;
  var yDownResize = 50;
  box._x -= xLeftResize;
  box._y -= yUpperResize;
  box._width += xLeftResize + xRigthResize;
  box._height += yUpperResize + yDownResize;
  return box;
};
function doScreenshot() {
  var logo = document.getElementsByClassName('logo')[0];

  logo.style.display = 'block';
  setInterval(async () => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }, 1000);
  userFeedBack.innerHTML = 'ID succesfully added';
  clearInterval(refreshSquare);
  video.pause();
  new faceapi.Rect(10, 10, 400, 300);
}
