
var camera, container, lightHelper1, obj, renderer, scene, spotLight1;
var spotlights, lightHelpers;
var hexNumbers = [];
var isLightHelperOn = true;
var isPickingColor = false;

var selectedSpotlightIndex;
var originalColor;
var selectedColor;

function setup() {

  container = $('#lightSimContainer');
  var WIDTH = container.width(),
      HEIGHT = window.innerHeight * 0.75;

  // set some camera attributes
  var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
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
  
  // create floor
  var geoFloor = new THREE.BoxGeometry(800, 1, 800);
  var textureLoader = new THREE.TextureLoader();
    var matFloor = new THREE.MeshPhongMaterial({
      color: 0XDDDDDD});
    var mshFloor = new THREE.Mesh( geoFloor, matFloor );
    mshFloor.receiveShadow = true;
    scene.add( mshFloor );
  
  // test obj
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("http://threejs.org/examples/obj/walt/WaltHead.mtl", function( materials ) {
    materials.preload();
    
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    objLoader.load( "http://threejs.org/examples/obj/walt/WaltHead.obj", function (object) {
      object.children[0].geometry.computeBoundingBox();
      object.rotation.set(0,Math.PI,0);
      object.scale.set(0.8, 0.8, 0.8);
      object.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
      obj = object;
      scene.add(obj);
    });
  });

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

  var lightHelper= new THREE.SpotLightHelper(spotlights[i]);
  lightHelpers.push(lightHelper);
  scene.add(lightHelpers[i]);
 }

  var ambient = new THREE.AmbientLight(0xeef0ff, 0.5);
  scene.add(ambient);

  camera.position.set(0, 40, -300);

  // Orbit Control
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render, false);
  controls.maxDistance = 400;
  controls.maxPolarAngle = Math.PI/2; 

  controls.target.set(0, 40, 0);
  controls.update();

  renderer.setSize(WIDTH, HEIGHT);
  container.append(renderer.domElement);

 $.getJSON("LEE_Color.json", function( data ) { 
    for (var i=0; i < Object.keys(data).length; i++) {
      hexNumbers.push(data[i]["hex"]);
    }
});

  //Create sliders for spotlights
  populateSlideBars();

  window.addEventListener('resize', onResize, false);
  onResize();

  populateColorPickers();
  $("#color-picker-card").hide();
  toggleLightHelpers();
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

function render() {
  renderer.render(scene, camera);
}

function onResize() {
  var WIDTH = container.width(),
      HEIGHT =  window.innerHeight * 0.75;
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
  render();
}

function toggleLightHelpers() {
  isLightHelperOn = !isLightHelperOn;
  lightHelpers.forEach(function(lightHelper) {
    lightHelper.visible = isLightHelperOn;
  });
  $( "#toggle_guide_button" ).toggleClass(
    "button-primary", isLightHelperOn == true);
  render();
}

// create a slide bar for each of the spotlights
function populateSlideBars() {
  for (var i = 1; i < 10; i++) {
    $( "#spotlight" + i).append("<input class='mdl-slider " +
      "mdl-js-slider is-upgraded' type='range' id='s" + i + 
      "' min='0' max='100' value='100' " + 
      "oninput='adjustLightIntensity(" + i + ", this.value)' " +
      "onchange='adjustLightIntensity(" + i + ", this.value)'>");
  }
}

// create a color picker palette for each of the spotlights
function populateColorPickers() {
  for (var i = 1; i < 10; i++) {
    $( "#spotlight" + i).prepend("<i id='palette" + i + 
      "' class='material-icons' onClick='openSpotlightControl(" + i + ")'>palette</i>");
  }
}

// allows slide bar to adjust light intensity
function adjustLightIntensity(i, value) {
  lightIntensity = value;
  spotlights[i-1].intensity = lightIntensity/100;
  render();
}

function openSpotlightControl(i) {
  selectedSpotlightIndex = i;
  $("#spotlight-grid").hide();
  $("#color-picker-card").show();
  originalColor = new THREE.Color(spotlights[i-1].color);
  console.log("original color");
  console.log(originalColor);
  toggleLightColor(i);
}

function hideSpotlightControl() {
  if(!isPickingColor) {
    console.log("hide, original");
      console.log(originalColor);
    selectedColor = originalColor;
    setSpotLightColor();
  }
  $("#spotlight-grid").show();
  $("#color-picker-card").hide();
  isPickingColor = false;
}

function toggleLightColor(i) {
  selectedColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  $("#color-swatch-wrapper").empty();
  $("#color-swatch-wrapper").append("<div id='color-swatch1'" + 
    "onClick='toggleLightColor(" + i + ");'" + ">New Color</div>");
  $("#color-swatch1").css("background-color", "#" + selectedColor.getHexString());

  changeSpotLightColor();
}

function changeSpotLightColor() {
  spotlights[selectedSpotlightIndex-1].color.set(selectedColor);
  lightHelpers[selectedSpotlightIndex-1].children[0].material.color.set(selectedColor);
  render();
}

function setSpotLightColor() {
  console.log("new color");
  console.log(selectedColor);
  spotlights[selectedSpotlightIndex-1].color.set(selectedColor);
  $("#palette" + selectedSpotlightIndex).css("color", "#" + selectedColor.getHexString());
  lightHelpers[selectedSpotlightIndex-1].children[0].material.color.set(selectedColor);
  render();
  isPickingColor = true;
  hideSpotlightControl();
}


