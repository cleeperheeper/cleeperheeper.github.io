import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', function(event) {
    mouseX = w/2 - event.clientX;
    mouseY = h/2 - event.clientY;
    console.log(mouseX, mouseY);
})

const scene = new THREE.Scene;

const fov = 20;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 5);

//const controls = new OrbitControls(camera, renderer.domElement);

const mat = new THREE.MeshPhysicalMaterial({
    color: 0x00f0ff,
    roughness: 0,
    transmission: 0
});

const loader = new GLTFLoader();
var model;
loader.load('/Shared/text.glb', function (gltf) {
    model = gltf.scene;
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = mat;
        }
    })

    scene.add(model);
})

// const geometry = new THREE.IcosahedronGeometry(1, 3);
// const icosphere = new THREE.Mesh(geometry, mat)
// scene.add(icosphere)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000);
scene.add(hemiLight);

const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const aaPass = new FXAAPass();
composer.addPass( aaPass );
const shaderPass = new ShaderPass( '/Shared/shader.js' );
composer.addPass( shaderPass );
const outputPass = new OutputPass();
composer.addPass( outputPass );

//controls.update();
function animate() {
    if (model) {
    model.rotation.y = mouseX * -.0002;
    model.rotation.x = mouseY * -.001;
    }

    requestAnimationFrame(animate);
    composer.render();
    //renderer.render(scene, camera);
}
animate();