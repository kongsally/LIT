
var camera, container, lightHelper1, obj, renderer, scene, spotLight1;
var spotlights, lightHelpers;
var hexNumbers = [];
var isLightHelperOn = true;
var isPickingColor = false;

var mouseX = 0, mouseY = 0;

var selectedSpotlightIndex;
var originalColor;
var selectedColor;

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


document.addEventListener( 'mousemove', onDocumentMouseMove, false );


function setup() {

  container = $('#lightSimContainer');
  var WIDTH = container.width(),
      HEIGHT = window.innerHeight;

  // set some camera attributes
  var VIEW_ANGLE = 60,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  container.append( renderer.domElement );

  effect = new THREE.StereoEffect( renderer );
  effect.setSize( window.innerWidth, window.innerHeight );

  renderer.setClearColor(0xf2f7ff, 1);
  renderer.shadowMap.enabled = true;  
  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR);

  scene = new THREE.Scene();
  // add the camera to the scene
  scene.add(camera);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(
          camera.position.x + 0.15,
          camera.position.y,
          camera.position.z
        );
        controls.noPan = true;
        controls.noZoom = true;
  
  // create floor
  var geoFloor = new THREE.BoxGeometry(800, 1, 800);
  var textureLoader = new THREE.TextureLoader();
    var matFloor = new THREE.MeshPhongMaterial({
      color: 0XDDDDDD});
    var mshFloor = new THREE.Mesh( geoFloor, matFloor );
    mshFloor.receiveShadow = true;
    scene.add( mshFloor );

    putSphere(new THREE.Vector3(0, 5, 0));

  // create lights
 spotlights = [];
 lightHelpers = [];
 var spotlight_spacing = 120;
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

  // var lightHelper= new THREE.SpotLightHelper(spotlights[i]);
  // lightHelpers.push(lightHelper);
  // scene.add(lightHelpers[i]);
 }

  var ambient = new THREE.AmbientLight(0xeef0ff, 0.5);
  scene.add(ambient);

  camera.position.set(0, 40, -300);

  renderer.setSize(WIDTH, HEIGHT);
  container.append(renderer.domElement);

 $.getJSON("LEE_Color.json", function( data ) { 
    for (var i=0; i < Object.keys(data).length; i++) {
      hexNumbers.push(data[i]["hex"]);
    }
});

  window.addEventListener('resize', onResize, false);
  onResize();

  //VR controls
  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    camera.updateProjectionMatrix();
    controls.update();

  renderer.domElement.addEventListener('click', fullscreen, false);

  window.removeEventListener('deviceorientation', setOrientationControls, true);
}
  window.addEventListener('deviceorientation', setOrientationControls, true);
  effect.render(scene, camera);

  animate();
}


function fullscreen() {
    container.requestFullscreen();
  }

function putSphere(pos) {
  var radius = 8,
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

function onDocumentMouseMove( event ) {

        mouseX = ( event.clientX - windowHalfX ) * 10;
        mouseY = ( event.clientY - windowHalfY ) * 10;

      }

function animate() {

        requestAnimationFrame( animate );

        render();

      }

function render() {
  effect.render(scene, camera);
}

function onResize() {
  var WIDTH = container.width(),
      HEIGHT =  window.innerHeight;
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
  render();
}