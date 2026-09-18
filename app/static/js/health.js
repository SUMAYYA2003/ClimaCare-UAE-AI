/* =========================================================
   ClimaCare UAE AI
   Health Page — Live Climate-Health Intelligence
   ========================================================= */


/* ---------------------------------------------------------
   Helper
   --------------------------------------------------------- */

function setHealthText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* ---------------------------------------------------------
   Standard US AQI categories
   --------------------------------------------------------- */

function getAqiCategory(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";

    return "Hazardous";
}


/* ---------------------------------------------------------
   AQI visual colour
   --------------------------------------------------------- */

function getAqiColor(aqi) {
    if (aqi <= 50) return "#16a34a";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#dc2626";
    if (aqi <= 300) return "#7e22ce";

    return "#7f1d1d";
}


/* ---------------------------------------------------------
   Update circular AQI gauge
   --------------------------------------------------------- */

function updateHealthAqiRing(aqi) {

    const ring =
        document.querySelector(".health-aqi-ring");

    const value =
        document.getElementById("health-current-aqi");

    if (!ring || !Number.isFinite(aqi)) {
        return;
    }

    const colour = getAqiColor(aqi);

    /*
       AQI gauge capped visually at 300
    */

    const cappedAqi =
        Math.min(Math.max(aqi, 0), 300);

    const degrees =
        (cappedAqi / 300) * 360;

    ring.style.background =
        `conic-gradient(
            ${colour} 0deg ${degrees}deg,
            rgba(21, 33, 28, 0.08) ${degrees}deg 360deg
        )`;

    if (value) {
        value.style.color = colour;
    }
}


/* =========================================================
   LIVE HEALTH INTELLIGENCE
   ========================================================= */

