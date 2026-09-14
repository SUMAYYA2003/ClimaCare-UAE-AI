/* =========================================================
   ClimaCare UAE AI
   Frontend Data Integration
   ========================================================= */


/* ---------------------------------------------------------
   Helper: safely update text
   --------------------------------------------------------- */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* ---------------------------------------------------------
   Helper: convert AQI to category
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


/* ---------------------------------------------------------
   Helper: update AQI visual color
   --------------------------------------------------------- */

function updateAqiVisual(aqi) {

    const ring = document.querySelector(".aqi-ring");

    if (!ring) {
        return;
    }

    let color = "#0b8f55";

    if (aqi > 50 && aqi <= 100) {
        color = "#d6a800";
    }

    else if (aqi > 100 && aqi <= 150) {
        color = "#e67e22";
    }

    else if (aqi > 150 && aqi <= 200) {
        color = "#d71920";
    }

    else if (aqi > 200 && aqi <= 300) {
        color = "#7d3c98";
    }

    else if (aqi > 300) {
        color = "#6e1f32";
    }


    const progress = Math.min(
        (aqi / 300) * 360,
        360
    );


    ring.style.background = `
        conic-gradient(
            ${color} 0deg ${progress}deg,
            rgba(120, 120, 120, 0.12)
            ${progress}deg 360deg
        )
    `;


    const valueElement =
        document.getElementById("current-aqi");

    if (valueElement) {
        valueElement.style.color = color;
    }
}


/* ---------------------------------------------------------
   Helper: health advice
   --------------------------------------------------------- */

function getHealthAdvice(category) {

    switch (category) {

        case "Good":
            return (
                "Air quality is favourable. " +
                "Normal outdoor activities can continue."
            );

        case "Moderate":
            return (
                "Air quality is generally acceptable. " +
                "Sensitive individuals may consider limiting " +
                "prolonged outdoor exposure."
            );

        case "Unhealthy for Sensitive Groups":
            return (
                "Children, older adults and people sensitive " +
                "to air pollution should reduce prolonged " +
                "outdoor activity."
            );

        case "Unhealthy":
            return (
                "Consider reducing prolonged outdoor exposure. " +
                "Sensitive groups should take additional precautions."
            );

        case "Very Unhealthy":
            return (
                "Outdoor exposure should be reduced where possible. " +
                "Sensitive individuals should take extra care."
            );

        default:
            return (
                "Environmental conditions indicate severe air-quality risk. " +
                "Minimise unnecessary outdoor exposure."
            );
    }
}


/* ---------------------------------------------------------
   Load current environment
   --------------------------------------------------------- */

async function loadCurrentEnvironment() {

    try {

        const response = await fetch(
            "/api/environment/current"
        );


        if (!response.ok) {
            throw new Error(
                "Current environment request failed"
            );
        }


        const data = await response.json();

        const air = data.air_quality;
        const weather = data.weather;


        /* Current AQI */

        const currentAqi =
            Number(air.us_aqi);


        setText(
            "current-aqi",
            currentAqi.toFixed(0)
        );


        const currentCategory =
            getAqiCategory(currentAqi);


        setText(
            "current-category",
            currentCategory
        );


        updateAqiVisual(
            currentAqi
        );


        /* Environmental cards */

        setText(
            "pm25",
            Number(air.pm2_5).toFixed(1)
        );

        setText(
            "pm10",
            Number(air.pm10).toFixed(1)
        );

        setText(
            "temperature",
            Number(weather.temperature).toFixed(1)
        );

        setText(
            "humidity",
            Number(weather.humidity).toFixed(0)
        );

        setText(
            "dust",
            Number(air.dust).toFixed(1)
        );


        /* Hero */

        setText(
            "hero-status",
            `${currentCategory} conditions in Dubai`
        );


        setText(
            "hero-message",
            (
                `Current AQI is ${currentAqi.toFixed(0)}. ` +
                "ClimaCare is continuously combining live " +
                "air-quality and weather information with " +
                "AI-driven environmental intelligence."
            )
        );


        /* Last update */

        const retrievedAt =
            data.location?.retrieved_at;


        if (retrievedAt) {

            const time =
                new Date(retrievedAt);


            setText(
                "last-update",
                `Updated ${time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}`
            );
        }

        else {

            setText(
                "last-update",
                "Live data updated"
            );
        }

    }

    catch (error) {

        console.error(
            "ClimaCare environment error:",
            error
        );


        setText(
            "hero-status",
            "Live data temporarily unavailable"
        );


        setText(
            "hero-message",
            (
                "ClimaCare could not retrieve the latest " +
                "environmental data. Please refresh shortly."
            )
        );


        setText(
            "last-update",
            "Update unavailable"
        );
    }
}


