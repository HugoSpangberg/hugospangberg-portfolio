import { useEffect, useRef, useState } from 'react';
import { publicAssetUrl } from '../../../utils/publicAssetUrl';

type AiCoreSceneProps = {
  sceneLabel: string;
  loadingLabel: string;
  fallbackLabel: string;
  active: boolean;
};

type SceneStatus = 'loading' | 'ready' | 'fallback';

function isWebGlAvailable() {
  const canvas = document.createElement('canvas');

  try {
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2', { powerPreference: 'low-power' }) ||
          canvas.getContext('webgl', { powerPreference: 'low-power' }) ||
          canvas.getContext('experimental-webgl', { powerPreference: 'low-power' })),
    );
  } catch {
    return false;
  }
}

function AiCoreScene({ sceneLabel, loadingLabel, fallbackLabel, active }: AiCoreSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<SceneStatus>('loading');

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || !active || !isWebGlAvailable()) {
      setStatus('fallback');
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let isVisible = true;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    setStatus('loading');

    async function bootScene() {
      const [
        {
          ACESFilmicToneMapping,
          AmbientLight,
          AnimationMixer,
          Box3,
          Clock,
          Color,
          DirectionalLight,
          Group,
          MathUtils,
          Mesh,
          PCFSoftShadowMap,
          PerspectiveCamera,
          PointLight,
          Scene,
          SRGBColorSpace,
          TOUCH,
          Vector3,
          WebGLRenderer,
        },
        { GLTFLoader },
        { OrbitControls },
      ] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/controls/OrbitControls.js'),
      ]);

      if (disposed || !mountRef.current) {
        return;
      }

      const currentMount = mountRef.current;
      const scene = new Scene();
      scene.background = new Color(0x07120f);

      const camera = new PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0.18, 1.6, 4.65);

      const renderer = new WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = PCFSoftShadowMap;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      currentMount.appendChild(renderer.domElement);

      const root = new Group();
      scene.add(root);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.rotateSpeed = 0.42;
      controls.zoomSpeed = 0.48;
      controls.minDistance = 3.25;
      controls.maxDistance = 5.35;
      controls.minPolarAngle = Math.PI * 0.22;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minAzimuthAngle = -Math.PI * 0.26;
      controls.maxAzimuthAngle = Math.PI * 0.26;
      controls.touches.ONE = TOUCH.ROTATE;
      controls.touches.TWO = TOUCH.DOLLY_ROTATE;
      controls.target.set(0, 0.38, 0);

      const key = new DirectionalLight(0xd8fff0, 2.5);
      key.position.set(3.2, 4.4, 4.2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      const fill = new AmbientLight(0x7ddfbd, 0.42);
      scene.add(fill);

      const rim = new DirectionalLight(0x8cc6ff, 1.2);
      rim.position.set(-3.5, 2.2, -2.4);
      scene.add(rim);

      const coreGlow = new PointLight(0x72f2a3, 1.2, 6);
      coreGlow.position.set(0, 0.5, 1.4);
      scene.add(coreGlow);

      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(publicAssetUrl('models/ai-core/ai-core.glb'));

      if (disposed) {
        return;
      }

      const model = gltf.scene;
      model.traverse((object) => {
        if (object instanceof Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      const bounds = new Box3().setFromObject(model);
      const size = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.42 / maxAxis;

      model.position.sub(center);
      model.scale.setScalar(scale);
      root.position.set(0, 0.78, 0);
      root.add(model);

      const clock = new Clock();
      const mixer = gltf.animations.length > 0 ? new AnimationMixer(model) : undefined;
      gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());

      const resize = () => {
        if (!mountRef.current) {
          return;
        }

        const { clientWidth, clientHeight } = mountRef.current;
        const width = Math.max(clientWidth, 1);
        const height = Math.max(clientHeight, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const observer =
        'IntersectionObserver' in window
          ? new IntersectionObserver(
              ([entry]) => {
                isVisible = Boolean(entry?.isIntersecting);
              },
              { threshold: 0.08 },
            )
          : undefined;

      observer?.observe(currentMount);
      cleanups.push(() => observer?.disconnect());
      window.addEventListener('resize', resize);
      cleanups.push(() => window.removeEventListener('resize', resize));
      resize();

      const render = () => {
        if (disposed) {
          return;
        }

        const delta = clock.getDelta();
        const elapsed = clock.elapsedTime;

        if (isVisible) {
          mixer?.update(prefersReducedMotion ? delta * 0.15 : delta);

          if (!prefersReducedMotion) {
            root.rotation.y = Math.sin(elapsed * 0.16) * 0.08;
            root.rotation.x = Math.sin(elapsed * 0.16) * 0.035;
            coreGlow.intensity = 1.05 + Math.sin(elapsed * 1.25) * 0.18;
          }

          controls.target.x = MathUtils.lerp(controls.target.x, 0, 0.04);
          controls.target.y = MathUtils.lerp(controls.target.y, 0.38, 0.04);
          controls.update();
          renderer.render(scene, camera);
        }

        animationFrame = window.requestAnimationFrame(render);
      };

      setStatus('ready');
      render();

      cleanups.push(() => {
        window.cancelAnimationFrame(animationFrame);
        controls.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        scene.traverse((object) => {
          if (!(object instanceof Mesh)) {
            return;
          }

          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value && typeof value === 'object' && 'dispose' in value) {
                (value as { dispose: () => void }).dispose();
              }
            });
            material.dispose();
          });
        });
      });
    }

    bootScene().catch(() => {
      if (!disposed) {
        setStatus('fallback');
      }
    });

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [active]);

  return (
    <div
      className="local-ai-scene"
      data-scene-status={status}
      role="img"
      aria-label={status === 'fallback' ? fallbackLabel : sceneLabel}
    >
      {status !== 'ready' ? (
        <img
          className="local-ai-scene__poster"
          src={publicAssetUrl('images/ai-core/ai-core-poster.png')}
          alt=""
          aria-hidden="true"
        />
      ) : null}
      <div ref={mountRef} className="local-ai-scene__mount" aria-hidden="true" />
      {status === 'loading' ? <span>{loadingLabel}</span> : null}
    </div>
  );
}

export default AiCoreScene;