async function loadHealthData() {

    try {

        const response =
            await fetch("/api/environment/current");

        if (!response.ok) {
            throw new Error(
                "Unable to load environmental data"
            );
        }

        const data =
            await response.json();


        /* -------------------------------------------------
           Read live values
           ------------------------------------------------- */

        const aqi =
            Number(data.air_quality.us_aqi);

        const pm25 =
            Number(data.air_quality.pm2_5);

        const temperature =
            Number(data.weather.temperature);

        const humidity =
            Number(data.weather.humidity);

        const dust =
            Number(data.air_quality.dust);


        /* =================================================
           DEFAULT HEALTH INTERPRETATION
           ================================================= */

        let riskLevel =
            "Normal environmental awareness";

        let riskTitle =
            "Conditions are manageable with normal awareness.";

        let riskMessage =
            "Current environmental readings suggest normal activities can generally continue while maintaining routine awareness of air quality, heat and hydration.";


        let healthFocusTitle =
            "Maintain normal environmental awareness.";

        let healthFocusMessage =
            "Stay hydrated, monitor outdoor conditions and adjust prolonged outdoor activity if conditions change.";


        let generalGuidance =
            "Normal outdoor activities are generally possible with routine precautions.";

        let sensitiveGuidance =
            "Sensitive individuals may wish to monitor how they feel and reduce prolonged exposure if discomfort occurs.";

let heatGuidance =
    "Stay hydrated and take sensible precautions during outdoor activities.";

let heatDetail =
    "Carry water and take breaks when spending longer periods outdoors.";

const currentHour = new Date().getHours();
const isDaytime =
    currentHour >= 6 && currentHour < 18;

if (isDaytime) {
    heatGuidance =
        "Carry water and use shade when spending longer periods outdoors.";

    heatDetail =
        "Carry water, use shade where possible, and consider sunglasses or sun protection during longer daytime outdoor trips.";
} else {
    heatGuidance =
        "Stay hydrated during longer evening or nighttime outdoor activities.";

    heatDetail =
        "Carry water and take suitable breaks during longer outdoor trips. Sun protection is generally unnecessary after sunset.";
}

let airGuidance =
    "Air-quality conditions can generally be managed with normal awareness and sensible exposure choices.";

        /* =================================================
           AIR QUALITY / PARTICULATE EXPOSURE
           ================================================= */

        if (
            aqi > 100 ||
            pm25 > 35 ||
            dust > 80
        ) {

            riskLevel =
                "Extra awareness recommended";

            riskTitle =
                "Environmental exposure is elevated today.";

            riskMessage =
                "Air quality and dust levels are higher than ideal. Outdoor activities may still be possible, but reducing prolonged strenuous exposure and taking suitable precautions can be helpful.";

            healthFocusTitle =
                "Reduce prolonged high-intensity outdoor exposure.";

            healthFocusMessage =
                "Air-quality and particulate readings suggest extra awareness today, especially for people sensitive to pollution.";

            generalGuidance =
                "Outdoor plans can continue with sensible precautions, especially during longer or strenuous activities.";

            sensitiveGuidance =
                "Children, older adults and people sensitive to air pollution may benefit from shorter exposure periods and additional protection.";

            airGuidance =
                "Consider limiting prolonged strenuous exposure. Appropriate respiratory protection may be useful when dust or fine particles are noticeable.";
        }


        /* =================================================
           HEAT
           ================================================= */

  if (temperature >= 35) {

    if (isDaytime) {

        heatGuidance =
            "Warm conditions are present. Carry water, use shade and sun protection, and take breaks during longer daytime outdoor trips.";

        heatDetail =
            "Stay hydrated, seek shade where possible, and consider sunglasses or sun protection during prolonged daytime exposure.";

        riskMessage +=
            " Higher temperatures also make hydration, shade and sun protection more important during daytime exposure.";

        healthFocusTitle =
            "Prioritise hydration and heat protection.";

        healthFocusMessage =
            "Warm conditions increase heat exposure. Carry water, seek shade and consider reducing prolonged activity during the hottest periods.";

    } else {

        heatGuidance =
            "Warm conditions may continue into the evening. Stay hydrated and take breaks during longer outdoor activities.";

        heatDetail =
            "Carry water and allow time for rest during prolonged evening or nighttime outdoor activities.";

        riskMessage +=
            " Warm conditions may continue after sunset, so hydration and suitable rest remain important.";

        healthFocusTitle =
            "Stay hydrated during warm evening conditions.";

        healthFocusMessage =
            "Warm conditions may persist after sunset. Carry water and take breaks during prolonged outdoor activity.";
    }
}


        /* =================================================
           DRY / LOW HUMIDITY CONDITIONS
           ================================================= */

        if (humidity < 25) {

            healthFocusMessage +=
                " Dry conditions may also increase discomfort and dehydration risk.";
        }


        /* =================================================
           HIGHER COMBINED EXPOSURE
           ================================================= */

        if (
            aqi >= 150 ||
            pm25 >= 55 ||
            temperature >= 40
        ) {

            riskLevel =
                "Higher exposure awareness";

            riskTitle =
                "Today's conditions call for additional precautions.";

            healthFocusTitle =
                "Limit prolonged exposure and protect against heat and pollution.";

            healthFocusMessage =
                "Current environmental conditions indicate a combination of air-quality or heat-related stress. Consider shorter outdoor periods, hydration, shade and appropriate protection.";
        }


        /* =================================================
           VERY HIGH CONDITIONS
           ================================================= */

        if (
            aqi >= 200 ||
            pm25 >= 75 ||
            temperature >= 45
        ) {

            riskLevel =
                "Significant environmental exposure";

            riskTitle =
                "Environmental conditions require stronger precautions today.";

            healthFocusTitle =
                "Reduce unnecessary outdoor exposure.";

            healthFocusMessage =
                "Current environmental readings indicate stronger exposure conditions. Sensitive groups should take additional care and prolonged strenuous outdoor activity should be reduced.";
        }


        /* =================================================
           UPDATE HERO
           ================================================= */

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


        /* -------------------------------------------------
           Dynamic health-focus card
           ------------------------------------------------- */

        setHealthText(
            "health-focus-title",
            healthFocusTitle
        );

        setHealthText(
            "health-focus-message",
            healthFocusMessage
        );


        /* =================================================
   GUIDANCE
   ================================================= */

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
    "health-heat-detail",
    heatDetail
);

setHealthText(
    "health-air-guidance",
    airGuidance
);


        /* =================================================
           LIVE ENVIRONMENTAL VALUES
           ================================================= */

        setHealthText(
            "health-current-aqi",
            Number.isFinite(aqi)
                ? Math.round(aqi)
                : "--"
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


        /* =================================================
           AQI VISUAL
           ================================================= */

        updateHealthAqiRing(aqi);

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

        setHealthText(
            "health-focus-title",
            "Environmental guidance unavailable"
        );

        setHealthText(
            "health-focus-message",
            "Live environmental information could not be retrieved. Please try again shortly."
        );
    }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadHealthData
);