
var camera, container, lightHelper1, obj, renderer, scene, spotLight1;
var spotlights, lightHelpers;
var leeColors = [];
var isLightHelperOn = true;
var isPickingColor = false;

var selectedSpotlightIndex;
var originalColor;
var selectedColor, selectedFilter;

function setup() {

  container = $('#lightSimContainer');
  var WIDTH = container.width(),
      HEIGHT = window.innerHeight * 0.75;

  $("#color-swatch-wrapper").css("height", HEIGHT + "px");

  // set some camera attributes
  var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  //effect = new THREE.StereoEffect( renderer );
  camera = new THREE.PerspectiveCamera(
      VIEW_ANGLE,
      ASPECT,
      NEAR,
      FAR);

  scene = new THREE.Scene();
  // add the camera to the scene
  scene.add(camera);
  
  // create floor
  var geoFloor = new THREE.BoxGeometry(2000, 1, 2000);
  var textureLoader = new THREE.TextureLoader();
  var matFloor = new THREE.MeshPhongMaterial({
    color: 0XC0834A,
    map: textureLoader.load("css/wood-floor.jpg")
  });
  var mshFloor = new THREE.Mesh( geoFloor, matFloor );
  mshFloor.receiveShadow = true;
  scene.add( mshFloor );

  // create back wall
  var geoBackwall = new THREE.BoxGeometry(2000, 2000, 1);
  var textureLoader = new THREE.TextureLoader();
  var matBackwall = new THREE.MeshPhongMaterial({
    color: 0XC0834A,
    map: textureLoader.load("css/wood-floor.jpg")
  });
  var mshBackwall= new THREE.Mesh(geoBackwall, matBackwall);
  mshBackwall.receiveShadow = true;
  mshBackwall.position.set(0, 0, 200);
  scene.add( mshBackwall );
  
  // test obj
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("http://threejs.org/examples/obj/walt/WaltHead.mtl", function( materials ) {
    materials.preload();
    
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    objLoader.load( "http://threejs.org/examples/obj/walt/WaltHead.obj", function (object) {
      object.children[0].geometry.computeBoundingBox();
      object.rotation.set(0,Math.PI,0);
      object.scale.set(2,2,2);
      object.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
      obj = object;
      scene.add(obj);
    });
  });

  // create lights
 spotlights = [];
 lightHelpers = [];
 var spotlight_spacing = 180;
 var spotlight_height = 200;

 for (var i=0; i < 9; i++) {
  var spotlight = createSpotlight(0XFFFFFF);

  spotlight.position.set(
    -1 * (i%3*spotlight_spacing - spotlight_spacing), 
    spotlight_height, 
    parseInt(i/3) * spotlight_spacing/2 - spotlight_spacing/2);

  spotlights.push(spotlight);
  scene.add(spotlights[i]);

  spotlights[i].target.position.set(
    -0.3 * (i%3*spotlight_spacing - spotlight_spacing), 
    0, 
    0.3 * (parseInt(i/3) * spotlight_spacing - spotlight_spacing));

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
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI/2; 

  controls.target.set(0, 40, 0);
  controls.update();

  renderer.setSize(WIDTH, HEIGHT);
  container.append(renderer.domElement);

   $.getJSON("LEE_Color.json", function( data ) { 
      leeColors = data;
  });

  window.addEventListener('resize', onResize, false);
  onResize();

  populateColorPickers();
  populateSlideBars();
  
  $("#color-picker-card").hide();
  toggleLightHelpers();
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
  var newObj = new THREE.SpotLight(color, 0);
  newObj.castShadow = true;
  newObj.angle = 0.645; 
  newObj.penumbra = 0.2;
  newObj.distance = 300;
  return newObj;
}

function render() {
  renderer.render(scene, camera);
}

function onResize() {
  var WIDTH = container.width(),
      HEIGHT =  window.innerHeight * 0.75;
  $("#color-swatch-wrapper").css("height", parseInt(HEIGHT)+ "px");
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
      "' min='0' max='100' value='0' " + 
      "oninput='adjustLightIntensity(" + i + ", this.value)' " +
      "onchange='adjustLightIntensity(" + i + ", this.value)'>");
  }
}

// create a color picker palette for each of the spotlights
function populateColorPickers() {
  for (var i = 1; i < 10; i++) {
    $( "#spotlight" + i).append("<i id='palette" + i + 
      "' class='material-icons palette' onClick='openSpotlightControl(" + i + ")'>palette</i>");
    $( "#spotlight" + i).append("<span> Spotlight " + i + " <span id='intensity" + 
      i + "'></span>");
    updateIntensityLabel(i);
  }
}

function populateFilterColors() {
  $("#color-swatch-wrapper").empty();
  leeColors.forEach(function(leeColor) {
    $("#color-swatch-wrapper").append("<i id='L" + leeColor.number + 
      "' class='material-icons' onClick=\"toggleLightColor('" + 
        leeColor.number + "');\">lens</i>");
    $("#L" + leeColor.number).css("color", leeColor.hex);
  });
}

// allows slide bar to adjust light intensity
function adjustLightIntensity(i, value) {
  lightIntensity = value;
  spotlights[i-1].intensity = lightIntensity/100;
  updateIntensityLabel(i);
  render();
}

function openSpotlightControl(i) {
  selectedSpotlightIndex = i;
  $("#spotlight-grid").hide();
  $("#selected-color-name").html("");
  $("#color-picker-card").show();
  originalColor = new THREE.Color(spotlights[i-1].color);
  populateFilterColors();
}

function hideSpotlightControl() {
  if(!isPickingColor) {
    selectedColor = originalColor;
    setSpotLightColor();
  }
  $("#spotlight-grid").show();
  $("#color-picker-card").hide();
  isPickingColor = false;
}

function toggleLightColor(leeNumber) {
  var leeColor = findLeeColor(leeNumber);
  selectedColor = new THREE.Color(leeColor["hex"]);
  selectedFilter = leeColor["name"];
  $("#selected-color-name").html(" "  + leeColor["name"] + " (L" + leeNumber + ")");
  changeSpotLightColor();
}

function changeSpotLightColor() {
  spotlights[selectedSpotlightIndex-1].color.set(selectedColor);
  lightHelpers[selectedSpotlightIndex-1].children[0].material.color.set(selectedColor);
  render();
}

function setSpotLightColor() {
  spotlights[selectedSpotlightIndex-1].color.set(selectedColor);
  $("#palette" + selectedSpotlightIndex).css("color", "#" + selectedColor.getHexString());
  lightHelpers[selectedSpotlightIndex-1].children[0].material.color.set(selectedColor);
  render();
  isPickingColor = true;
  hideSpotlightControl();
}

function updateIntensityLabel(i) {
  $("#intensity" + i).html("(" + parseInt(spotlights[i-1].intensity * 100) + "%)");
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

function findLeeColor(leeNumber) {
  var theLee;
  for (var i = 0; i < leeColors.length; i++) {
    var leeColor = leeColors[i];
    if (leeNumber == leeColor.number) {
      theLee = leeColor;
      break;
    }
  }
  return theLee;
}


