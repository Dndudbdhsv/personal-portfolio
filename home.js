import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//  Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x161624);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

//  Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 5);

//  Scene setup
const scene = new THREE.Scene();

//  Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

//  Controls (Interactive Rotation)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.target.set(0, 0.1, 0);
controls.maxPolarAngle = Math.PI / 2;
controls.update();

//  Ground plane
const groundGeometry = new THREE.PlaneGeometry(10, 5, 2, 20);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x131327,
  side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.castShadow = false;
groundMesh.receiveShadow = true;
scene.add(groundMesh);



//  Load GLTF Model
const loader = new GLTFLoader();
loader.setPath('imac_24_m1_green_2021_gltf/');

loader.load('scene.gltf', (gltf) => {
  console.log('Model Loaded ✅');

  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Compute bounding box
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const scaleFactor = 2 / Math.max(size.x, size.y, size.z); // Normalize size
  model.scale.setScalar(scaleFactor);

  // Adjust model position 
  const minY = box.min.y * scaleFactor;
  model.position.set(-center.x * scaleFactor, -minY, -center.z * scaleFactor);

  scene.add(model);
}, (xhr) => {
  console.log(`Loading: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
}, (error) => {
  console.error('Error loading model:', error);
});

//  Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

//  Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
