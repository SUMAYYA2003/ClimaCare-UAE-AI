/* =========================================================
   ClimaCare UAE AI
   Detailed Forecast Page
   ========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function getAqiColor(aqi) {

    if (aqi <= 50) return "#0b8f55";
    if (aqi <= 100) return "#d6a800";
    if (aqi <= 150) return "#e67e22";
    if (aqi <= 200) return "#d71920";
    if (aqi <= 300) return "#7d3c98";

    return "#6e1f32";
}


function updateForecastRing(aqi) {

    const ring = document.querySelector(".aqi-ring");

    if (!ring) {
        return;
    }

    const color = getAqiColor(aqi);

    const progress = Math.min(
        (aqi / 300) * 360,
        360
    );

    ring.style.background = `
        conic-gradient(
            ${color} 0deg ${progress}deg,
            rgba(120,120,120,0.12)
            ${progress}deg 360deg
        )
    `;

    const value =
        document.getElementById(
            "detail-forecast-aqi"
        );

    if (value) {
        value.style.color = color;
    }
}


function getHealthAdvice(category) {

    switch (category) {

        case "Good":
            return "Air quality is favourable. Normal outdoor activity can continue.";

        case "Moderate":
            return "Air quality is generally acceptable. Sensitive individuals may consider reducing prolonged outdoor exposure.";

        case "Unhealthy for Sensitive Groups":
            return "Children, older adults and pollution-sensitive individuals should reduce prolonged outdoor activity.";

        case "Unhealthy":
            return "Consider reducing prolonged outdoor exposure. Sensitive groups should take additional precautions.";

        case "Very Unhealthy":
            return "Outdoor exposure should be reduced where possible. Sensitive individuals should take extra care.";

        default:
            return "Environmental conditions indicate severe air-quality risk. Minimise unnecessary outdoor exposure.";
    }
}


async function loadDetailedForecast() {

    try {

        const response =
            await fetch("/api/forecast");

        if (!response.ok) {
            throw new Error(
                "Forecast request failed"
            );
        }

        const data =
            await response.json();

        const current =
            data.current_environment;

        const forecast =
            data.ai_forecast;


        /* -----------------------------------------
           Main predicted AQI
           ----------------------------------------- */

        const predictedAqi =
            Number(forecast.next_day_aqi);

        setText(
            "detail-forecast-aqi",
            predictedAqi.toFixed(0)
        );

        setText(
            "detail-next-aqi",
            predictedAqi.toFixed(0)
        );

        setText(
            "detail-forecast-category",
            forecast.category
        );

        setText(
            "detail-category",
            forecast.category
        );

        updateForecastRing(
            predictedAqi
        );


        /* -----------------------------------------
           Current AQI
           ----------------------------------------- */

        const currentAqi =
            Number(current.us_aqi);

        setText(
            "detail-current-aqi",
            currentAqi.toFixed(0)
        );
/* -----------------------------------------
   Today vs tomorrow AQI change
   ----------------------------------------- */

const aqiDifference = predictedAqi - currentAqi;

let changeText = "";
let changeSymbol = "";

if (aqiDifference <= -3) {
    changeSymbol = "↓";
    changeText = "Air quality is expected to improve";
}
else if (aqiDifference >= 3) {
    changeSymbol = "↑";
    changeText = "Air quality is expected to worsen";
}
else {
    changeSymbol = "≈";
    changeText = "Air quality is expected to remain stable";
}

setText(
    "detail-aqi-change",
    `${changeSymbol} ${changeText}`
);
/* -----------------------------------------
   Practical climate guidance
   ----------------------------------------- */

const temperature = Number(current.temperature);
const humidity = Number(current.humidity);
const dust = Number(current.dust);

let bestOutdoorTime = "Morning or evening";
let activityGuidance = "Normal outdoor activity is reasonable";
let protectionGuidance = "Standard sun protection recommended";
let practicalMessage =
    "Conditions are suitable for normal daily activities with routine precautions.";


/* AQI-based activity guidance */

if (predictedAqi >= 151) {
    activityGuidance =
        "Prefer shorter, low-intensity outdoor activities";

    practicalMessage =
        "Air pollution is elevated. Outdoor plans are still possible, but prolonged or strenuous activity may be better reduced.";
}
else if (predictedAqi >= 101) {
    activityGuidance =
        "Outdoor activities are possible with some caution";

    practicalMessage =
        "Most people can continue normal plans, while pollution-sensitive visitors may prefer shorter outdoor exposure.";
}
else if (predictedAqi >= 51) {
    activityGuidance =
        "Good for most outdoor activities";

    practicalMessage =
        "Environmental conditions are generally suitable for outdoor plans.";
}
else {
    activityGuidance =
        "Excellent for outdoor activities";

    practicalMessage =
        "Air-quality conditions are favourable for most outdoor activities.";
}