/* ---------------------------------------------------------
   Load AI forecast
   --------------------------------------------------------- */

async function loadForecast() {

    try {

        const response = await fetch(
            "/api/forecast"
        );


        if (!response.ok) {
            throw new Error(
                "Forecast request failed"
            );
        }


        const data = await response.json();

        const forecast =
            data.ai_forecast;


        /* Forecast AQI */

        setText(
            "forecast-aqi",
            Number(
                forecast.next_day_aqi
            ).toFixed(0)
        );


        /* Forecast category */

        setText(
            "forecast-category",
            forecast.category
        );


        /* Health risk */

        setText(
            "health-risk",
            `${forecast.health_risk} health risk`
        );


        /* Health advice */

        setText(
            "health-advice",
            getHealthAdvice(
                forecast.category
            )
        );


        /* Early warning */

        if (forecast.early_warning) {

            setText(
                "warning-text",
                "Early environmental warning active"
            );


            const indicator =
                document.getElementById(
                    "warning-indicator"
                );


            if (indicator) {
                indicator.style.color =
                    "#d71920";
            }
        }

        else {

            setText(
                "warning-text",
                "No early warning currently required"
            );


            const indicator =
                document.getElementById(
                    "warning-indicator"
                );


            if (indicator) {
                indicator.style.color =
                    "#0b8f55";
            }
        }


        /* Forecast date */

        const forecastHeading =
            document.querySelector(
                ".forecast-heading h3"
            );


        if (
            forecastHeading &&
            data.forecast_date
        ) {

            const date =
                new Date(
                    `${data.forecast_date}T00:00:00`
                );


            forecastHeading.textContent =
                `Forecast for ${date.toLocaleDateString(
                    "en-AE",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "short"
                    }
                )}`;
        }

    }

    catch (error) {

        console.error(
            "ClimaCare forecast error:",
            error
        );


        setText(
            "forecast-category",
            "Unavailable"
        );


        setText(
            "health-risk",
            "Forecast unavailable"
        );


        setText(
            "health-advice",
            (
                "The AI forecast service could not be " +
                "reached. Please try again shortly."
            )
        );
    }
}


/* ---------------------------------------------------------
   Navigation behaviour
   --------------------------------------------------------- */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    navItems.forEach(
                        (nav) =>
                            nav.classList.remove(
                                "active"
                            )
                    );


                    item.classList.add(
                        "active"
                    );
                }
            );
        }
    );
}


/* ---------------------------------------------------------
   Button behaviour
   --------------------------------------------------------- */

function setupButtons() {

    const forecastButton =
        document.querySelector(
            ".primary-button"
        );


    const explainButton =
        document.querySelector(
            ".secondary-button"
        );


    const insightButton =
        document.querySelector(
            ".insight-button"
        );


    const forecastCard =
        document.querySelector(
            ".forecast-card"
        );


    const insightCard =
        document.querySelector(
            ".insight-card"
        );


    if (
        forecastButton &&
        forecastCard
    ) {

        forecastButton.addEventListener(
            "click",
            () => {

                forecastCard.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );
            }
        );
    }


    if (
        explainButton &&
        insightCard
    ) {

        explainButton.addEventListener(
            "click",
            () => {

                insightCard.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );
            }
        );
    }


    if (
        insightButton &&
        insightCard
    ) {

        insightButton.addEventListener(
            "click",
            () => {

                insightCard.scrollIntoView(
                    {
                        behavior: "smooth",
                        block: "center"
                    }
                );
            }
        );
    }
}


/* ---------------------------------------------------------
   Start ClimaCare application
   --------------------------------------------------------- */

async function initialiseClimaCare() {

    setupNavigation();

    setupButtons();


    await Promise.allSettled([
        loadCurrentEnvironment(),
        loadForecast()
    ]);

}


document.addEventListener(
    "DOMContentLoaded",
    initialiseClimaCare
);
/* =========================================================
   Dynamic greeting + local date/time
   ========================================================= */

function updateGreetingAndTime() {
    const now = new Date();
    const hour = now.getHours();

    let greeting = "Good day";

    if (hour >= 5 && hour < 12) {
        greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good evening";
    } else {
        greeting = "Good night";
    }

    const greetingElement = document.getElementById("dynamic-greeting");
    const timeElement = document.getElementById("live-date-time");

    if (greetingElement) {
        greetingElement.textContent = greeting;
    }

    if (timeElement) {
        timeElement.textContent = now.toLocaleString("en-AE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit"
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateGreetingAndTime();
    setInterval(updateGreetingAndTime, 60000);
});