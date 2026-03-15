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

export default function Globe3D({ className = '' }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 6;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(5, 4, 5);
    const fillLight = new THREE.PointLight(0x6666cc, 0.25);
    fillLight.position.set(-6, -4, -4);
    scene.add(ambient, dirLight, fillLight);

    // Globe group
    const group = new THREE.Group();
    scene.add(group);

    // Base sphere
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x0b0b1a, shininess: 35, specular: new THREE.Color(0x333366) });
    const baseMesh = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 64), baseMat);
    group.add(baseMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.055 });
    const wireMesh = new THREE.Mesh(new THREE.SphereGeometry(2.02, 18, 18), wireMat);
    group.add(wireMesh);

    // City pins
    const pinGeo = new THREE.SphereGeometry(0.042, 8, 8);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    CITIES.forEach(c => {
      const pin = new THREE.Mesh(pinGeo, pinMat);
      const pos = latLngToVec3(c.lat, c.lng, 2.08);
      pin.position.copy(pos);
      group.add(pin);
    });

    // Atmosphere glow (inner)
    const atmoMat = new THREE.MeshBasicMaterial({ color: 0x2222aa, transparent: true, opacity: 0.035, side: THREE.BackSide });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.45, 32, 32), atmoMat));

    // Outer halo
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.018, side: THREE.BackSide });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.9, 32, 32), haloMat));

    // Resize handler
    const onResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener('resize', onResize);

    // Mouse move
    const onMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Animation loop
    let lastTime = 0;
    const animate = (time) => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      group.rotation.y += delta * 0.07;
      const tx = mouseRef.current.y * 0.18;
      group.rotation.x += (tx - group.rotation.x) * 0.04;
      renderer.render(scene, camera);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
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
