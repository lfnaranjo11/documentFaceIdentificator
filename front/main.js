const userFeedBack = document.querySelector('#userFeedBack');
const canvas = document.querySelector('#id_you_like');
var refreshSquare;

var video = document.querySelector('#videoElement');
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./public/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./public/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./public/models'),
])
  .then(startVideo)
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
  var targetStillnes = 5;
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
      var msgToUser = stillMsg(stillenes);
      const faceBox = new faceapi.draw.DrawBox(
        detectionsForSize.detection._box,
        {
          label: msgToUser,
          fontSize: 100,
          boxColor: stillColor(stillenes),
          lineWidth: 4,
        }
      );
      faceBox.draw(canvas);
      const documentBox = new faceapi.draw.DrawBox(
        sizeDocumentBox(detectionsForSize.detection._box),
        {
          label: 'make sure the id is  \n within this box',
          boxColor: 'rgba(250, 236, 40, 1)',
          lineWidth: 4,
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
  if (Math.sqrt(Math.pow(oldX - x, 2) + Math.pow(oldY - y, 2)) < 10) {
    return true;
  }
  return false;
};
const stillMsg = (stillenes) => {
  try {
    if (stillenes <= 1) {
      return 'Detecting document, stay Still';
    } else if (stillenes <= 3) {
      return 'remain in that position';
    } else if (stillenes < 5) {
      return 'remain in that position, taking ';
    } else if (stillenes == 5) {
      return 'taking picture';
    } else if (stillenes >= 5) {
      return 'picture taked';
    }
  } catch (e) {}
  return 'picture taked';
};
const stillColor = (stillenes) => {
  try {
    if (stillenes <= 1) {
      return 'rgb(220,220,220,1)';
    } else if (stillenes <= 3) {
      return 'rgba(0, 0, 0, 1)';
    } else if (stillenes < 5) {
      return 'rgb(144,238,144, 1)';
    } else if (stillenes == 5) {
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
const doScreenshot = () => {
  userFeedBack.innerHTML = 'FOTO TOMADA';
  clearInterval(refreshSquare);
  video.pause();
  new faceapi.Rect(10, 10, 400, 300);
};
