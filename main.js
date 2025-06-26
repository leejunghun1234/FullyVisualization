import * as THREE from "three";
import { MapControls } from 'three/addons/controls/MapControls.js';

export function main(shapeLog, timeLog) {
    const window = document.getElementById("render-target");
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F5F5DC");
    
    const lightConfigs = [
        [0, 3, 0],
        [0, 3, 5],
        [5, 3, 0],
        [-5, 3, 5],
        [5, 3, -5],
        [0, 3, -5],
        [-5, 3, 0],
    ];

    lightConfigs.forEach(pos => {
        const light = new THREE.DirectionalLight(0xffffff, 0.7);
        light.position.set(...pos);
        light.castShadow = true;
        light.shadow.bias = -0.0005;
        light.shadow.mapSize.width = 1024; // 그림자 품질 낮추면 퍼지게 보임
        light.shadow.mapSize.height = 1024;
        scene.add(light);
    });

    // 조명 설정2
    const ambientLight = new THREE.AmbientLight(0x000000); // 부드러운 전체광
    scene.add(ambientLight);

    // renderer 설정
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.clientWidth, window.clientHeight, false);
    window.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(75, window.offsetWidth / window.offsetHeight, 0.01, 5000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1, 0);

    window.addEventListener("resize", onWindowResize);

    const controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // animate 실행
    animate();

    function animate() {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}