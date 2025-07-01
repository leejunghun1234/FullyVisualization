import * as THREE from "three";
import { MapControls } from 'three/addons/controls/MapControls.js';
import { loadMeshes } from "./src/meshLoader.js";
import { sliderControls } from "./src/slider.js";
import { MakeChart } from "./src/makeChart.js";

export function main(
    shapeLog, 
    timeLog, 
    wallQ, 
    ctWallQ, 
    floorQ, 
    ceilingQ, 
    columnQ, 
    stColumnQ, 
    stairQ, 
    railingQ, 
    windowQ, 
    doorQ) {
    const container = document.getElementById("render-target");
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
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    container.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.01, 5000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1, 0);

    // Control 설정
    const controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // window.addEventListener("resize", onWindowResize);
    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    resizeObserver.observe(container);


    // .d8888. d888888b .88b  d88. d8888b. db      d88888b      .d8888. d88888b d888888b d888888b d888888b d8b   db  d888b       d88888b d8b   db d8888b. .d8888. 
    // 88'  YP   `88'   88'YbdP`88 88  `8D 88      88'          88'  YP 88'     `~~88~~' `~~88~~'   `88'   888o  88 88' Y8b      88'     888o  88 88  `8D 88'  YP 
    // `8bo.      88    88  88  88 88oodD' 88      88ooooo      `8bo.   88ooooo    88       88       88    88V8o 88 88           88ooooo 88V8o 88 88   88 `8bo.   
    //   `Y8b.    88    88  88  88 88~~~   88      88~~~~~        `Y8b. 88~~~~~    88       88       88    88 V8o88 88  ooo      88~~~~~ 88 V8o88 88   88   `Y8b. 
    // db   8D   .88.   88  88  88 88      88booo. 88.          db   8D 88.        88       88      .88.   88  V888 88. ~8~      88.     88  V888 88  .8D db   8D 
    // `8888Y' Y888888P YP  YP  YP 88      Y88888P Y88888P      `8888Y' Y88888P    YP       YP    Y888888P VP   V8P  Y888P       Y88888P VP   V8P Y8888D' `8888Y' 

    const { allGroup, meshDict } = loadMeshes(shapeLog, scene, 0.2);
    const timeKeys = Object.keys(timeLog).sort();
    const slider = document.getElementById("fully-slider");
    sliderControls("fully-slider", timeKeys, timeLog, allGroup, meshDict);

    const buttons = {
        "quant-button": "info-divs",
        "chart-button": "chart-divs",
        "info-button": "element-divs"
    };

    Object.keys(buttons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener("click", () => {
            const targetId = buttons[buttonId];

            // 모든 cat-divs 그룹 숨김 처리
            document.querySelectorAll(".cat-divs").forEach(div => {
                div.classList.add("hide");
            });

            // 대상 div만 보이기
            document.getElementById(targetId).classList.remove("hide");
        });
    });
    console.log(wallQ);
    const { chart1: chart1, myCanvas: myCanvas1 } = MakeChart(timeKeys, wallQ, "graph-wall");
    const { chart1: chart2, myCanvas: myCanvas2 } = MakeChart(timeKeys, ctWallQ, "graph-curtainWall");
    const { chart1: chart3, myCanvas: myCanvas3 } = MakeChart(timeKeys, floorQ, "graph-floor");
    const { chart1: chart4, myCanvas: myCanvas4 } = MakeChart(timeKeys, ceilingQ, "graph-ceiling");
    const { chart1: chart5, myCanvas: myCanvas5 } = MakeChart(timeKeys, columnQ, "graph-column");
    const { chart1: chart6, myCanvas: myCanvas6 } = MakeChart(timeKeys, stColumnQ, "graph-structuralColumn");
    const { chart1: chart7, myCanvas: myCanvas7 } = MakeChart(timeKeys, stairQ, "graph-stair");
    const { chart1: chart8, myCanvas: myCanvas8 } = MakeChart(timeKeys, railingQ, "graph-railing");
    const { chart1: chart9, myCanvas: myCanvas9 } = MakeChart(timeKeys, windowQ, "graph-forwindow");
    const { chart1: chart10, myCanvas: myCanvas10 } = MakeChart(timeKeys, doorQ, "graph-door");

    // animate 실행
    animate();

    function animate() {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
}

