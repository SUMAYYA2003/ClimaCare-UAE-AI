/* =========================================================
   ClimaCare UAE AI
   AI Insights — Explainable Forecast Intelligence
   ========================================================= */


/* ---------------------------------------------------------
   Helper: safely update text
   --------------------------------------------------------- */

function setInsightText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* ---------------------------------------------------------
   Standard US AQI category
   --------------------------------------------------------- */

function getAqiCategory(aqi) {

    if (aqi <= 50) {
        return "Good";
    }

    if (aqi <= 100) {
        return "Moderate";
    }

    if (aqi <= 150) {
        return "Unhealthy for Sensitive Groups";
    }

    if (aqi <= 200) {
        return "Unhealthy";
    }

    if (aqi <= 300) {
        return "Very Unhealthy";
    }

    return "Hazardous";
}


/* =========================================================
   CURRENT-CONDITION RELEVANCE RANKING
   ========================================================= */

/*
   Important:
   This is NOT SHAP importance.

   It ranks live environmental signals according to their
   current condition severity/relevance.

   The trained ML model prediction remains separate.
*/

function buildDriverRanking(
    pm25,
    dust,
    temperature,
    humidity
) {

    const drivers = [];


    /* -----------------------------------------------------
       PM2.5 relevance
       ----------------------------------------------------- */

    let pm25Score = 0;

    if (Number.isFinite(pm25)) {
        pm25Score = Math.min(
            (pm25 / 75) * 100,
            100
        );
    }

    drivers.push({
        name: "PM2.5",
        score: pm25Score,
        value: Number.isFinite(pm25)
            ? `${pm25.toFixed(1)} µg/m³`
            : "--",
        text:
            pm25 >= 55
                ? "Fine-particle pollution is currently high and deserves strong environmental-health attention."
                : pm25 >= 35
                ? "Fine-particle levels are elevated and are an important current environmental signal."
                : "Fine-particle levels are currently contributing less strongly to environmental exposure."
    });


    /* -----------------------------------------------------
       Dust relevance
       ----------------------------------------------------- */

    let dustScore = 0;

    if (Number.isFinite(dust)) {
        dustScore = Math.min(
            (dust / 120) * 100,
            100
        );
    }

    drivers.push({
        name: "Dust",
        score: dustScore,
        value: Number.isFinite(dust)
            ? dust.toFixed(1)
            : "--",
        text:
            dust >= 100
                ? "Dust levels are high and may significantly influence outdoor environmental exposure."
                : dust >= 80
                ? "Dust is clearly noticeable in the current environmental profile."
                : "Dust is present but is currently a lower environmental influence."
    });


    /* -----------------------------------------------------
       Temperature relevance
       ----------------------------------------------------- */

    let temperatureScore = 0;

    if (Number.isFinite(temperature)) {

        if (temperature <= 25) {
            temperatureScore = 15;
        }
        else {
            temperatureScore = Math.min(
                ((temperature - 25) / 20) * 100,
                100
            );
        }
    }

    drivers.push({
        name: "Temperature",
        score: temperatureScore,
        value: Number.isFinite(temperature)
            ? `${temperature.toFixed(1)} °C`
            : "--",
        text:
            temperature >= 40
                ? "Very warm conditions create a strong heat-exposure signal and increase hydration and sun-protection importance."
                : temperature >= 35
                ? "Warm conditions contribute meaningfully to heat-related environmental exposure."
                : "Temperature is currently a moderate environmental influence."
    });


    /* -----------------------------------------------------
       Humidity relevance
       ----------------------------------------------------- */

    let humidityScore = 0;

    if (Number.isFinite(humidity)) {

        const distanceFromComfort =
            Math.abs(humidity - 50);

        humidityScore = Math.min(
            (distanceFromComfort / 50) * 100,
            100
        );
    }

    drivers.push({
        name: "Humidity",
        score: humidityScore,
        value: Number.isFinite(humidity)
            ? `${humidity.toFixed(0)}%`
            : "--",
        text:
            humidity < 25
                ? "Dry atmospheric conditions may increase discomfort and influence hydration needs."
                : humidity > 75
                ? "High humidity may increase thermal discomfort and heat stress."
                : "Humidity is currently relatively close to a moderate comfort range."
    });


    /* -----------------------------------------------------
       Sort strongest → weakest
       ----------------------------------------------------- */

    drivers.sort(
        (a, b) => b.score - a.score
    );

    return drivers;
}


/* =========================================================
   UPDATE DRIVER RANKING UI
   ========================================================= */

