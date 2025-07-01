export function sliderControls(sliderName, timeKeys, timeJson, allGroup, meshDict,
        chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8, chart9, chart10,
        myCanvas1, myCanvas2, myCanvas3, myCanvas4, myCanvas5, myCanvas6, myCanvas7, myCanvas8, myCanvas9, myCanvas10
    ) {
    const slider = document.getElementById(sliderName);
    const display = document.getElementById('time-button');
    const arrows = document.querySelectorAll(".gapa");

    const rewindButton = document.getElementById('rewind');
    const pauseButton = document.getElementById('pause');
    const playButton = document.getElementById('play');
    const fastForwardButton = document.getElementById('fast-forward');
    
    const increaseButton = document.getElementById('increase-1');
    const decreaseButton = document.getElementById('decrease-1');

    slider.max = timeKeys.length - 1;
    slider.value = timeKeys.length - 1;
    const currentTime = timeKeys[timeKeys.length - 1];
    const parts = currentTime.split("_");
    const formattedDateKR = `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일\n`
                + `${parseInt(parts[3])}시 ${parseInt(parts[4])}분 ${parseInt(parts[5])}초`;
    const formattedDate = `${String(parseInt(parts[2])).padStart(2, '0')}/${String(parseInt(parts[1])).padStart(2, '0')}/${parts[0]}\n`
        + `${String(parseInt(parts[3])).padStart(2, '0')}:${String(parseInt(parts[4])).padStart(2, '0')}:${String(parseInt(parts[5])).padStart(2, '0')}`;

    display.textContent = formattedDate;

    let buttonState = {
        "Walls": false,
        "Curtain Walls": false,
        "Floors": false,
        "Ceilings": false,
        "Columns": false,
        "Structural Columns": false,
        "Stairs": false,
        "Railings": false,
        "Windows": false,
        "Doors": false,
    }

    updateMeshes(currentTime);
    updateInfos(currentTime);
    makeCategoryList(buttonState);

    slider.addEventListener('input', () => {
        const currentIndex = parseInt(slider.value, 10);
        const currentTime = timeKeys[currentIndex];
        const parts = currentTime.split("_");
        const formattedDateKR = `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일\n`
                    + `${parseInt(parts[3])}시 ${parseInt(parts[4])}분 ${parseInt(parts[5])}초`;
        const formattedDate = `${String(parseInt(parts[2])).padStart(2, '0')}/${String(parseInt(parts[1])).padStart(2, '0')}/${parts[0]}\n`
            + `${String(parseInt(parts[3])).padStart(2, '0')}:${String(parseInt(parts[4])).padStart(2, '0')}:${String(parseInt(parts[5])).padStart(2, '0')}`;
        
        display.textContent = `${formattedDate}`;
        updateMeshes(currentTime);
        updateInfos(currentTime);
        makeCategoryList(buttonState);
    });

    function updateMeshes(currentTime) {
        for (const mm of allGroup) {
            mm.visible = false;
        }
        console.log(timeJson);
        console.log(currentTime);
        for (const timelog of timeJson[currentTime]["Elements"]) {
            const groups = meshDict[timelog];
            if (groups === undefined) continue;
            groups.visible = true;
        }
    }

    function updateInfos(currentTime) {
        const timeKeysLength = timeKeys.length - 1;
        const currentTimeLength = (slider.value / timeKeysLength) * 100;
        console.log(currentTimeLength);
        arrows.forEach((arrow) => {
            arrow.style.left = `${currentTimeLength}%`;
        });
        const quantity = Object.keys(timeJson[currentTime]["Quantity"]);
        const infoTarget = document.getElementById("info-target");
        infoTarget.innerHTML = "";
        
        for (const cat of quantity) {
            const catReplace = cat.replace(" ", "-");
            const quantityCat = Object.keys(timeJson[currentTime]["Quantity"][cat]);
            let categoryDiv = document.createElement("div");
            categoryDiv.classList.add("category-container");

            let catNameDiv = document.createElement("div");
            catNameDiv.classList.add("category-name-container");
            catNameDiv.innerHTML = `<div id = "category-title" class="category-title">${cat}</div>`;
            catNameDiv.innerHTML += `<button id = ${catReplace}-category-button class="category-button">▾</button>`; 

            categoryDiv.appendChild(catNameDiv);

            let list = document.createElement("ul");
            list.classList.add("category-list");

            list.id = `${catReplace}-list`;
            let importantInfo = document.createElement("div");
            importantInfo.classList.add("main-quant-div");
            for (const quantityCatQuan of quantityCat) {
                let value = timeJson[currentTime]["Quantity"][cat][quantityCatQuan];
                if (quantityCatQuan === "All Volume"
                    || quantityCatQuan === "All Length"
                    || quantityCatQuan === "Column Volume"
                    || quantityCatQuan === "Column Length"
                    || quantityCatQuan === "Stair Length"
                    || quantityCatQuan === "Railing Length"
                ) {
                    importantInfo.innerHTML += `<div> <span class="main-qunt">${quantityCatQuan}: </span> <span id = "value123" class = "main-value">${(value).toFixed(3)} </span> </div>`;
                } else if (quantityCatQuan === "All Numbers") {
                    importantInfo.innerHTML += `<div> <span class="main-qunt">${quantityCatQuan}: </span> <span id = "value123" class = "main-value">${value} </span> </div>`
                } else if (["Windows", "Doors"].includes(cat)) {
                    let listItem = document.createElement("li");
                    listItem.innerHTML = `<span class="key123">${quantityCatQuan}: </span> <span id = "value123" class = "value123">${value} </span> `;
                    list.appendChild(listItem);
                } else {
                    let listItem = document.createElement("li");
                    listItem.innerHTML = `<span class="key123">${quantityCatQuan}: </span> <span id = "value123" class = "value123">${(value).toFixed(3)} </span> `;
                    list.appendChild(listItem);
                }
            }
            categoryDiv.appendChild(importantInfo);
            categoryDiv.appendChild(list);
            infoTarget.appendChild(categoryDiv);
            if (!buttonState[cat]) {
                list.classList.add("hide");
            } else {
                document.getElementById(`${catReplace}-category-button`).textContent = "▴";
                list.style.maxHeight = list.scrollHeight + "px";
                list.classList.remove("hide");
            }
        }
    }

    // button click event
    let sliderInterval = null;
    let playbackSpeed = 1;
    rewindButton.addEventListener('click', rewindSlider);
    pauseButton.addEventListener('click', pauseSlider);
    playButton.addEventListener('click', () => {
        playbackSpeed = 1;
        playSlider();
    });

    fastForwardButton.addEventListener('click', fastForwardSlider);

    increaseButton.addEventListener('click', () => {
        const step = 1;
        const max = parseInt(slider.max);

        let newValue = parseInt(slider.value) + step;
        if (newValue > max) {
            newValue = max;
        }

        updateSlider(newValue);
    });

    decreaseButton.addEventListener('click', () => {
        const step = 1;
        const min = parseInt(slider.min);

        let newValue = parseInt(slider.value) - step;
        if (newValue < min) {
            newValue = min;
        }

        updateSlider(newValue);
    });

    function updateSlider(value) {
        slider.value = value;
        slider.dispatchEvent(new Event('input'));
    }

    function playSlider() {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
            let currentValue = parseInt(slider.value);
            if (currentValue < parseInt(slider.max)) {
                updateSlider(currentValue + playbackSpeed);
            } else {
                clearInterval(sliderInterval);
            }
        }, 100);
    }

    function rewindSlider() {
        playbackSpeed = 1;
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
            let currentValue = parseInt(slider.value);
            if (currentValue > 0) {
                console.log(playbackSpeed);
                updateSlider(currentValue - playbackSpeed);
            } else {
                clearInterval(sliderInterval);
            }
        }, 100);
    }

    function pauseSlider() {
        clearInterval(sliderInterval);
    }

    function fastForwardSlider() {
        playbackSpeed = 2;
        playSlider();
    }

    // slider update
    const sliderFully = document.getElementById("fully-slider");
    
    function updateSliderBackground(slider) {
        const min = slider.min || 0;
        const max = slider.max || 100;
        const val = (slider.value - min) / (max - min) * 100;
        slider.style.background = `linear-gradient(to right, #263238 0%, #45a049 ${val}%, #ddd ${val}%, #ddd 100%)`;
    }
    sliderFully.addEventListener("input", () => updateSliderBackground(sliderFully));
    updateSliderBackground(sliderFully);
    
    // chart click event
    MakeChartClickEvent(chart1, myCanvas1);
    MakeChartClickEvent(chart2, myCanvas2);
    MakeChartClickEvent(chart3, myCanvas3);
    MakeChartClickEvent(chart4, myCanvas4);
    MakeChartClickEvent(chart5, myCanvas5);
    MakeChartClickEvent(chart6, myCanvas6);
    MakeChartClickEvent(chart7, myCanvas7);
    MakeChartClickEvent(chart8, myCanvas8);
    MakeChartClickEvent(chart9, myCanvas9);
    MakeChartClickEvent(chart10, myCanvas10);
    
    function MakeChartClickEvent(chart, myCanvas) {
        myCanvas.addEventListener("click", function(event) {
            const points = chart.getElementsAtEventForMode(event, "index", { intersect: true}, true);
            if (points.length) {
                const firstPoint = points[0];
                const clickedLabel = chart.data.labels[firstPoint.index];
                const labelIndex = timeKeys.indexOf(clickedLabel);
                slider.value = labelIndex;

                const parts = clickedLabel.split("_");
                const formattedDate = `${String(parseInt(parts[2])).padStart(2, '0')}/${String(parseInt(parts[1])).padStart(2, '0')}/${parts[0]}\n`
                    + `${String(parseInt(parts[3])).padStart(2, '0')}:${String(parseInt(parts[4])).padStart(2, '0')}:${String(parseInt(parts[5])).padStart(2, '0')}`;
        
                updateMeshes(clickedLabel);
                updateInfos(clickedLabel);
            }
        });
    }

    const dateInput = document.getElementById("dateInput");
    const timeInput = document.getElementById("timeInput");
    
    const modal = document.getElementById("dateTimeModal");
    const cancelBtn = document.getElementById("cancel-button");
    const okayBtn = document.getElementById("okay-button");
    const body = document.body;
    const allInteractiveElements = document.querySelectorAll("button, input, select, textarea"); // 버튼, 입력창 등

    display.addEventListener('click', () => {
        const a = display.textContent;
        const b = a.split("\n");

        const dateMatch = b[0].split("/");
        const timeMatch = b[1].split(":");
        console.log(dateMatch);
        console.log(timeMatch);
    
        const day = dateMatch[0];
        const month = dateMatch[1].padStart(2, '0');
        const year = dateMatch[2].padStart(2, '0');
        const dateText = `${year}-${month}-${day}`;
    
          // 시간 변환 (HH:MM:SS)
        const hours = timeMatch[0].padStart(2, '0');
        const minutes = timeMatch[1].padStart(2, '0');
        const seconds = timeMatch[2].padStart(2, '0');
        const timeText = `${hours}:${minutes}:${seconds}`;
    
        dateInput.value = dateText;
        timeInput.value = timeText;
    })
    display.addEventListener('click', openModal);

    cancelBtn.addEventListener('click', () => {
        closeModal();
    });
    okayBtn.addEventListener('click', () => {
        closeModal();
        if (dateInput != undefined && timeInput != undefined){
            
            const okayDate = dateInput.value.replaceAll("-", "_");
            const okayTime = timeInput.value.replaceAll(":", "_");
            const okayDT = okayDate + "_" + okayTime;
            const closestTimestamp = findClosestTimestamp(okayDT, timeKeys);

            const labelIndex = timeKeys.indexOf(closestTimestamp);
            slider.value = labelIndex;
            const parts = closestTimestamp.split("_");
            const formattedDate = `${String(parseInt(parts[2])).padStart(2, '0')}/${String(parseInt(parts[1])).padStart(2, '0')}/${parts[0]}\n`
                + `${String(parseInt(parts[3])).padStart(2, '0')}:${String(parseInt(parts[4])).padStart(2, '0')}:${String(parseInt(parts[5])).padStart(2, '0')}`;

            display.textContent = `${formattedDate}`;
            updateMeshes(closestTimestamp);
            updatesInfos(closestTimestamp);
            makeCategoryList(true, buttonState);
        }
        
    });
    modal.addEventListener("mousedown", (event) => {
        if (event.target === modal) { // 모달 바깥 클릭 감지
            closeModal();
        }
    });
    
    function openModal() {
        modal.style.display = "flex";
        // body.classList.add("modal-active");
        body.style.overflow = "hidden";
        modal.style.opinterEvents = "auto";

        allInteractiveElements.forEach(el => {
            if (!modal.contains(el)) {
                el.classList.add('disable-interaction');
            }
        });
    }

    function closeModal() {
        modal.style.display = "none";
        body.style.overflow = "";

        allInteractiveElements.forEach(el => {
            el.classList.remove("disable-interaction");
        });
    }

    function parseTimestamp(timestamp) {
        const formatted = timestamp.replace(/_/g, "-"); // 2025-02-08-18-02-59
        console.log(formatted);
        const parts = formatted.split("-"); // 배열로 변환
    
        // Date 객체로 변환 (년, 월-1, 일, 시, 분, 초)
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
    }
    
    // ⏳ 기준 시간과 가장 가까운 타임스탬프 찾기
    function findClosestTimestamp(target, timestamps) {
        const targetDate = parseTimestamp(target);
        let closest = timestamps[0];
        let minDiff = Math.abs(parseTimestamp(closest) - targetDate);
    
        timestamps.forEach(timestamp => {
            const currentDate = parseTimestamp(timestamp);
            const diff = Math.abs(currentDate - targetDate);
            if (diff < minDiff) {
                closest = timestamp;
                minDiff = diff;
            }
        });
    
        return closest;
    }
}