/* Temperature guidance */

if (temperature >= 40) {
    bestOutdoorTime = "Prefer early morning or after sunset";
}
else if (temperature >= 35) {
    bestOutdoorTime = "Morning or evening is more comfortable";
}
else if (temperature >= 30) {
    bestOutdoorTime = "Morning, late afternoon or evening";
}
else {
    bestOutdoorTime = "Most parts of the day";
}


/* Protection guidance */

if (dust >= 100 && predictedAqi >= 101) {
    protectionGuidance =
        "Consider a mask if sensitive, plus sunglasses and hydration";
}
else if (dust >= 100) {
    protectionGuidance =
        "Sunglasses, hydration and dust protection recommended";
}
else if (temperature >= 35) {
    protectionGuidance =
        "Carry water and use sun protection";
}
else {
    protectionGuidance =
        "Routine sun protection and hydration";
}


/* Extra humidity consideration */

if (humidity >= 70 && temperature >= 32) {
    bestOutdoorTime =
        "Prefer cooler morning or evening hours";

    practicalMessage +=
        " High humidity may also make outdoor activity feel less comfortable.";
}


/* Update guidance cards */

setText(
    "best-outdoor-time",
    bestOutdoorTime
);

setText(
    "activity-guidance",
    activityGuidance
);

setText(
    "protection-guidance",
    protectionGuidance
);

setText(
    "forecast-practical-message",
    practicalMessage
);

        /* -----------------------------------------
           Hero text
           ----------------------------------------- */

        setText(
            "detail-forecast-status",
            `${forecast.category} conditions expected tomorrow`
        );

        setText(
            "detail-forecast-message",
            `ClimaCare predicts a next-day AQI of ${predictedAqi.toFixed(0)} for Dubai. The forecast is generated from current pollution levels, weather conditions and recent environmental trends.`
        );


        /* -----------------------------------------
           Forecast date
           ----------------------------------------- */

        if (data.forecast_date) {

            const forecastDate =
                new Date(
                    `${data.forecast_date}T00:00:00`
                );

            setText(
                "detail-forecast-date",
                forecastDate.toLocaleDateString(
                    "en-AE",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )
            );
        }


        /* -----------------------------------------
           Health risk
           ----------------------------------------- */

        setText(
            "detail-health-risk",
            forecast.health_risk
        );

        setText(
            "detail-health-advice",
            getHealthAdvice(
                forecast.category
            )
        );


        /* -----------------------------------------
           Warning
           ----------------------------------------- */

        const warningIndicator =
            document.getElementById(
                "detail-warning-indicator"
            );

        if (forecast.early_warning) {

            setText(
                "detail-warning-title",
                "Early warning active"
            );

            setText(
                "detail-warning-text",
                "Environmental health warning active"
            );

            if (warningIndicator) {
                warningIndicator.style.color =
                    "#d71920";
            }
        }

        else {

            setText(
                "detail-warning-title",
                "No early warning"
            );

            setText(
                "detail-warning-text",
                "No environmental warning currently required"
            );

            if (warningIndicator) {
                warningIndicator.style.color =
                    "#0b8f55";
            }
        }


        /* -----------------------------------------
           Environmental drivers
           ----------------------------------------- */

        setText(
            "detail-pm25",
            Number(current.pm2_5).toFixed(1)
        );

        setText(
            "detail-pm10",
            Number(current.pm10).toFixed(1)
        );

        setText(
            "detail-temperature",
            Number(current.temperature).toFixed(1)
        );

        setText(
            "detail-humidity",
            Number(current.humidity).toFixed(0)
        );

        setText(
            "detail-dust",
            Number(current.dust).toFixed(1)
        );


        console.log(
            "ClimaCare detailed forecast loaded:",
            data
        );

    }

    catch (error) {

        console.error(
            "ClimaCare forecast page error:",
            error
        );

        setText(
            "detail-forecast-status",
            "Forecast temporarily unavailable"
        );

        setText(
            "detail-forecast-message",
            "ClimaCare could not retrieve the AI forecast. Please refresh shortly."
        );

        setText(
            "detail-forecast-category",
            "Unavailable"
        );

        setText(
            "detail-category",
            "Unavailable"
        );

        setText(
            "detail-health-risk",
            "Unavailable"
        );

        setText(
            "detail-warning-title",
            "Unable to check warning"
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadDetailedForecast
);