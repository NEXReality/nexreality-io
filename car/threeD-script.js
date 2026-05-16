// Car configurator 3D viewer - loads and displays Porsche 911 GLB
// Pattern based on jersey-configurator threeD-script.js

const DEBUG_MODE = window.location.hash === '#debug';
function debugLog(...args) {
    if (DEBUG_MODE) console.log(...args);
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// Path to the Porsche model (relative to car-configurator folder)
const CAR_MODEL_PATH = 'Porsche_911_Carrera_GTS_2025.glb';

function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\/car-configurator\/([^/]+\/)/g) || []).length;
    return depth === 0 ? './' : '../';
}

window.getBasePath = getBasePath;

class CarViewer {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        if (!this.container) {
            console.error('Container ' + containerId + ' not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.current3DObject = null;
        this.animationId = null;
        this.gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/libs/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);

        // Camera defaults for car view
        this.initialCameraPosition = new THREE.Vector3(1.5, 1.2, 3.5);
        this.initialControlsTarget = new THREE.Vector3(0, 0, 0);

        this.carBodyDefaultColor = null;
        this.currentColorIndex = 0;
        this.loadingEl = document.getElementById('viewer-loading');
        this.modelLoadProgress = 0;
        this.envLoadProgress = 0;
    }

    setLoadingProgress(percent, label) {
        if (!this.loadingEl) return;
        var bar = this.loadingEl.querySelector('.viewer-loading-bar');
        var text = this.loadingEl.querySelector('.viewer-loading-text');
        if (bar) bar.style.width = Math.max(0, Math.min(100, percent)) + '%';
        if (text && label) text.textContent = label;
    }

    updateCombinedProgress(label) {
        var pct = (this.modelLoadProgress + this.envLoadProgress) / 2;
        this.setLoadingProgress(pct, label || 'Loading…');
    }

    hideLoading() {
        if (!this.loadingEl) return;
        this.loadingEl.classList.add('is-hidden');
        window.setTimeout(function () {
            if (this.loadingEl && this.loadingEl.parentNode) {
                this.loadingEl.parentNode.removeChild(this.loadingEl);
            }
        }.bind(this), 400);
    }

