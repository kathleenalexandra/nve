import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.js";
import {
    OrbitControls
} from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.js";
import {
    OBJLoader
} from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/OBJLoader.js";
import {
    MTLLoader
} from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/MTLLoader.js";
import {
    DDSLoader
} from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/loaders/DDSLoader.js";

var container;
var camera, scene, raycaster, renderer, controls;
var mouse = new THREE.Vector2();

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

  var info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '0';

  info.style.width = '100%';
  info.style.borderRadius = '5px';
  info.style.textAlign = 'center';
  info.style.backgroundColor = 'white'; 
  info.style.color = 'black';
  info.innerHTML = '<div>  <p>Hover to color with a random color. Mouse click to clear the colors from the screen</p> </div>';
  container.appendChild(info);


    camera = new THREE.PerspectiveCamera(
        25,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    camera.position.set(11, 5, 5);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F5F5);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
    };

    var onError = function() {};
    var manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());

    new MTLLoader(manager)
        .setPath("./examples/models/obj/beach/")
        .load("Beach_-_Low_Poly.mtl", function(materials) {
            materials.preload();

            new OBJLoader(manager)
                .setMaterials(materials)
                .setPath("./examples/models/obj/beach/")
                .load(
                    "Beach - Low Poly.obj",
                    function(object) {
                        object.position.x = -4;
                        object.position.y = 0;
                        object.position.z = -2;
                        object.scale.set(0.02, 0.02, 0.02);
                        object.userData.tag = "beach";
                        scene.add(object);
                    },
                    onProgress,
                    onError
                );
        });

    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    controls.target.set(0, 2, 0);
    controls.update();


    renderer.domElement.addEventListener("mousemove", move, false);
    renderer.domElement.addEventListener("click", click, false);
    window.addEventListener("resize", onWindowResize, false);
}

function click() {
    scene.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material = new THREE.MeshStandardMaterial()
        }
    });
}

function move() {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0) {
        var object = intersects[0].object;
        object.material.color.set(Math.random() * 0xffffff);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}