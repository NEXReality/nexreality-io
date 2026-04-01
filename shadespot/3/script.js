// Handles loading the events for <model-viewer>'s slotted progress bar
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
    event.target.removeEventListener('progress', onProgress);
  } else {
    progressBar.classList.remove('hide');
  }
};
document.querySelector('model-viewer').addEventListener('progress', onProgress);

const modelViewer = document.querySelector("#shadespot");
const annotationClicked = (annotation) => {
  let dataset = annotation.dataset;
  modelViewer.cameraTarget = dataset.target;
  modelViewer.cameraOrbit = dataset.orbit;
  modelViewer.fieldOfView = '2deg';
}
modelViewer.querySelectorAll('button').forEach((hotspot) => {
  hotspot.addEventListener('click', () => annotationClicked(hotspot));
});

function resetCamera() {
  const modelViewer = document.querySelector("#shadespot");
  modelViewer.cameraOrbit = "408.5deg 74.21deg 22.81m";
  modelViewer.cameraTarget = "-0.05m 1.72m -0.23m";
  modelViewer.fieldOfView = '30deg';
}