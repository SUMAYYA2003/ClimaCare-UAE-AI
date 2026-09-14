/* =========================================================
   ClimaCare UAE AI
   Health Page — Live Environmental Data
   ========================================================= */

function setHealthText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function getAqiCategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Elevated";
    if (aqi <= 200) return "High";
    if (aqi <= 300) return "Very High";

    return "Severe";
}


async function loadHealthData() {

    try {

        const response = await fetch("/api/environment/current");

        if (!response.ok) {
            throw new Error("Unable to load environmental data");
        }

        const data = await response.json();


        const aqi = Number(data.air_quality.us_aqi);
const pm25 = Number(data.air_quality.pm2_5);
const temperature = Number(data.weather.temperature);
const humidity = Number(data.weather.humidity);
const dust = Number(data.air_quality.dust);
/* =========================================================
   Dynamic climate-health interpretation
   ========================================================= */

let riskLevel = "Balanced conditions";
let riskTitle = "Conditions are manageable with normal awareness.";
let riskMessage =
    "Current environmental readings suggest you can continue normal activities while staying aware of heat, air quality and hydration.";

let generalGuidance =
    "Normal outdoor activities are generally possible with routine precautions.";

let sensitiveGuidance =
    "Sensitive individuals may wish to monitor how they feel and reduce prolonged exposure if discomfort occurs.";

let heatGuidance =
    "Carry water and use shade when spending longer periods outdoors.";

let airGuidance =
    "Air-quality conditions can be managed with normal awareness and sensible exposure choices.";


/* Air-quality influence */

if (aqi > 100 || pm25 > 35 || dust > 80) {

    riskLevel = "Extra awareness recommended";

    riskTitle =
        "Environmental exposure is elevated today.";

    riskMessage =
        "Air quality and dust levels are higher than ideal. Outdoor activities may still be possible, but reducing prolonged strenuous exposure and taking suitable precautions can be helpful.";

    generalGuidance =
        "Outdoor plans can continue with sensible precautions, especially during longer or strenuous activities.";

    sensitiveGuidance =
        "Children, older adults and people sensitive to air pollution may benefit from shorter exposure periods and additional protection.";

    airGuidance =
        "Consider limiting prolonged strenuous exposure. A suitable mask may be useful when dust or fine particles are noticeable.";
}


/* Heat influence */

if (temperature >= 35) {

    heatGuidance =
        "Warm conditions are present. Carry water, use shade, sunglasses or sun protection, and take breaks during longer outdoor trips.";

    riskMessage +=
        " Higher temperatures also make hydration and sun protection more important.";
}


/* Higher combined exposure */

if (
    aqi >= 150 ||
    pm25 >= 55 ||
    temperature >= 40
) {

    riskLevel = "Higher exposure awareness";

    riskTitle =
        "Today's conditions call for additional precautions.";
}


/* Update Health page */

setHealthText(
    "health-risk-level",
    riskLevel
);

setHealthText(
    "health-risk-title",
    riskTitle
);

setHealthText(
    "health-risk-message",
    riskMessage
);

setHealthText(
    "health-general-guidance",
    generalGuidance
);

setHealthText(
    "health-sensitive-guidance",
    sensitiveGuidance
);

setHealthText(
    "health-heat-guidance",
    heatGuidance
);

setHealthText(
    "health-air-guidance",
    airGuidance
);


        setHealthText(
            "health-current-aqi",
            Number.isFinite(aqi) ? Math.round(aqi) : "--"
        );

        setHealthText(
            "health-aqi-category",
            Number.isFinite(aqi)
                ? getAqiCategory(aqi)
                : "Unavailable"
        );

        setHealthText(
            "health-pm25",
            Number.isFinite(pm25)
                ? `${pm25.toFixed(1)} µg/m³`
                : "--"
        );

        setHealthText(
            "health-temperature",
            Number.isFinite(temperature)
                ? `${temperature.toFixed(1)} °C`
                : "--"
        );

        setHealthText(
            "health-humidity",
            Number.isFinite(humidity)
                ? `${humidity.toFixed(0)}%`
                : "--"
        );

        setHealthText(
            "health-dust",
            Number.isFinite(dust)
                ? dust.toFixed(1)
                : "--"
        );

    }

    catch (error) {

        console.error(
            "ClimaCare Health data error:",
            error
        );

        setHealthText(
            "health-aqi-category",
            "Temporarily unavailable"
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    loadHealthData
);