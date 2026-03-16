import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function latLngToVec3(lat, lng, r = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const CITIES = [
  { lat: 37.5665, lng: 126.978 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: 25.2048, lng: 55.2708 },
  { lat: 38.7223, lng: -9.1393 },
  { lat: 39.7392, lng: -104.9903 },
  { lat: 51.5074, lng: -0.1278 },
  { lat: 40.7128, lng: -74.006 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: 48.8566, lng: 2.3522 },
  { lat: 19.076, lng: 72.8777 },
  { lat: -23.5505, lng: -46.6333 },
];

// Vertex shader (shared)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader — isolates land from ocean using color analysis
const landFragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    float r = c.r, g = c.g, b = c.b;

    // Ocean detection: blue channel notably exceeds red (deep blue water)
    float blueExcess = b - max(r, g);
    float oceanFactor = smoothstep(0.03, 0.28, blueExcess);
    float land = 1.0 - oceanFactor;

    // Also knock out very dark polar regions / clouds
    float brightness = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    float notEmpty = smoothstep(0.08, 0.2, brightness);

    float finalLand = land * notEmpty;
    float gray = brightness * finalLand * 0.45;
    gl_FragColor = vec4(vec3(gray), finalLand * 0.6);
  }
`;

export default function Globe3D({ className = '' }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── Renderer ───
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ─── Scene & Camera ───
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 6;

    // ─── Lights ───
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(5, 4, 5);
    scene.add(dirLight);
    const fillLight = new THREE.PointLight(0x6666cc, 0.25);
    fillLight.position.set(-6, -4, -4);
    scene.add(fillLight);

    // ─── Globe Group ───
    const group = new THREE.Group();
    scene.add(group);

    // Base sphere (dark navy)
    const baseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x0b0b1a, shininess: 35, specular: new THREE.Color(0x333366) })
    );
    group.add(baseMesh);

    // Wireframe grid
    const wireMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.02, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.04 })
    );
    group.add(wireMesh);

    // City pins
    const pinGeo = new THREE.SphereGeometry(0.042, 8, 8);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    CITIES.forEach(c => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(latLngToVec3(c.lat, c.lng, 2.08));
      group.add(pin);
    });

    // ─── Atmosphere layers ───
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.45, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x2222aa, transparent: true, opacity: 0.035, side: THREE.BackSide })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.9, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.018, side: THREE.BackSide })
    ));

    // ─── Continent texture overlay ───
    const loader = new THREE.TextureLoader();
    const earthTexUrl = 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/textures/planets/earth_atmos_2048.jpg';
    loader.load(
      earthTexUrl,
      (tex) => {
        if (!mountedRef.current) return;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const landMat = new THREE.ShaderMaterial({
          uniforms: { map: { value: tex } },
          vertexShader,
          fragmentShader: landFragmentShader,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const landMesh = new THREE.Mesh(new THREE.SphereGeometry(2.007, 64, 64), landMat);
        group.add(landMesh);
      },
      undefined,
      () => { /* texture failed — wireframe globe still shows */ }
    );

    // ─── Resize ───
    const onResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    onResize();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);

    // ─── Mouse ───
    const onMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ─── Animation loop ───
    let lastTime = 0;
    const animate = (time) => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      group.rotation.y += delta * 0.07;
      const tx = mouseRef.current.y * 0.18;
      group.rotation.x += (tx - group.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
