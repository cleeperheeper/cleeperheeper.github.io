import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
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

const controls = new OrbitControls(camera, renderer.domElement);

const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0,
    transmission: 0
});

const loader = new GLTFLoader();
var model;
loader.load('/Shared/model.glb', function (gltf) {
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

const hemiLight = new THREE.HemisphereLight(0x000000, 0xff0000, 5);
scene.add(hemiLight);

// https://thrill-project.com/archiv/coding/bitmap/ for creating new "sprites"
const asciiShader = {

    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(w, h) },
        mouse: { value: new THREE.Vector4() } // optional
    },

    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec4 mouse;

        varying vec2 vUv;

        float character(int n, vec2 p)
        {
            p = floor(p*vec2(-4.0, 4.0) + 2.5);
            if (clamp(p.x, 0.0, 4.0) == p.x)
            {
                if (clamp(p.y, 0.0, 4.0) == p.y)
                {
                    int a = int(round(p.x) + 5.0 * round(p.y));
                    if (((n >> a) & 1) == 1) return 1.0;
                }
            }
            return 0.0;
        }

        void main() {
            vec2 fragCoord = vUv * resolution;
            vec2 pix = fragCoord.xy;

            vec3 col = texture2D(tDiffuse, floor(pix/16.0)*16.0 / resolution.xy).rgb;

            float gray = 0.3 * col.r + 0.59 * col.g + 0.11 * col.b;

            int n = 4096;
            /*
            if (gray > 0.0233) n = 4096;
            if (gray > 0.0465) n = 131200;
            if (gray > 0.0698) n = 4329476;
            if (gray > 0.0930) n = 459200;
            if (gray > 0.1163) n = 4591748;
            if (gray > 0.1395) n = 12652620;
            if (gray > 0.1628) n = 14749828;
            if (gray > 0.1860) n = 18393220;
            if (gray > 0.2093) n = 15239300;
            if (gray > 0.2326) n = 17318431;
            if (gray > 0.2558) n = 32641156;
            if (gray > 0.2791) n = 18393412;
            if (gray > 0.3023) n = 18157905;
            if (gray > 0.3256) n = 17463428;
            if (gray > 0.3488) n = 14954572;
            if (gray > 0.3721) n = 13177118;
            if (gray > 0.3953) n = 6566222;
            if (gray > 0.4186) n = 16269839;
            if (gray > 0.4419) n = 18444881;
            if (gray > 0.4651) n = 18400814;
            if (gray > 0.4884) n = 33061392;
            if (gray > 0.5116) n = 15255086;
            if (gray > 0.5349) n = 32045584;
            if (gray > 0.5581) n = 18405034;
            if (gray > 0.5814) n = 15022158;
            if (gray > 0.6047) n = 15018318;
            if (gray > 0.6279) n = 16272942;
            if (gray > 0.6512) n = 18415153;
            if (gray > 0.6744) n = 32641183;
            if (gray > 0.6977) n = 32540207;
            if (gray > 0.7209) n = 18732593;
            if (gray > 0.7442) n = 18667121;
            if (gray > 0.7674) n = 16267326;
            if (gray > 0.7907) n = 32575775;
            if (gray > 0.8140) n = 15022414;
            if (gray > 0.8372) n = 15255537;
            if (gray > 0.8605) n = 32032318;
            if (gray > 0.8837) n = 32045617;
            if (gray > 0.9070) n = 33081316;
            if (gray > 0.9302) n = 32045630;
            if (gray > 0.9535) n = 33061407;
            if (gray > 0.9767) n = 11512810;
            */
            // limited character set
            
            if (gray > 0.2) n = 65600;    // :
	        if (gray > 0.3) n = 163153;   // *
	        if (gray > 0.4) n = 15255086; // o 
	        if (gray > 0.5) n = 13121101; // &
	        if (gray > 0.6) n = 15252014; // 8
	        if (gray > 0.7) n = 13195790; // @
	        if (gray > 0.8) n = 11512810; // #
            

            vec2 p = mod(pix/8.0, 2.0) - vec2(1.0);

            if (mouse.z > 0.5)
                col = vec3(character(n, p));
            else
                col = col * character(n, p);

            gl_FragColor = vec4(col, 1.0);
        }
    `
};

const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const shaderPass = new ShaderPass( asciiShader );
composer.addPass( shaderPass );
const bloomPass = new BloomPass( 2, 25, .75 );
composer.addPass( bloomPass );
const outputPass = new OutputPass();
composer.addPass( outputPass );

controls.update();
function animate() {
    //if (model) {
    //model.rotation.y = mouseX * -.01;
    //model.rotation.x = mouseY * -.01;
    //}

    requestAnimationFrame(animate);
    composer.render();
    //renderer.render(scene, camera);
}
animate();