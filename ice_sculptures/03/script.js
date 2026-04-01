// Popup functions
function showPopup() {
  document.getElementById("popup").style.display = "block";
}

function hidePopup() {
  document.getElementById("popup").style.display = "none";
}

// Device detection for AR button
function getUserOS() {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

let os = getUserOS();
if (os === 'Android' || os === 'iOS') { 
  // Must be phone device, code here 
  document.getElementById("ARbutton").style.display = "none";
} 
else {
  // Must be desktop device
}

// QR code
var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: "https://nexreality.io/ice_sculptures/03/index.html",
  width: 200,
  height: 200,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H
});

function toggleIcons() {
  var layer1 = document.getElementById('Layer_1');
  var layer2 = document.getElementById('Layer_2');

  if (layer1.style.display === 'none') {
    layer1.style.display = '';
    layer2.style.display = 'none';
  } else {
    layer1.style.display = 'none';
    layer2.style.display = '';
  }
}

/* ------------- Toggle Full Screen Start ------------- */
function toggleFullscreen() {
  const elem = document.documentElement;
  if (os === 'iOS') {
    // Open the predefined URL in a new tab for iOS devices
    window.open("https://nexreality.io/ice_sculptures/03/", '_blank');
  } else {
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('ARbutton').addEventListener('click', showPopup);
  document.getElementById('closePopup').addEventListener('click', hidePopup);
  document.getElementById('popup').addEventListener('click', hidePopup);
  document.getElementById('expandicon').addEventListener('click', function() {
    toggleFullscreen();
    toggleIcons();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'Enter') {
      hidePopup();
    }
  });
});