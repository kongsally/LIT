
var camera, container, lightHelper1, renderer, scene, spotLight1;

function setup() {

  container = $('#lightSimContainer');
  var WIDTH = container.width(),
      HEIGHT = window.innerHeight * 0.8;

  // set some camera attributes
  var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMapEnabled = true;

  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR);

  scene = new THREE.Scene();
  // add the camera to the scene
  scene.add(camera);
  camera.position.set(46, 22, -21);

   // create lights
  spotLight1 = createSpotlight(0xFFFFFF);
  spotLight1.position.set( 15, 100, 45 );
  scene.add(spotLight1);

  lightHelper1 = new THREE.SpotLightHelper( spotLight1 );
  scene.add(lightHelper1);

  var ambient = new THREE.AmbientLight( 0x111111 );
  scene.add( ambient );
  
  // create floor
  var matFloor = new THREE.MeshPhongMaterial();
  var geoFloor = new THREE.BoxGeometry( 2000, 1, 2000 );
  var mshFloor = new THREE.Mesh( geoFloor, matFloor );
  mshFloor.receiveShadow = true;
  scene.add( mshFloor );

  // test objs
  putSphere(new THREE.Vector3(0,5,0));
  putSphere(new THREE.Vector3(-8,6,0));

  renderer.setSize(WIDTH, HEIGHT);
  container.append(renderer.domElement);

  // Orbit Control
  controls = new THREE.OrbitControls(camera, container.domElement);
  controls.addEventListener( 'change', render );
  controls.maxDistance = 499;

  renderer.render(scene, camera);
  onResize();
  window.addEventListener( 'resize', onResize, false);
  controls.target.set( 0, 7, 0 );
  controls.update();
}

function putSphere(pos) {
  var radius = 3,
      segments = 16,
      rings = 16;

  // create the sphere's material
  var sphereMaterial =
    new THREE.MeshLambertMaterial(
      {
        color: 0xDDDDDD
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
  var newObj = new THREE.SpotLight( color, 2 );
  newObj.castShadow = true;
  newObj.angle = 1;
  newObj.penumbra = 0.2;
  newObj.distance = 200;
  return newObj;
}

function render() {
  renderer.render(scene, camera);
}

function onResize() {
  var WIDTH = container.width(),
      HEIGHT =  window.innerHeight * 0.8;
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
  render();
}