function makeCategoryList(buttonState) {
    let getButton = {
        "Walls": document.getElementById("Walls-category-button"),
        "Curtain Walls": document.getElementById("Curtain-Walls-category-button"),
        "Floors": document.getElementById("Floors-category-button"),
        "Ceilings": document.getElementById("Ceilings-category-button"),
        "Columns": document.getElementById("Columns-category-button"),
        "Structural Columns": document.getElementById("Structural-Columns-category-button"),
        "Stairs": document.getElementById("Stairs-category-button"),
        "Railings": document.getElementById("Railings-category-button"),
        "Windows": document.getElementById("Windows-category-button"),
        "Doors": document.getElementById("Doors-category-button"),
    }
    let getList = {
        "Walls": document.getElementById("Walls-list"),
        "Curtain Walls": document.getElementById("Curtain-Walls-list"),
        "Floors": document.getElementById("Floors-list"),
        "Ceilings": document.getElementById("Ceilings-list"),
        "Columns": document.getElementById("Columns-list"),
        "Structural Columns": document.getElementById("Structural-Columns-list"),
        "Stairs": document.getElementById("Stairs-list"),
        "Railings": document.getElementById("Railings-list"),
        "Windows": document.getElementById("Windows-list"),
        "Doors": document.getElementById("Doors-list"),
    }
    
    function buttonClickEventHandler(cat, getList) {
        if (!buttonState[cat]) {
            getList[cat].classList.remove("hide");
            buttonState[cat] = true;
            getButton[cat].textContent = "▴";
        } else {
            getList[cat].classList.add("hide");
            buttonState[cat] = false;
            getButton[cat].textContent = "▾";
        }
    }

    Object.keys(getButton).forEach(k => {
        getButton[k].addEventListener("click", () => buttonClickEventHandler(k, getList));
    });
}