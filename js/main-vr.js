
var camera, container, effect, lightHelper1, obj, renderer, scene, spotLight1;
var spotlights, lightHelpers;
var hexNumbers = [];
var isLightHelperOn = true;
var isPickingColor = false;


var selectedSpotlightIndex;
var originalColor;
var selectedColor;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var controls;

function setup() {

  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // set some camera attributes
  var VIEW_ANGLE = 60,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 1000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  var element = renderer.domElement;
  container = document.getElementById('vr-sim');
  container.appendChild(element);

  renderer.setClearColor(0xf2f7ff, 1);
  renderer.shadowMap.enabled = true;  
  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR);

  scene = new THREE.Scene();
  
  scene.add(camera);

  // create lights
 spotlights = [];
 lightHelpers = [];
 var spotlight_spacing = 180;
 var spotlight_height = 120;

 for (var i=0; i < 9; i++) {
  var spotlight = createSpotlight(0XFFFFFF);

  spotlight.position.set(
    -1 * (i%3*spotlight_spacing - spotlight_spacing), 
    spotlight_height, 
    parseInt(i/3) * spotlight_spacing - spotlight_spacing);

  spotlights.push(spotlight);
  scene.add(spotlights[i]);

  spotlights[i].target.position.set(
    -0.5 * (i%3*spotlight_spacing - spotlight_spacing), 
    0, 
    0.5* (parseInt(i/3) * spotlight_spacing - spotlight_spacing));

  scene.add(spotlights[i].target);
  spotlights[i].target.updateMatrixWorld();
 }

  var ambient = new THREE.AmbientLight(0xeef0ff, 0.5);
  scene.add(ambient);

  effect = new THREE.StereoEffect(renderer);

  
  // create floor
  var geoFloor = new THREE.BoxGeometry(800, 1, 800);
  var textureLoader = new THREE.TextureLoader();
  var matFloor = new THREE.MeshPhongMaterial({
    color: 0XDDDDDD});
  var mshFloor = new THREE.Mesh( geoFloor, matFloor );
  mshFloor.receiveShadow = true;
  scene.add( mshFloor );

  putSphere(new THREE.Vector3(0, 5, 0));

  camera.position.set(0, 10, -5);

  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(
    camera.position.x + 0.15,
    camera.position.y,
    camera.position.z
  );

  window.addEventListener('deviceorientation', setOrientationControls, true);
  window.removeEventListener('deviceorientation', setOrientationControls, true);
  
  window.addEventListener('resize', onResize, false);

  camera.updateProjectionMatrix();
  onResize();
}

function setOrientationControls(e) {
  if (!e.alpha) {
    return;
  }
  controls = new THREE.DeviceOrientationControls(camera, true);
  controls.connect();
  controls.update();
}

function putSphere(pos) {
  var radius = 30,
      segments = 16,
      rings = 16;

  // create the sphere's material
  var sphereMaterial =
    new THREE.MeshLambertMaterial(
      {
        color: 0xEEEEEE
      });

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      segments,
      rings),
    sphereMaterial);

  // add the sphere to the scene
  sphere.position.set(pos.x, pos.y, pos.z);
  sphere.castShadow = true;
  scene.add(sphere);
}

function createSpotlight(color) {
  var newObj = new THREE.SpotLight(color, 1);
  newObj.castShadow = true;
  newObj.angle = 0.645; 
  newObj.penumbra = 0.2;
  newObj.distance = 200;
  return newObj;
}

function render() {
  controls.update();
  effect.render(scene, camera);
}

function onResize() {
  var WIDTH = window.innerWidth,
      HEIGHT =  window.innerHeight;
  camera.aspect = WIDTH/HEIGHT;
  effect.setSize( window.innerWidth, window.innerHeight );
  camera.updateProjectionMatrix();
  render();
}