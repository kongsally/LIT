
var camera, container, lightHelper1, obj, renderer, scene, spotLight1;
var spotlights, lightHelpers;
var leeColors = [];
var savedCues = [];
var isLightHelperOn = true;
var isPickingColor = false;

var selectedSpotlightIndex;
var originalColor;
var selectedColor, selectedFilter;

function setup() {

  container = $('#lightSimContainer');
  var WIDTH = container.width(),
      HEIGHT = window.innerHeight * 0.6;

  $("#color-swatch-wrapper").css("height", HEIGHT + "px");

  // set some camera attributes
  var VIEW_ANGLE = 60,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true
  });
  renderer.domElement.setAttribute("id", "canvas");
  renderer.clearColor(0xEEEEEE);
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
  var textureLoader = new THREE.TextureLoader();
  var woodTexture = new THREE.TextureLoader().load( "assets/wood-floor.jpg" );
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set( 128, 128 );

  var geoFloor = new THREE.BoxGeometry(2000, 1, 2000);
  var matFloor = new THREE.MeshPhongMaterial({
    color: 0XC0834A,
    map: woodTexture
  });
  var mshFloor = new THREE.Mesh( geoFloor, matFloor );
  mshFloor.receiveShadow = true;
  scene.add( mshFloor );

  // create back wall
  var geoBackwall = new THREE.BoxGeometry(2000, 2000, 1);
  var matBackwall = new THREE.MeshPhongMaterial({
    color: 0XC0834A,
    map: woodTexture
  });
  var mshBackwall= new THREE.Mesh(geoBackwall, matBackwall);
  mshBackwall.receiveShadow = true;
  mshBackwall.position.set(0, 0, 170);
  scene.add( mshBackwall );
  
  // test obj
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load("assets/hamilton_set.mtl", function( materials ) {
    materials.preload();
    
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    objLoader.load("assets/hamilton_set.obj", function (object) {
      object.children[0].geometry.computeBoundingBox();
      object.rotation.set(0,Math.PI/2,0);
      object.scale.set(1.5,1.5,1.5);
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

  var lightHelper= new THREE.SpotLightHelper(spotlights[i]);
  lightHelpers.push(lightHelper);
  scene.add(lightHelpers[i]);
 }

  var ambient = new THREE.AmbientLight(0x222, 0.5);
  scene.add(ambient);

  camera.position.set(0, 40, -170);

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
      leeColors = data;
  });

  renderer.domElement.addEventListener('click', fullscreen, false);

  window.addEventListener('resize', onResize, false);
  onResize();

  $("#color-picker-card").hide();
  populateColorPickers();
  populateSlideBars();
  toggleLightHelpers();
  loadCues();

  $("#spinner-wrapper").css("display", "none");
  $("main").css("visibility", "visible");
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
  newObj.penumbra = 0.1;
  newObj.distance = 400;
  return newObj;
}

function render() {
  renderer.render(scene, camera);
}

function onResize() {
  var WIDTH = container.width(),
      HEIGHT =  window.innerHeight * 0.6;
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
      "' class='material-icons md-48' onClick=\"toggleLightColor('" + 
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
  $("#save-cue-button").hide();
  $("#selected-color-name").html("");
  $("#color-picker-card").show();
  originalColor = new THREE.Color(spotlights[i-1].color);
  selectedColor = null;
  populateFilterColors();
}

function hideSpotlightControl() {
  if(!isPickingColor) {
    selectedColor = originalColor;
    setSpotLightColor();
  }
  $("#spotlight-grid").show();
  $("#save-cue-button").show();
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
  if(selectedColor != null) {
    spotlights[selectedSpotlightIndex-1].color.set(selectedColor);
    $("#palette" + selectedSpotlightIndex).css("color", "#" + selectedColor.getHexString());
    lightHelpers[selectedSpotlightIndex-1].children[0].material.color.set(selectedColor);
    render();
    isPickingColor = true;
  }
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

function saveCue() {
  // for spotlight configuration in the cue object
  var spotlightsDetail = [];

  for (var i=0; i < spotlights.length; i++) {
    var spotlightElement = {};
    spotlightElement["id"] = i+1;
    spotlightElement["color"] = spotlights[i].color.getHexString();
    spotlightElement["intensity"] = spotlights[i].intensity;
    spotlightsDetail.push(spotlightElement);
  }

  var newCue = {
    "camera" : {
      "position" : {
        "x" : camera.position.x,
        "y" : camera.position.y,
        "z" : camera.position.z
      },
      "rotation" : {
        "x" : camera.rotation.x,
        "y" : camera.rotation.y,
        "z" : camera.rotation.z
      }
    },
    "spotlights" : spotlightsDetail
  };

  savedCues.push(newCue);
  localStorage.setItem("cues", JSON.stringify(savedCues));
  loadCues();
}

function loadCues() {
  var cues = JSON.parse(localStorage.getItem("cues"));
  if (cues != null) {
    savedCues = cues;
    $("#saved-cues-wrapper").empty();
    for (var i=0; i < savedCues.length; i++) {
     $("#saved-cues-wrapper").append(
      '<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" ' + 'for="cue' + i + 
      ' oninput="loadConfiguration(' + i + ');" onchange="loadConfiguration(' + i + ');"><input type="radio" id="cue' + i + 
     '" class="mdl-radio__button" name="cues" value="' + i + 
     '"><span class="mdl-radio__label"> Cue ' + (i+1) + '</span></label>');
    } 
  }
}

function loadConfiguration(i) {
  if (i < savedCues.length) {
    var cueConfiguration = savedCues[i];
    camera.position.set(
      cueConfiguration.camera.position.x,
      cueConfiguration.camera.position.y,
      cueConfiguration.camera.position.z);
    camera.rotation.set(
      cueConfiguration.camera.rotation.x,
      cueConfiguration.camera.rotation.y,
      cueConfiguration.camera.rotation.z
    );

    console.log(cueConfiguration.spotlights);

    for (var j = 0; j < cueConfiguration.spotlights.length; j++) {
      spotlights[j].color.set(new THREE.Color("#" + cueConfiguration.spotlights[j].color));
      $("#palette" + (j+1)).css("color", "#" + cueConfiguration.spotlights[j].color);
      lightHelpers[j].children[0].material.color.set(cueConfiguration.spotlights[j].color);
      
      spotlights[j].intensity = cueConfiguration.spotlights[j].intensity * 100;
      adjustLightIntensity(j+1, cueConfiguration.spotlights[j].intensity * 100);
    }

    render();
  }
}

function downloadImage() {
  var image = renderer.domElement.toDataURL("image/png");
  window.location.href=image.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
}

