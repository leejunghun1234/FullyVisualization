import { Chart, LineController, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from "chart.js";

Chart.register(
    LineElement,
    LineController,
    CategoryScale,  // X축 스케일
    LinearScale,    // Y축 스케일
    PointElement,   // 데이터 포인트
    Tooltip,
);

export function MakeChart(timeKeys, quant, canvasId) {
    const labels = timeKeys;
    const quantNames = [];
    const quantData = [];

    quant.forEach(arr => {
        quantNames.push(arr[0]);
        quantData.push(arr.slice(1));
    });

    let myCanvas = document.getElementById(canvasId);

    const datasets = quantNames.map((name, index) => ({
        label: name,
        data: quantData[index],
        borderColor: `hsl(${index * 40}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 40}, 70%, 50%, 0.3)`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0.5
    }));

    const totalDuration = 1000;
    const delayBetweenPoints = totalDuration / timeKeys.length;

    const previousY1 = (ctx) => 
        ctx.index === 0 
            ? ctx.chart.scales.y.getPixelForValue(100) 
            : ctx.chart.getDatasetMeta(ctx.datasetIndex)
                .data[ctx.index - 1]
                .getProps(['y'], true).y;
                const previousY = (ctx) => {
                
                    if (!ctx.chart) {
                        console.error("ctx.chart is undefined!");
                        return 0;
                    }
                
                    const datasetMeta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                    if (ctx.index - 1 < 0 || ctx.index - 1 >= datasetMeta.data.length) {
                        return 0;
                    }
                
                    const prevDataPoint = datasetMeta.data[ctx.index - 1];
                    if (!prevDataPoint || typeof prevDataPoint.getProps !== "function") {
                        return 0;
                    }
                
                    return prevDataPoint.getProps(['y'], true).y;
                };
                

    
    const animation = {
        x: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: NaN, // the point is initially skipped
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.xStarted) {
                    return 0;
                }
                ctx.xStarted = true;
                return ctx.index * delayBetweenPoints;
            }
        },
        y: {
            type: 'number',
            easing: 'linear',
            duration: delayBetweenPoints,
            from: previousY,
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.yStarted) {
                    return 0;
                }
                ctx.yStarted = true;
                return ctx.index * delayBetweenPoints;
            }
        }
    };


    
    const chart1 = new Chart(myCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: true,
                    intersect: false,
                    position: 'nearest'
                    // mode: "index",
                }
            },
            scales: {
                x: {
                    title: {
                        display: false,
                        text: 'Time'
                    },
                    ticks: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                        text: 'Quantity'
                    },
                    ticks: {
                        display: false
                    }
                }
            },
            animation: animation
        }
    });
    
    return { chart1, myCanvas };
}