    revealViewer() {
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.style.visibility = 'visible';
        }
        this.hideLoading();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);

        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000);
        this.camera.position.set(
            this.initialCameraPosition.x,
            this.initialCameraPosition.y,
            this.initialCameraPosition.z
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        const placeholder = this.container.querySelector('.viewer-placeholder');
        if (placeholder) placeholder.remove();
        this.renderer.domElement.style.visibility = 'hidden';
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 30;
        this.controls.target.copy(this.initialControlsTarget);

        this.createLights();
        this.createGroundPlane();
        this.loadSceneAssets();
        this.animate();
        this.setupResize();
        this.setupCameraReset();
    }

    createLights() {
        this.lightsContainer = new THREE.Object3D();
        this.scene.add(this.lightsContainer);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.lightsContainer.add(this.ambientLight);

        this.keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.keyLight.position.set(-4, 4, 4);
        this.keyLight.castShadow = true;
        this.lightsContainer.add(this.keyLight);

        this.fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        this.fillLight.position.set(4, 2, -2);
        this.lightsContainer.add(this.fillLight);

        this.backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.backLight.position.set(0, 3, -4);
        this.lightsContainer.add(this.backLight);
    }

    loadEnvironmentMapAsync(basePath) {
        var self = this;
        var envPath = basePath + 'env.hdr';
        return new Promise(function (resolve) {
            var pmremGenerator = new THREE.PMREMGenerator(self.renderer);
            pmremGenerator.compileEquirectangularShader();

            new HDRLoader().load(envPath, function (hdrEquirect) {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
                self.scene.environment = pmremGenerator.fromEquirectangular(hdrEquirect).texture;
                self.scene.environmentIntensity = 1.0;
                hdrEquirect.dispose();
                pmremGenerator.dispose();
                self.envLoadProgress = 100;
                self.updateCombinedProgress('Loading environment…');
                debugLog('Environment map loaded:', envPath);
                resolve();
            }, function (progress) {
                if (progress.total) {
                    self.envLoadProgress = (100 * progress.loaded) / progress.total;
                    self.updateCombinedProgress('Loading environment…');
                }
            }, function (err) {
                console.warn('env.hdr failed:', err);
                pmremGenerator.dispose();
                self.envLoadProgress = 100;
                resolve();
            });
        });
    }

    loadModelAsync(basePath) {
        var self = this;
        var modelPath = basePath + CAR_MODEL_PATH;
        return new Promise(function (resolve, reject) {
            self.gltfLoader.load(modelPath, resolve, function (progress) {
                if (progress.total) {
                    self.modelLoadProgress = (100 * progress.loaded) / progress.total;
                    self.updateCombinedProgress('Loading model…');
                    debugLog('Loading:', self.modelLoadProgress.toFixed(0) + '%');
                }
            }, reject);
        });
    }

    applyLoadedModel(gltf) {
        if (this.current3DObject) {
            this.scene.remove(this.current3DObject);
            this.current3DObject = null;
        }

        this.current3DObject = gltf.scene;

        const box = new THREE.Box3().setFromObject(this.current3DObject);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        this.current3DObject.scale.setScalar(scale);
        this.current3DObject.position.sub(center.multiplyScalar(scale));

        this.scene.add(this.current3DObject);
        this.current3DObject.traverse(function (child) {
            if (child.isMesh && child.material) {
                var mat = child.material;
                if ((mat.name || '').toLowerCase() === 'carbody' && (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) {
                    this.carBodyDefaultColor = mat.color.clone();
                    debugLog('Stored carBody default color:', '#' + mat.color.getHexString());
                }
            }
        }.bind(this));
        this.setCarColor(this.currentColorIndex);
        debugLog('Car model loaded and added to scene');
    }

    loadSceneAssets() {
        var basePath = getBasePath();
        this.modelLoadProgress = 0;
        this.envLoadProgress = 0;
        this.setLoadingProgress(0, 'Loading…');

        var self = this;
        Promise.all([
            this.loadModelAsync(basePath),
            this.loadEnvironmentMapAsync(basePath)
        ]).then(function (results) {
            self.applyLoadedModel(results[0]);
            self.revealViewer();
        }).catch(function (error) {
            self.setLoadingProgress(0, 'Failed to load');
            console.error('Error loading scene:', error);
        });
    }

    setCarColor(index) {
        this.currentColorIndex = index;
        if (!this.current3DObject) return;
        var color = index === 0 && this.carBodyDefaultColor
            ? this.carBodyDefaultColor.clone()
            : new THREE.Color(0x97132E);
        this.current3DObject.traverse(function (child) {
            if (!child.isMesh || !child.material) return;
            var mat = child.material;
            var name = (mat.name || '').toLowerCase();
            if (name === 'carbody' && (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial)) {
                mat.color.copy(color);
            }
        });
    }

    createGroundPlane() {
        var radius = 8;
        var groundGeometry = new THREE.CircleGeometry(radius, 64);
        var canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
        gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.03)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.01)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        var shadowTexture = new THREE.CanvasTexture(canvas);
        shadowTexture.needsUpdate = true;
        var groundMaterial = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            color: 0xffffff
        });
        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.position.set(0, -0.36, 0);
        this.scene.add(this.groundPlane);
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;
        this.animationId = requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        const onResize = () => {
            if (!this.container || !this.camera || !this.renderer) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);
    }

    setupCameraReset() {
        this.renderer.domElement.addEventListener('dblclick', () => this.resetCamera());
    }

    resetCamera() {
        this.camera.position.copy(this.initialCameraPosition);
        this.controls.target.copy(this.initialControlsTarget);
    }
}

let carViewer;

window.CarViewer = CarViewer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewer);
} else {
    initViewer();
}

function initViewer() {
    carViewer = new CarViewer('.viewer-container');
    window.carViewer = carViewer;
    carViewer.init();
}

export { carViewer, CarViewer };
