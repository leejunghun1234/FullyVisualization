import * as THREE from "three";
import { MapControls } from 'three/addons/controls/MapControls.js';
import { loadMeshes } from "./src/meshLoader.js";
import { sliderControls } from "./src/slider.js";
import { MakeChart } from "./src/makeChart.js";
import { clickEvent } from "./src/clickEvent.js";
import { rightPanelButtonClick } from "./src/rightPanelButton.js";
import { SelectCat } from "./selectCat.js";

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

    sliderControls("fully-slider", timeKeys, timeLog, allGroup, meshDict,
        chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8, chart9, chart10,
        myCanvas1, myCanvas2, myCanvas3, myCanvas4, myCanvas5, myCanvas6, myCanvas7, myCanvas8, myCanvas9, myCanvas10
    );
    clickEvent(renderer, camera, allGroup);
    rightPanelButtonClick();

    const exportButton = document.getElementById("export-button");
    exportButton.addEventListener('click', () => {
        const visibleElem = []
        const answer = {
            "Wall": [], "Curtain Wall": [], "Floor": [], "Ceiling": [], "Column": [],
            "Structural Column": [], "Window": [], "Door": [], "Railing": [],
            "Stair": [], "Furniture": [], "Roof": [], "All": []
        };

        for (const i of allGroup) {
            if (i.visible == true) {
                const elemid = i.userData.Common.ElementId;
                const id = elemid // elemid.split("_")[0];
                console.log(id);
                const cat = i.userData.Common.ElementCategory;

                answer["All"].push(id)

                if (cat === "Walls") {
                    answer["Wall"].push(id);
                } else if (cat === "Curtain Walls") {
                    answer["Curtain Wall"].push(id);
                } else if (cat === "Floors") {
                    answer["Floor"].push(id);
                } else if (cat === "Ceilings") {
                    answer["Ceiling"].push(id);
                } else if (cat === "Roofs") {
                    answer["Roof"].push(id);
                } else if (cat === "Columns") {
                    answer["Column"].push(id);
                } else if (cat === "Structural Columns") {
                    answer["Structural Column"].push(id);
                } else if (cat === "Windows") {
                    answer["Window"].push(id);
                } else if (cat === "Doors") {
                    answer["Door"].push(id);
                } else if (cat === "Railings") {
                    answer["Railing"].push(id);
                } else if (cat === "Stairs") {
                    answer["Stair"].push(id);
                } else if (cat === "Furniture") {
                    answer["Furniture"].push(id);
                } else {
                    console.log(cat);
                    continue;
                }
            }
        }
        
        const jsonStr = JSON.stringify(answer, null, 2);

        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "export.json";  // 다운로드 파일명
        link.click();

        URL.revokeObjectURL(url);
    });

    // animate 실행
    animate();

    function animate() {
        controls.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
}

