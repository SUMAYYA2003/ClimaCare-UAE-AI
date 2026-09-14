/* =========================================================
   ClimaCare UAE AI
   Trends Page Data Integration
   ========================================================= */


function setTrendText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function calculateDirection(values) {

    if (!values || values.length < 7) {
        return "Not enough data";
    }

    const recentSeven = values.slice(-7);

    const firstHalf =
        recentSeven.slice(0, 3)
            .reduce((sum, value) => sum + value, 0) / 3;

    const lastHalf =
        recentSeven.slice(-3)
            .reduce((sum, value) => sum + value, 0) / 3;

    const difference = lastHalf - firstHalf;

    if (difference <= -5) {
        return "Improving";
    }

    if (difference >= 5) {
        return "Worsening";
    }

    return "Stable";
}
function drawAqiTrendChart(dates, aqiValues) {

    const canvas =
        document.getElementById("aqi-trend-chart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(canvas, {

        type: "line",

        data: {

            labels: dates,

            datasets: [
                {
                    label: "US AQI",
                    data: aqiValues,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    fill: false
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    display: true
                },

                tooltip: {
                    enabled: true
                }
            },

            scales: {

                x: {
                    ticks: {
                        maxTicksLimit: 8
                    },

                    grid: {
                        display: false
                    }
                },

                y: {

                    beginAtZero: false,

                    title: {
                        display: true,
                        text: "US AQI"
                    }
                }
            }
        }
    });
}
function drawParticleTrendChart(dates, pm25Values, pm10Values) {

    const canvas =
        document.getElementById("particle-trend-chart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    new Chart(canvas, {

        type: "line",

        data: {

            labels: dates,

            datasets: [
                {
                    label: "PM2.5",
                    data: pm25Values,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    fill: false
                },
                {
                    label: "PM10",
                    data: pm10Values,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    fill: false
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    display: true
                },

                tooltip: {
                    enabled: true
                }
            },

            scales: {

                x: {
                    ticks: {
                        maxTicksLimit: 8
                    },

                    grid: {
                        display: false
                    }
                },

                y: {

                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "µg/m³"
                    }
                }
            }
        }
    });
}
async function loadTrendData() {

    try {

        const response = await fetch("/api/trends");

        if (!response.ok) {
            throw new Error("Unable to load trend data");
        }

        const data = await response.json();


        /* -----------------------------------------
           Current AQI
           ----------------------------------------- */

        const latestAqi =
            data.aqi[data.aqi.length - 1];

        setTrendText(
            "trend-current-aqi",
            Math.round(latestAqi)
        );


        /* -----------------------------------------
           7-day AQI direction
           ----------------------------------------- */

        const aqiDirection =
            calculateDirection(data.aqi);

        setTrendText(
            "trend-direction",
            aqiDirection
        );


        /* -----------------------------------------
           PM2.5 direction
           ----------------------------------------- */

        const pm25Direction =
            calculateDirection(data.pm2_5);

        setTrendText(
            "trend-pm25-status",
            pm25Direction
        );


        /* -----------------------------------------
           Save data for charts
           ----------------------------------------- */

        window.climaCareTrendData = {
            dates: data.dates,
            aqi: data.aqi,
            pm2_5: data.pm2_5,
            pm10: data.pm10
        };
drawAqiTrendChart(data.dates, data.aqi);
drawParticleTrendChart(
    data.dates,
    data.pm2_5,
    data.pm10
);

/* =========================================
   Recent 7-day environmental summary
   ========================================= */

const recentAqi = data.aqi.slice(-7);
const recentPm25 = data.pm2_5.slice(-7);
const recentDates = data.dates.slice(-7);

const averageAqi =
    recentAqi.reduce((sum, value) => sum + value, 0) /
    recentAqi.length;

const averagePm25 =
    recentPm25.reduce((sum, value) => sum + value, 0) /
    recentPm25.length;

const peakAqi = Math.max(...recentAqi);

const latestReadingDate =
    recentDates[recentDates.length - 1];
    setTrendText(
    "seven-day-average-aqi",
    averageAqi.toFixed(1)
);

setTrendText(
    "seven-day-average-pm25",
    averagePm25.toFixed(1)
);

setTrendText(
    "seven-day-peak-aqi",
    peakAqi.toFixed(1)
);

setTrendText(
    "latest-trend-date",
    latestReadingDate
);

console.log("7-day summary:", {
    averageAqi: averageAqi.toFixed(1),
    averagePm25: averagePm25.toFixed(1),
    peakAqi: peakAqi.toFixed(1),
    latestReadingDate: latestReadingDate
});

        /* -----------------------------------------
           Interpretation
           ----------------------------------------- */

        let interpretation = "";

        if (aqiDirection === "Improving") {

            interpretation =
                "Recent AQI readings show an improving pattern. " +
                "Air pollution levels have generally decreased during the latest period.";

        }
        else if (aqiDirection === "Worsening") {

            interpretation =
                "Recent AQI readings show an upward pollution pattern. " +
                "ClimaCare recommends monitoring environmental conditions and following practical precautions when spending longer periods outdoors.";

        }
        else {

            interpretation =
                "Recent AQI readings are relatively stable. " +
                "Conditions may still change from day to day, so current readings and forecasts should be considered together.";

        }

        setTrendText(
            "trend-insight-text",
            interpretation
        );


        console.log(
            "ClimaCare trend data loaded:",
            window.climaCareTrendData
        );

    }
    catch (error) {

        console.error(
            "ClimaCare Trends Error:",
            error
        );

        setTrendText(
            "trend-current-aqi",
            "--"
        );

        setTrendText(
            "trend-direction",
            "Unavailable"
        );

        setTrendText(
            "trend-pm25-status",
            "Unavailable"
        );

        setTrendText(
            "trend-insight-text",
            "Trend information is temporarily unavailable."
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadTrendData
);