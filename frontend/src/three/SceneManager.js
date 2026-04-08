/**
 * SceneManager.js
 * ─────────────────────────────────────────────────────────────
 * Pure Three.js class. Zero React. Zero DOM concerns.
 * React components call methods on this class.
 * Keeps 3D logic fully separated from UI logic.
 *
 * Usage:
 *   const sm = new SceneManager(canvasContainer)
 *   sm.loadModel(url)
 *   sm.applyMaterial('walnut')
 *   sm.updateDimensions({ W, H, D, T })
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter }  from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RGBELoader }    from 'three/examples/jsm/loaders/RGBELoader.js';
import { buildMaterial } from '../services/materialService.js';

// Default mesh dimensions (match your GLB export values)
const DEF = { W: 100, H: 70, D: 50, T: 3 };

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.meshTop   = null;
    this.meshLeft  = null;
    this.meshRight = null;
    this.model     = null;
    this._onProgress = null;
    this._onLoaded   = null;

    this._initScene();
    this._initLights();
    this._initGround();
    this._initRenderer();
    this._initControls();
    this._loadEnvironment();
    this._startLoop();
    this._handleResize();
  }

  // ── Internal setup ────────────────────────────────────────

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a2230);
    this.scene.fog = new THREE.FogExp2(0x1a2230, 0.00075);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this._aspect(),
      0.1,
      3000
    );
    this.camera.position.set(220, 160, 220);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true, // needed for screenshot
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this._vpW(), this._vpH());
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding    = THREE.sRGBEncoding;
    this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.38;
    this.container.appendChild(this.renderer.domElement);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping  = true;
    this.controls.dampingFactor  = 0.05;
    this.controls.minDistance    = 50;
    this.controls.maxDistance    = 800;
    this.controls.maxPolarAngle  = Math.PI / 2.02;
    this.controls.target.set(0, 35, 0);
    this.controls.update();
  }

  _initLights() {
    // Ambient fill
    this.scene.add(new THREE.AmbientLight(0xf5f8ff, 0.72));

    // Hemisphere sky/ground
    this.scene.add(new THREE.HemisphereLight(0xd4e4ff, 0x3a2f3d, 0.8));

    // Key light with shadows
    const key = new THREE.DirectionalLight(0xfff1d2, 2.45);
    key.position.set(170, 240, 130);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near   = 1;
    key.shadow.camera.far    = 600;
    key.shadow.camera.left   = -200;
    key.shadow.camera.right  =  200;
    key.shadow.camera.top    =  200;
    key.shadow.camera.bottom = -200;
    key.shadow.bias = -0.0003;
    this.scene.add(key);

    // Soft cool fill from opposite side
    const fill = new THREE.DirectionalLight(0xcfe2ff, 1.2);
    fill.position.set(-180, 120, -120);
    this.scene.add(fill);

    // Rim light to separate silhouette from dark background
    const rim = new THREE.DirectionalLight(0xb8d7ff, 0.95);
    rim.position.set(-40, 150, 240);
    this.scene.add(rim);
  }

  _initGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshStandardMaterial({ color: 0x1a2435, roughness: 0.92, metalness: 0.03 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(600, 60, 0x4b6185, 0x2e415e);
    grid.material.opacity = 0.28;
    grid.material.transparent = true;
    grid.position.y = 0.1;
    this.scene.add(grid);

    // Back plate adds subtle separation so the model doesn't blend into the horizon.
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(1300, 700),
      new THREE.MeshStandardMaterial({ color: 0x223049, roughness: 1, metalness: 0 })
    );
    backdrop.position.set(0, 280, -430);
    this.scene.add(backdrop);
  }

  // HDRI environment map for realistic reflections
  _loadEnvironment() {
    const rgbeLoader = new RGBELoader();
    // Try loading HDRI — silently skip if not present
    rgbeLoader.load(
      '/hdri/studio.hdr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
      },
      undefined,
      () => {
        // No HDRI — that's fine, lights handle it
      }
    );
  }

  _startLoop() {
    const loop = () => {
      this._rafId = requestAnimationFrame(loop);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  _handleResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this._aspect();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this._vpW(), this._vpH());
    });
  }

  _vpW()     { return window.innerWidth  - 300; } // 300px sidebar
  _vpH()     { return window.innerHeight - 56;  } // 56px header
  _aspect()  { return this._vpW() / this._vpH(); }

  // ── Public API ────────────────────────────────────────────

  /**
   * loadModel(url, { onProgress, onLoaded })
   * Loads a GLB/GLTF, identifies parts, fits camera.
   */
  loadModel(url, { onProgress, onLoaded } = {}) {
    // Remove previous model
    if (this.model) {
      this.scene.remove(this.model);
      this.model = this.meshTop = this.meshLeft = this.meshRight = null;
    }

    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const sourceScene = gltf.scene;

        // Scan imported meshes and discover configurator parts
        sourceScene.traverse((child) => {
          if (!child.isMesh) return;
          child.castShadow = child.receiveShadow = true;
          // Log for debugging
          child.geometry.computeBoundingBox();
          const b = child.geometry.boundingBox;
          console.log(`[Mesh] ${child.name}`,
            `X:${(b.max.x-b.min.x).toFixed(1)}`,
            `Y:${(b.max.y-b.min.y).toFixed(1)}`,
            `Z:${(b.max.z-b.min.z).toFixed(1)}`
          );
          // Assign parts
          if (child.name === 'mesh_0') this.meshTop   = child;
          if (child.name === 'mesh_1') this.meshLeft  = child;
          if (child.name === 'mesh_2') this.meshRight = child;
        });

        // If known configurator parts are present, isolate them from the imported scene
        // so environment/extra objects in the GLB do not hide or mix with the configurator.
        if (this.meshTop && this.meshLeft && this.meshRight) {
          const model = new THREE.Group();
          model.name = 'configurator_model';

          const clonePart = (mesh) => {
            const part = new THREE.Mesh(mesh.geometry, mesh.material);
            part.name = mesh.name;
            part.castShadow = true;
            part.receiveShadow = true;
            return part;
          };

          this.meshTop = clonePart(this.meshTop);
          this.meshLeft = clonePart(this.meshLeft);
          this.meshRight = clonePart(this.meshRight);

          model.add(this.meshTop, this.meshLeft, this.meshRight);
          this.model = model;
        } else {
          this.model = sourceScene;
        }

        this.scene.add(this.model);
        this._fitCamera();
        URL.revokeObjectURL(url);
        onLoaded?.();
      },
      (xhr) => {
        const pct = xhr.total > 0 ? Math.round(xhr.loaded / xhr.total * 100) : 0;
        onProgress?.(pct);
      },
      (err) => {
        console.error('[SceneManager] Load error:', err);
        onLoaded?.('error');
      }
    );
  }

  /**
   * updateDimensions({ W, H, D, T })
   * Rescales and repositions each mesh independently.
   */
  updateDimensions({ W, H, D, T }) {
    if (!this.meshTop || !this.meshLeft || !this.meshRight) return;

    // Scale each part on the correct axis
    this.meshTop.scale.set(   W / DEF.W,  T / DEF.T,  D / DEF.D );
    this.meshLeft.scale.set(  T / DEF.T,  H / DEF.H,  D / DEF.D );
    this.meshRight.scale.set( T / DEF.T,  H / DEF.H,  D / DEF.D );

    // Reposition to stay connected
    this.meshTop.position.set(  0,               H + (T / 2), 0 );
    this.meshLeft.position.set( -(W/2) + (T/2),  H / 2,       0 );
    this.meshRight.position.set( (W/2) - (T/2),  H / 2,       0 );

    // Sit flush on ground
    this.model.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(this.model);
    this.model.position.y = -box.min.y;
  }

  /**
   * applyMaterial(materialKey)
   * Applies PBR material to all meshes.
   */
  applyMaterial(materialKey) {
    if (!this.model) return;
    const mat = buildMaterial(materialKey);
    this.model.traverse((child) => {
      if (child.isMesh) child.material = mat;
    });
  }

  /**
   * exportGLB() → downloads .glb file
   */
  exportGLB() {
    if (!this.model) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      this.model,
      (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href     = URL.createObjectURL(blob);
        link.download = 'furniture_config.glb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      },
      (err) => console.error('[Export]', err),
      { binary: true, onlyVisible: true }
    );
  }

  /**
   * screenshot() → downloads PNG
   */
  screenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'furniture_render.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * resetCamera()
   */
  resetCamera() {
    this.camera.position.set(220, 160, 220);
    this.controls.target.set(0, 35, 0);
    this.controls.update();
  }

  /**
   * destroy() — cleanup on unmount
   */
  destroy() {
    cancelAnimationFrame(this._rafId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  // ── Private ───────────────────────────────────────────────

  _fitCamera() {
    const box    = new THREE.Box3().setFromObject(this.model);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov    = this.camera.fov * (Math.PI / 180);
    const dist   = Math.abs(maxDim / Math.sin(fov / 2)) * 0.9;

    this.camera.position.set(
      center.x + dist * 0.65,
      center.y + dist * 0.45,
      center.z + dist * 0.65
    );
    this.controls.target.copy(center);
    this.controls.update();
  }
}