function updateDriverRanking(drivers) {

    const topDrivers =
        drivers.slice(0, 3);

    const positions = [
        "one",
        "two",
        "three"
    ];


    topDrivers.forEach(
        (driver, index) => {

            const position =
                positions[index];

            setInsightText(
                `insight-rank-${position}-name`,
                driver.name
            );

            setInsightText(
                `insight-rank-${position}-level`,
                driver.value
            );

            setInsightText(
                `insight-rank-${position}-text`,
                driver.text
            );


            const bar =
                document.getElementById(
                    `insight-rank-${position}-bar`
                );

            if (bar) {

                const width =
                    Math.max(
                        8,
                        Math.min(
                            driver.score,
                            100
                        )
                    );

                requestAnimationFrame(
                    () => {
                        bar.style.width =
                            `${width.toFixed(0)}%`;
                    }
                );
            }
        }
    );
}


/* =========================================================
   MAIN AI INSIGHTS FUNCTION
   ========================================================= */

async function loadAiInsights() {

    try {

        /* -------------------------------------------------
           Fetch live environment + AI forecast together
           ------------------------------------------------- */

        const [
            environmentResponse,
            forecastResponse
        ] = await Promise.all([

            fetch(
                "/api/environment/current"
            ),

            fetch(
                "/api/forecast"
            )
        ]);


        if (!environmentResponse.ok) {
            throw new Error(
                "Unable to load current environment."
            );
        }


        if (!forecastResponse.ok) {
            throw new Error(
                "Unable to load AI forecast."
            );
        }


        const environment =
            await environmentResponse.json();

        const forecastData =
            await forecastResponse.json();


        /* =================================================
           LIVE ENVIRONMENT
           ================================================= */

        const currentAqi =
            Number(
                environment.air_quality.us_aqi
            );

        const pm25 =
            Number(
                environment.air_quality.pm2_5
            );

        const dust =
            Number(
                environment.air_quality.dust
            );

        const temperature =
            Number(
                environment.weather.temperature
            );

        const humidity =
            Number(
                environment.weather.humidity
            );


        /* =================================================
           FORECAST MODEL OUTPUT
           ================================================= */

        const forecast =
            forecastData.ai_forecast || {};

        const validation =
            forecastData.model_validation || {};

        const predictedAqi =
            Number(
                forecast.next_day_aqi
            );

        const predictedCategory =
            forecast.category ||
            (
                Number.isFinite(predictedAqi)
                    ? getAqiCategory(predictedAqi)
                    : "Unavailable"
            );


        const forecastDate =
            forecastData.forecast_date ||
            "--";


        /* =================================================
           TODAY / TOMORROW COMPARISON
           ================================================= */

       const difference =
    predictedAqi - currentAqi;


let direction = "Stable";

let headline =
    "The AI expects conditions to remain relatively stable.";

let explanation =
    "The predicted AQI is close to the current reading, indicating no major next-day change according to the present model output.";


/* =========================================================
   More detailed forecast direction
   ========================================================= */

if (difference <= -10) {

    direction =
        "Improving";

    headline =
        "The AI expects air-quality conditions to improve.";

    explanation =
        "The predicted next-day AQI is meaningfully lower than the current reading, indicating an improvement according to the present model output.";
}


else if (difference < -3) {

    direction =
        "Slight improvement";

    headline =
        "The AI expects conditions to improve slightly.";

    explanation =
        "The predicted AQI is moderately lower than the current reading, suggesting a small improvement in next-day environmental conditions.";
}


else if (difference <= 3) {

    direction =
        "Stable";

    headline =
        "The AI expects conditions to remain relatively stable.";

    explanation =
        "The predicted AQI remains close to the current reading, indicating no major next-day change according to the present model output.";
}


else if (difference < 10) {

    direction =
        "Slight increase";

    headline =
        "The AI expects environmental pressure to increase slightly.";

    explanation =
        "The predicted AQI is moderately above the current reading, suggesting a small deterioration in next-day air-quality conditions.";
}


else {

    direction =
        "Clear increase";

    headline =
        "The AI expects a noticeable increase in environmental pressure.";

    explanation =
        "The predicted next-day AQI is meaningfully above the current reading, indicating a more noticeable deterioration according to the present model output.";
}


        /* =================================================
           DYNAMIC SUMMARY
           ================================================= */

        summary =
            `Current AQI is ${
                Number.isFinite(currentAqi)
                    ? Math.round(currentAqi)
                    : "--"
            }, while the AI model predicts ${
                Number.isFinite(predictedAqi)
                    ? Math.round(predictedAqi)
                    : "--"
            } for the next day. `;


        if (
    direction === "Clear increase" ||
    direction === "Slight increase"
) {

    summary +=
        direction === "Clear increase"
            ? "The forecast therefore indicates a noticeable increase. "
            : "The forecast therefore indicates a modest increase. ";
}

else if (
    direction === "Improving" ||
    direction === "Slight improvement"
) {

    summary +=
        direction === "Improving"
            ? "The forecast therefore indicates a meaningful improvement. "
            : "The forecast therefore indicates a slight improvement. ";
}

else {

    summary +=
        "The forecast therefore indicates broadly stable conditions. ";
}


        if (pm25 >= 35) {

            summary +=
                "PM2.5 is one of the notable current environmental signals. ";
        }


        if (dust >= 80) {

            summary +=
                "Dust is also contributing to the environmental exposure profile. ";
        }


        if (temperature >= 35) {

            summary +=
                "Warm conditions additionally increase the importance of hydration and heat awareness.";
        }


        /* =================================================
           HERO
           ================================================= */

        setInsightText(
            "insight-headline",
            headline
        );

        setInsightText(
            "insight-summary",
            summary
        );

        setInsightText(
            "insight-direction",
            direction
        );

        setInsightText(
            "insight-predicted-aqi",
            Number.isFinite(predictedAqi)
                ? Math.round(predictedAqi)
                : "--"
        );

        setInsightText(
            "insight-predicted-category",
            predictedCategory
        );


        /* =================================================
           COMPARISON CARDS
           ================================================= */

        setInsightText(
            "insight-current-aqi",
            Number.isFinite(currentAqi)
                ? Math.round(currentAqi)
                : "--"
        );

        setInsightText(
            "insight-next-aqi",
            Number.isFinite(predictedAqi)
                ? Math.round(predictedAqi)
                : "--"
        );

        setInsightText(
            "insight-change",
            direction
        );


        if (forecastDate !== "--") {

            const dateObject =
                new Date(
                    `${forecastDate}T00:00:00`
                );

            const formattedDate =
                dateObject.toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

            setInsightText(
                "insight-forecast-date",
                formattedDate
            );
        }

        else {

            setInsightText(
                "insight-forecast-date",
                "--"
            );
        }


        /* =================================================
           ENVIRONMENTAL DRIVER CARDS
           ================================================= */

        setInsightText(
            "insight-pm25",
            Number.isFinite(pm25)
                ? `${pm25.toFixed(1)} µg/m³`
                : "--"
        );

        setInsightText(
            "insight-dust",
            Number.isFinite(dust)
                ? dust.toFixed(1)
                : "--"
        );

        setInsightText(
            "insight-temperature",
            Number.isFinite(temperature)
                ? `${temperature.toFixed(1)} °C`
                : "--"
        );

        setInsightText(
            "insight-humidity",
            Number.isFinite(humidity)
                ? `${humidity.toFixed(0)}%`
                : "--"
        );


        /* PM2.5 interpretation */

        setInsightText(
            "insight-pm25-text",

            pm25 >= 55
                ? "Fine-particle pollution is high and represents an important current exposure signal."
                : pm25 >= 35
                ? "Fine-particle levels are above lower ranges and deserve additional awareness."
                : "Fine-particle levels are currently a lower environmental concern."
        );


        /* Dust interpretation */

        setInsightText(
            "insight-dust-text",

            dust >= 100
                ? "Dust levels are high and may strongly influence outdoor exposure."
                : dust >= 80
                ? "Dust is noticeable in the environmental profile and may influence outdoor exposure."
                : "Dust is currently a lower environmental influence."
        );


        /* Temperature interpretation */

        setInsightText(
            "insight-temperature-text",

            temperature >= 40
                ? "Very warm conditions increase the importance of hydration, shade and sun protection."
                : temperature >= 35
                ? "Warm conditions contribute to heat-related environmental exposure."
                : "Temperature currently represents a moderate environmental influence."
        );


        /* Humidity interpretation */

        setInsightText(
            "insight-humidity-text",

            humidity < 25
                ? "Dry conditions may influence comfort and environmental exposure."
                : humidity > 75
                ? "High humidity may increase thermal discomfort."
                : "Humidity is currently within a relatively moderate range."
        );


        /* =================================================
           DRIVER PRIORITY RANKING
           ================================================= */

        const rankedDrivers =
            buildDriverRanking(
                pm25,
                dust,
                temperature,
                humidity
            );

        updateDriverRanking(
            rankedDrivers
        );


        /* =================================================
           AI INTERPRETATION
           ================================================= */

        setInsightText(
            "insight-explanation",
            explanation
        );


        /* =================================================
           MODEL TRANSPARENCY
           ================================================= */

        setInsightText(
            "insight-feature-count",
            validation.feature_count ?? "--"
        );

        setInsightText(
            "insight-missing-features",
            validation.missing_features ?? "--"
        );

        setInsightText(
            "insight-feature-order",
            validation.feature_order_verified
                ? "Verified"
                : "Check required"
        );

        const modelReady =
            validation.feature_order_verified === true &&
            Number(validation.missing_features) === 0;

        setInsightText(
            "insight-ai-status",
            modelReady
                ? "Ready"
                : "Review"
        );

    }

    catch (error) {

        console.error(
            "ClimaCare AI Insights error:",
            error
        );


        setInsightText(
            "insight-headline",
            "AI insight temporarily unavailable."
        );

        setInsightText(
            "insight-summary",
            "ClimaCare could not retrieve the required environmental and forecast information."
        );

        setInsightText(
            "insight-ai-status",
            "Unavailable"
        );
    }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadAiInsights
);