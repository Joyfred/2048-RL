getRandomInteger = max => Math.floor(Math.random() * Math.floor(max));

getMaxIndex = array => {
    const max = array.reduce((x, y) => Math.max(x, y));
    const maxIndexes = [...array.keys()].filter(i => array[i] === max);

    return maxIndexes[getRandomInteger(maxIndexes.length)];
}

getInitialPlotData = lineId => {
    const colorsAvailable = lineColors.length;
    return {
        data: Array.from([0]),
        borderColor: lineColors[lineId % colorsAvailable],
        pointRadius: 2,
        label: `Trial ${lineId}`,
        // pointStyle: 'dash',
        fill: false
    }
};

createPlotDefinition = () => {
    return {
        type: 'line',
        data: {
            labels: [0],
            datasets: [getInitialPlotData(0)]
        },
        options: {
            title: {
                display: true,
                text: 'Score vs Move Count',
                fontSize: 15
            },
            events: ['click', 'mousemove'],
            tooltips: {
                callbacks: {
                    label: function(tooltipItems, data) {
                        return `x: ${tooltipItems.xLabel}  y: ${tooltipItems.yLabel}`
                    }
                }
            },
            scales: {
                yAxes: [{
                    display: true,
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                    }
                }]
            }
        }
    }
}