/* =========================================================
   CLIMACARE UAE AI — AI EXPLORE
   STEP 1: Live data + forecast + static map + feedback
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    let currentEnvironment = null;
    let currentForecast = null;
    let selectedDestination = null;
    let selectedRating = 0;


    /* DESTINATION DATA */

    const destinations = [

    /* =========================
       DUBAI
    ========================= */

    {
        name: "Burj Khalifa",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "landmark",
        symbol: "◈",
        mapsQuery: "Burj Khalifa Dubai",
        officialUrl: "https://www.burjkhalifa.ae/"
    },

    {
        name: "Museum of the Future",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "landmark",
        symbol: "✦",
        mapsQuery: "Museum of the Future Dubai",
        officialUrl: "https://museumofthefuture.ae/"
    },

    {
        name: "Dubai Frame",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "landmark",
        symbol: "▣",
        mapsQuery: "Dubai Frame",
        officialUrl: "https://www.dubaiframe.ae/"
    },

    {
        name: "Al Seef",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "culture",
        symbol: "◆",
        mapsQuery: "Al Seef Dubai"
    },

    {
        name: "Al Fahidi Historical Neighbourhood",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "culture",
        symbol: "◇",
        mapsQuery: "Al Fahidi Historical Neighbourhood Dubai"
    },

    {
        name: "Dubai Gold Souk",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "culture",
        symbol: "✧",
        mapsQuery: "Dubai Gold Souk"
    },

    {
        name: "Dubai Spice Souk",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "culture",
        symbol: "✺",
        mapsQuery: "Dubai Spice Souk"
    },

    {
        name: "Jumeirah Beach",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Jumeirah Beach Dubai"
    },

    {
        name: "Kite Beach",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Kite Beach Dubai"
    },

    {
        name: "Al Mamzar Beach Park",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Al Mamzar Beach Park Dubai"
    },

    {
        name: "JBR Beach",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "beach",
        symbol: "≈",
        mapsQuery: "JBR Beach Dubai"
    },

    {
        name: "Dubai Marina",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "landmark",
        symbol: "⌁",
        mapsQuery: "Dubai Marina"
    },

    {
        name: "Dubai Miracle Garden",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "nature",
        symbol: "✿",
        mapsQuery: "Dubai Miracle Garden",
        officialUrl: "https://www.dubaimiraclegarden.com/"
    },

    {
        name: "Ras Al Khor Wildlife Sanctuary",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Ras Al Khor Wildlife Sanctuary"
    },

    {
        name: "Al Qudra Lakes",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Al Qudra Lakes Dubai"
    },

    {
        name: "Hatta",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "adventure",
        symbol: "△",
        mapsQuery: "Hatta Dubai"
    },

    {
        name: "Dubai Desert Conservation Reserve",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "desert",
        symbol: "△",
        mapsQuery: "Dubai Desert Conservation Reserve"
    },

    {
        name: "Ski Dubai",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "indoor",
        symbol: "❄",
        mapsQuery: "Ski Dubai",
        officialUrl: "https://www.skidxb.com/"
    },

    {
        name: "Dubai Aquarium & Underwater Zoo",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "family",
        symbol: "◉",
        mapsQuery: "Dubai Aquarium Underwater Zoo"
    },

    {
        name: "IMG Worlds of Adventure",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "family",
        symbol: "★",
        mapsQuery: "IMG Worlds of Adventure Dubai",
        officialUrl: "https://www.imgworlds.com/"
    },

    {
        name: "The Dubai Mall",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "The Dubai Mall"
    },

    {
        name: "Mall of the Emirates",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "Mall of the Emirates"
    },

    {
        name: "Dubai Hills Mall",
        emirate: "Dubai",
        emirateKey: "dubai",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "Dubai Hills Mall"
    },


    /* =========================
       ABU DHABI
    ========================= */

    {
        name: "Sheikh Zayed Grand Mosque",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "culture",
        symbol: "◇",
        mapsQuery: "Sheikh Zayed Grand Mosque Abu Dhabi",
        officialUrl: "https://www.szgmc.gov.ae/"
    },

    {
        name: "Louvre Abu Dhabi",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "culture",
        symbol: "◉",
        mapsQuery: "Louvre Abu Dhabi",
        officialUrl: "https://www.louvreabudhabi.ae/"
    },

    {
        name: "Qasr Al Watan",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "culture",
        symbol: "♜",
        mapsQuery: "Qasr Al Watan Abu Dhabi",
        officialUrl: "https://www.qasralwatan.ae/"
    },

    {
        name: "Qasr Al Hosn",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "culture",
        symbol: "◆",
        mapsQuery: "Qasr Al Hosn Abu Dhabi"
    },

    {
        name: "Abu Dhabi Corniche",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Abu Dhabi Corniche"
    },

    {
        name: "Saadiyat Beach",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Saadiyat Beach Abu Dhabi"
    },

    {
        name: "Hudayriyat Island",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Hudayriyat Island Abu Dhabi"
    },

    {
        name: "Jubail Mangrove Park",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Jubail Mangrove Park Abu Dhabi"
    },

    {
        name: "Al Ain Oasis",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Al Ain Oasis"
    },

    {
        name: "Jebel Hafeet",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "nature",
        symbol: "△",
        mapsQuery: "Jebel Hafeet Al Ain"
    },

    {
        name: "Ferrari World Abu Dhabi",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "family",
        symbol: "★",
        mapsQuery: "Ferrari World Abu Dhabi",
        officialUrl: "https://www.ferrariworldabudhabi.com/"
    },

    {
        name: "Warner Bros. World Abu Dhabi",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "family",
        symbol: "★",
        mapsQuery: "Warner Bros World Abu Dhabi",
        officialUrl: "https://www.wbworldabudhabi.com/"
    },

    {
        name: "SeaWorld Yas Island",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "family",
        symbol: "◉",
        mapsQuery: "SeaWorld Yas Island Abu Dhabi",
        officialUrl: "https://www.seaworldabudhabi.com/"
    },

    {
        name: "Yas Mall",
        emirate: "Abu Dhabi",
        emirateKey: "abu-dhabi",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "Yas Mall Abu Dhabi"
    },


    /* =========================
       SHARJAH
    ========================= */

    {
        name: "Al Noor Island",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Al Noor Island Sharjah"
    },

    {
        name: "Al Khan Beach",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Al Khan Beach Sharjah"
    },

    {
        name: "Khorfakkan Beach",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Khorfakkan Beach Sharjah"
    },

    {
        name: "Heart of Sharjah",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "culture",
        symbol: "◆",
        mapsQuery: "Heart of Sharjah"
    },

    {
        name: "Sharjah Museum of Islamic Civilization",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "culture",
        symbol: "◇",
        mapsQuery: "Sharjah Museum of Islamic Civilization"
    },

    {
        name: "Sharjah Aquarium",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "family",
        symbol: "◉",
        mapsQuery: "Sharjah Aquarium"
    },

    {
        name: "Mleiha Archaeological Centre",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "desert",
        symbol: "△",
        mapsQuery: "Mleiha Archaeological Centre Sharjah"
    },

    {
        name: "City Centre Al Zahia",
        emirate: "Sharjah",
        emirateKey: "sharjah",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "City Centre Al Zahia Sharjah"
    },


    /* =========================
       AJMAN
    ========================= */

    {
        name: "Ajman Corniche",
        emirate: "Ajman",
        emirateKey: "ajman",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Ajman Corniche"
    },

    {
        name: "Ajman Museum",
        emirate: "Ajman",
        emirateKey: "ajman",
        category: "culture",
        symbol: "◇",
        mapsQuery: "Ajman Museum"
    },

    {
        name: "Al Zorah Nature Reserve",
        emirate: "Ajman",
        emirateKey: "ajman",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Al Zorah Nature Reserve Ajman"
    },

    {
        name: "City Centre Ajman",
        emirate: "Ajman",
        emirateKey: "ajman",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "City Centre Ajman"
    },


    /* =========================
       UMM AL QUWAIN
    ========================= */

    {
        name: "Umm Al Quwain Mangroves",
        emirate: "Umm Al Quwain",
        emirateKey: "umm-al-quwain",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Umm Al Quwain Mangroves"
    },

    {
        name: "Umm Al Quwain Beach",
        emirate: "Umm Al Quwain",
        emirateKey: "umm-al-quwain",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Umm Al Quwain Beach"
    },

    {
        name: "Umm Al Quwain Fort",
        emirate: "Umm Al Quwain",
        emirateKey: "umm-al-quwain",
        category: "culture",
        symbol: "◆",
        mapsQuery: "Umm Al Quwain Fort"
    },


    /* =========================
       RAS AL KHAIMAH
    ========================= */

    {
        name: "Jebel Jais",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "nature",
        symbol: "△",
        mapsQuery: "Jebel Jais Ras Al Khaimah"
    },

    {
        name: "Jais Flight",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "adventure",
        symbol: "↗",
        mapsQuery: "Jais Flight Ras Al Khaimah"
    },

    {
        name: "Al Jazeera Al Hamra",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "culture",
        symbol: "◆",
        mapsQuery: "Al Jazeera Al Hamra Ras Al Khaimah"
    },

    {
        name: "Dhayah Fort",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "culture",
        symbol: "♜",
        mapsQuery: "Dhayah Fort Ras Al Khaimah"
    },

    {
        name: "Al Marjan Island",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Al Marjan Island Ras Al Khaimah"
    },

    {
        name: "Manar Mall",
        emirate: "Ras Al Khaimah",
        emirateKey: "ras-al-khaimah",
        category: "shopping",
        symbol: "▤",
        mapsQuery: "Manar Mall Ras Al Khaimah"
    },


    /* =========================
       FUJAIRAH
    ========================= */

    {
        name: "Al Aqah Beach",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Al Aqah Beach Fujairah"
    },

    {
        name: "Fujairah Beach",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "beach",
        symbol: "≈",
        mapsQuery: "Fujairah Beach"
    },

    {
        name: "Fujairah Fort",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "culture",
        symbol: "♜",
        mapsQuery: "Fujairah Fort"
    },

    {
        name: "Al Bidya Mosque",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "culture",
        symbol: "◇",
        mapsQuery: "Al Bidya Mosque Fujairah"
    },

    {
        name: "Wadi Wurayah",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "nature",
        symbol: "♧",
        mapsQuery: "Wadi Wurayah Fujairah"
    },

    {
        name: "Snoopy Island",
        emirate: "Fujairah",
        emirateKey: "fujairah",
        category: "adventure",
        symbol: "◉",
        mapsQuery: "Snoopy Island Fujairah"
    }

];


    /* =====================================================
       SMALL HELPERS
    ===================================================== */

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }


    function numberValue(value, fallback = 0) {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : fallback;
    }


    function getAqiCategory(aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Sensitive Groups";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Unhealthy";

        return "Hazardous";
    }


    /* =====================================================
       DATE
    ===================================================== */

    function updateDate() {
        const now = new Date();

        const formatted = now.toLocaleDateString(
            "en-AE",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

        setText("hero-date", formatted);
    }


    /* =====================================================
       LIVE ENVIRONMENT
    ===================================================== */

    async function loadEnvironment() {

        try {

            const response =
                await fetch("/api/environment/current");

            if (!response.ok) {
                throw new Error(
                    "Environment API failed"
                );
            }

            const data =
                await response.json();


            currentEnvironment = {
    ...(data.air_quality || {}),
    ...(data.weather || {}),
    location: data.location || {}
};


            const aqi =
                numberValue(
                    currentEnvironment.us_aqi
                );

            const temperature =
                numberValue(
                    currentEnvironment.temperature
                );

            const pm25 =
                numberValue(
                    currentEnvironment.pm2_5
                );

            const dust =
                numberValue(
                    currentEnvironment.dust
                );

            const humidity =
                numberValue(
                    currentEnvironment.humidity
                );

            const wind =
                numberValue(
                    currentEnvironment.wind_speed
                );


            setText(
                "explore-aqi",
                aqi.toFixed(0)
            );

            setText(
                "explore-aqi-category",
                getAqiCategory(aqi)
            );

            setText(
                "explore-temperature",
                `${temperature.toFixed(1)}°C`
            );

            setText(
                "explore-pm25",
                `${pm25.toFixed(1)} µg/m³`
            );

            setText(
                "explore-dust",
                dust.toFixed(1)
            );

            setText(
                "explore-humidity",
                `${humidity.toFixed(0)}%`
            );

            setText(
                "explore-wind",
                `${wind.toFixed(1)} km/h`
            );


            /* Explainability values */

            setText(
                "decision-aqi",
                aqi.toFixed(0)
            );

            setText(
                "decision-temperature",
                `${temperature.toFixed(1)}°C`
            );

            setText(
                "decision-dust",
                dust.toFixed(1)
            );

            setText(
                "decision-wind",
                `${wind.toFixed(1)} km/h`
            );


            updateDestinationCards();

        }

        catch (error) {

            console.error(
                "Environment error:",
                error
            );

            setText(
                "explore-aqi-category",
                "Unavailable"
            );
        }
    }


    /* =====================================================
       FORECAST
    ===================================================== */

    async function loadForecast() {

        try {

            const response =
                await fetch("/api/forecast");

            if (!response.ok) {
                throw new Error(
                    "Forecast API failed"
                );
            }

            const data =
                await response.json();


            currentForecast =
                data;


            const forecast =
                data.ai_forecast ||
                data.forecast ||
                data;


            const current =
                data.current_environment ||
                currentEnvironment ||
                {};


            const nextAqi =
                numberValue(
                    forecast.next_day_aqi
                );

            const currentAqi =
                numberValue(
                    current.us_aqi
                );


            const difference =
                nextAqi - currentAqi;


            setText(
                "explore-next-aqi",
                nextAqi.toFixed(0)
            );

            setText(
                "decision-forecast",
                nextAqi.toFixed(0)
            );


            let direction =
                "Stable";

            let message =
                "Conditions are expected to remain broadly stable.";


            if (difference >= 10) {

                direction =
                    "Clear increase";

                message =
                    "Higher environmental pressure is expected tomorrow.";

            }

            else if (difference >= 3) {

                direction =
                    "Slight increase";

                message =
                    "A modest AQI increase is expected tomorrow.";

            }

            else if (difference <= -10) {

                direction =
                    "Improving";

                message =
                    "Environmental conditions may improve tomorrow.";

            }

            else if (difference <= -3) {

                direction =
                    "Slight improvement";

                message =
                    "A modest AQI improvement is expected tomorrow.";
            }


            setText(
                "explore-direction",
                direction
            );

            setText(
                "explore-forecast-text",
                message
            );


            updateDestinationCards();

        }

        catch (error) {

            console.error(
                "Forecast error:",
                error
            );

            setText(
                "explore-direction",
                "Unavailable"
            );
        }
    }


    /* =====================================================
       SIMPLE SUITABILITY LOGIC
    ===================================================== */

    function getSuitability(category) {

        if (!currentEnvironment) {

            return {
                label: "Analysing...",
                reason: "Waiting for live conditions.",
                bestTime: "Calculating..."
            };
        }


        const temperature =
            numberValue(
                currentEnvironment.temperature
            );

        const aqi =
            numberValue(
                currentEnvironment.us_aqi
            );

        const dust =
            numberValue(
                currentEnvironment.dust
            );

        const wind =
            numberValue(
                currentEnvironment.wind_speed
            );


        if (
    category === "indoor" ||
    category === "shopping" ||
    category === "family"
) {

            return {
                label:
                    temperature >= 36 ||
                    aqi >= 150
                        ? "Excellent"
                        : "Good",

                reason:
                    "Indoor activities reduce exposure to outdoor heat and air-quality conditions.",

                bestTime:
                    "Anytime"
            };
        }


        if (category === "desert") {

            if (
                dust >= 100 ||
                wind >= 25 ||
                temperature >= 40
            ) {

                return {
                    label: "Low",
                    reason:
                        "Heat, dust or wind currently reduce desert suitability.",
                    bestTime:
                        "Early morning / cooler conditions"
                };
            }


            return {
                label: "Moderate",
                reason:
                    "Conditions are acceptable but outdoor exposure should still be considered.",
                bestTime:
                    "Sunrise / Sunset"
            };
        }


        if (category === "beach") {

            if (
                temperature >= 38 ||
                aqi >= 150
            ) {

                return {
                    label: "Moderate",
                    reason:
                        "Later hours may offer lower heat exposure than daytime.",
                    bestTime:
                        "Sunset / Evening"
                };
            }


            return {
                label: "Good",
                reason:
                    "Current conditions are relatively suitable for a waterfront visit.",
                bestTime:
                    "Morning / Evening"
            };
        }


        if (
            temperature >= 40 ||
            aqi >= 170 ||
            dust >= 120
        ) {

            return {
                label: "Low",
                reason:
                    "Current outdoor environmental conditions are less suitable.",
                bestTime:
                    "Cooler hours"
            };
        }


        if (
            temperature >= 36 ||
            aqi >= 120
        ) {

            return {
                label: "Moderate",
                reason:
                    "Shorter outdoor visits and cooler hours may be preferable.",
                bestTime:
                    "Morning / Evening"
            };
        }


        return {
            label: "Good",
            reason:
                "Environmental conditions are currently more favourable.",
            bestTime:
                "Morning / Evening"
        };
    }


/* =====================================================
   RENDER DESTINATION CARDS
===================================================== */

function renderDestinationCards() {

    const grid =
        document.getElementById(
            "destination-card-grid"
        );

    if (!grid) return;

    grid.innerHTML = "";


    destinations.forEach(
        destination => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "destination-card";


            article.dataset.name =
                destination.name;

            article.dataset.emirate =
                destination.emirateKey;

            article.dataset.category =
                destination.category;


            const link =
                destination.officialUrl ||
                (
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(
                        destination.mapsQuery
                    )
                );


            const linkText =
                destination.officialUrl
                    ? "Official Site ↗"
                    : "Google Maps ↗";


            article.innerHTML = `

                <div class="destination-card-top">

                    <div class="destination-visual ${destination.category}-card">
                        <span>
                            ${destination.symbol || "⌖"}
                        </span>
                    </div>

                    <button
                        type="button"
                        class="destination-map-btn"
                        aria-label="Show ${destination.name} on map"
                    >
                        ⌖
                    </button>

                </div>


                <div class="destination-card-body">

                    <h4>
                        ${destination.name}
                    </h4>


                    <span class="destination-type">
                        ${destination.category.charAt(0).toUpperCase() +
                        destination.category.slice(1)}
                        •
                        ${destination.emirate}
                    </span>


                    <span
                        class="destination-suitability"
                        data-suitability
                    >
                        Analysing...
                    </span>


                    <p data-reason>
                        Evaluating current environmental conditions.
                    </p>


                    <div class="destination-best-time">
                        ◷

                        <span data-best-time>
                            Calculating best time...
                        </span>
                    </div>


                    <div class="destination-actions">

                        <button
                            type="button"
                            class="show-on-map-btn"
                        >
                            Show on Map
                        </button>


                        <a
                            href="${link}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${linkText}
                        </a>

                    </div>

                </div>
            `;


            grid.appendChild(
                article
            );

        }
    );


    updateDestinationCards();
}

    /* =====================================================
       UPDATE DESTINATION CARDS
    ===================================================== */

    function updateDestinationCards() {

        document
            .querySelectorAll(
                ".destination-card"
            )
            .forEach(card => {

                const category =
                    card.dataset.category;


                const result =
                    getSuitability(
                        category
                    );


                const suitability =
                    card.querySelector(
                        "[data-suitability]"
                    );


                const reason =
                    card.querySelector(
                        "[data-reason]"
                    );


                const bestTime =
                    card.querySelector(
                        "[data-best-time]"
                    );


                if (suitability) {
                    suitability.textContent =
                        result.label;
                }


                if (reason) {
                    reason.textContent =
                        result.reason;
                }


                if (bestTime) {
                    bestTime.textContent =
                        `Best time: ${result.bestTime}`;
                }

            });
    }

/* =====================================================
   DESTINATION FILTERS + VIEW MORE
===================================================== */

let activeCategory = "all";
let activeEmirate = "all";
let showAllDestinations = false;


function applyDestinationFilters() {

    const cards =
        Array.from(
            document.querySelectorAll(
                ".destination-card"
            )
        );


    const filtered =
        cards.filter(card => {

            const category =
                card.dataset.category;

            const emirate =
                card.dataset.emirate;


            const categoryMatch =
                activeCategory === "all" ||
                category === activeCategory;


            const emirateMatch =
                activeEmirate === "all" ||
                emirate === activeEmirate;


            return (
                categoryMatch &&
                emirateMatch
            );
        });


    cards.forEach(card => {
        card.style.display = "none";
    });


    filtered.forEach(
        (card, index) => {

            if (
                showAllDestinations ||
                index < 6
            ) {
                card.style.display = "";
            }

        }
    );


    const viewMoreButton =
        document.getElementById(
            "view-all-destinations"
        );


    if (viewMoreButton) {

        if (filtered.length <= 6) {

            viewMoreButton.style.display =
                "none";

        }

        else {

            viewMoreButton.style.display =
                "";

            viewMoreButton.textContent =
                showAllDestinations
                    ? "View Less"
                    : "View More";
        }
    }
}


/* =====================================================
   CATEGORY FILTER BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".destination-category"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".destination-category"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                activeCategory =
                    button.dataset.category ||
                    "all";


                showAllDestinations =
                    false;


                applyDestinationFilters();

            }
        );

    });


/* =====================================================
   VIEW MORE / VIEW LESS
===================================================== */

document
    .getElementById(
        "view-all-destinations"
    )
    ?.addEventListener(
        "click",
        () => {

            showAllDestinations =
                !showAllDestinations;


            applyDestinationFilters();

        }
    );



    /* =====================================================
   REAL LEAFLET MAP + MAP / SATELLITE TOGGLE
===================================================== */

let exploreMap = null;

let streetLayer = null;

let satelliteLayer = null;

/* =====================================================
   MAP LOCATION HELPERS
===================================================== */

const emirateMapCoordinates = {
    dubai: [25.2048, 55.2708],
    abudhabi: [24.4539, 54.3773],
    sharjah: [25.3463, 55.4209],
    ajman: [25.4052, 55.5136],
    ummalquwain: [25.5647, 55.5552],
    rasalkhaimah: [25.8007, 55.9762],
    fujairah: [25.1288, 56.3265]
};


function getEmirateMapCoordinates(destination) {

    if (!destination) {
        return null;
    }

    const key = String(
        destination.emirateKey || ""
    )
        .toLowerCase()
        .replace(/[^a-z]/g, "");


    return emirateMapCoordinates[key] || null;
}


function focusDestinationOnLeafletMap(destination) {

    if (
        !exploreMap ||
        !destination
    ) {
        return;
    }


    /*
       Exact destination latitude/longitude will be
       added in the next step.

       Until then, use the destination's emirate centre.
    */

    let coordinates = null;


    if (
        destination.lat !== undefined &&
        destination.lng !== undefined
    ) {

        coordinates = [
            destination.lat,
            destination.lng
        ];

    } else {

        coordinates =
            getEmirateMapCoordinates(
                destination
            );

    }


    if (!coordinates) {
        return;
    }


    exploreMap.flyTo(
        coordinates,
        destination.lat !== undefined ? 15 : 10,
        {
            animate: true,
            duration: 1.2
        }
    );


    L.popup()
        .setLatLng(
            coordinates
        )
        .setContent(
            `
            <div class="climacare-map-popup">

                <strong>
                    ${destination.name}
                </strong>

                <span>
                    ${destination.category}
                    •
                    ${destination.emirate}
                </span>

            </div>
            `
        )
        .openOn(
            exploreMap
        );


    setTimeout(
        () => {

            exploreMap.invalidateSize();

        },
        150
    );
}


function initialiseExploreMap() {

    const mapElement =
        document.getElementById(
            "explore-map"
        );

    if (
        !mapElement ||
        typeof L === "undefined"
    ) {
        return;
    }


    exploreMap =
        L.map(
            "explore-map",
            {
                zoomControl: true,
                scrollWheelZoom: true
            }
        );


    /* UAE overview */

    exploreMap.setView(
        [24.35, 54.85],
        7
    );


    /* Normal map */

    streetLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        );


    /* Satellite imagery */

    satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,

                attribution:
                    "Tiles &copy; Esri"
            }
        );


    streetLayer.addTo(
        exploreMap
    );


    /* UAE emirate markers */

    const emirateMarkers = [

        {
            name: "Abu Dhabi",
            coordinates: [24.4539, 54.3773]
        },

        {
            name: "Dubai",
            coordinates: [25.2048, 55.2708]
        },

        {
            name: "Sharjah",
            coordinates: [25.3463, 55.4209]
        },

        {
            name: "Ajman",
            coordinates: [25.4052, 55.5136]
        },

        {
            name: "Umm Al Quwain",
            coordinates: [25.5647, 55.5552]
        },

        {
            name: "Ras Al Khaimah",
            coordinates: [25.8007, 55.9762]
        },

        {
            name: "Fujairah",
            coordinates: [25.1288, 56.3265]
        }

    ];


    emirateMarkers.forEach(
        location => {

            L.marker(
                location.coordinates
            )
                .addTo(
                    exploreMap
                )
                .bindPopup(
                    `
                    <div class="climacare-map-popup">
                        <strong>
                            ${location.name}
                        </strong>

                        <span>
                            UAE destination region
                        </span>
                    </div>
                    `
                );
        }
    );


    setTimeout(
        () => {

            exploreMap.invalidateSize();

        },
        200
    );
}


/* =====================================================
   MAP / SATELLITE BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".map-toggle"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!exploreMap) {
                    return;
                }


                document
                    .querySelectorAll(
                        ".map-toggle"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                const layer =
                    button.dataset.layer;


                if (
                    layer === "satellite"
                ) {

                    if (
                        exploreMap.hasLayer(
                            streetLayer
                        )
                    ) {
                        exploreMap.removeLayer(
                            streetLayer
                        );
                    }


                    satelliteLayer.addTo(
                        exploreMap
                    );

                }

                else {

                    if (
                        exploreMap.hasLayer(
                            satelliteLayer
                        )
                    ) {
                        exploreMap.removeLayer(
                            satelliteLayer
                        );
                    }


                    streetLayer.addTo(
                        exploreMap
                    );
                }
            }
        );

    });

    /* =====================================================
       STATIC MAP HOTSPOTS
    ===================================================== */

    document
        .querySelectorAll(
            ".static-map-hotspot"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const place =
                        button.dataset.place;


                    selectedDestination =
                        destinations.find(
                            item =>
                                item.emirate === place
                        ) || null;


                    setText(
                        "map-location-label",
                        `Selected: ${place}`
                    );


                    document
                        .querySelectorAll(
                            ".emirate-chip"
                        )
                        .forEach(chip => {

                            chip.classList.remove(
                                "active"
                            );


                            if (
                                chip.textContent
                                    .trim() ===
                                place
                            ) {

                                chip.classList.add(
                                    "active"
                                );
                            }

                        });

                }
            );

        });


    /* =====================================================
   EMIRATE FILTER BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".emirate-chip"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".emirate-chip"
                    )
                    .forEach(item => {
                        item.classList.remove(
                            "active"
                        );
                    });


                button.classList.add(
                    "active"
                );


                activeEmirate =
                    button.dataset.emirate ||
                    "all";


                showAllDestinations =
                    false;


                const emirateName =
                    button.textContent.trim();


                setText(
                    "map-location-label",
                    activeEmirate === "all"
                        ? "Showing UAE destinations"
                        : `Showing ${emirateName} destinations`
                );


                applyDestinationFilters();

            }
        );

    });


/* =====================================================
   DESTINATION CARD — SHOW ON MAP
===================================================== */

document
    .getElementById(
        "destination-card-grid"
    )
    ?.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".show-on-map-btn, .destination-map-btn"
                );

            if (!button) return;


            const card =
                button.closest(
                    ".destination-card"
                );

            if (!card) return;


            const destinationName =
                card.dataset.name;


            const destination =
                destinations.find(
                    item =>
                        item.name === destinationName
                );


            if (!destination) return;


            selectedDestination =
                destination;

                focusDestinationOnLeafletMap(destination);


            setText(
                "map-location-label",
                `${destination.name}, ${destination.emirate}`
            );


            document
                .querySelectorAll(
                    ".emirate-chip"
                )
                .forEach(chip => {

                    chip.classList.toggle(
                        "active",
                        chip.dataset.emirate ===
                        destination.emirateKey
                    );

                });


            const mapSection =
                document.getElementById(
                    "explore-map"
                );


            if (mapSection) {

                mapSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        }
    );





    /* =====================================================
       SEARCH
    ===================================================== */

function textDistance(a, b) {

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (b.charAt(i - 1) === a.charAt(j - 1)) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
            }
        }
    }

    return matrix[b.length][a.length];
}


    function searchDestination() {

        const input =
            document.getElementById(
                "explore-search-input"
            );


        const query =
            input?.value
                .trim()
                .toLowerCase();


        if (!query) {
            return;
        }


       let destination =
    destinations.find(
        item =>
            item.name
                .toLowerCase()
                .includes(query) ||

            item.emirate
                .toLowerCase()
                .includes(query)
    );


/* Try typo-tolerant search if exact search failed */

if (!destination) {

    let bestMatch = null;
    let bestDistance = Infinity;

    destinations.forEach(item => {

        const name =
            item.name.toLowerCase();

        const distance =
            textDistance(
                query,
                name
            );

        if (distance < bestDistance) {

            bestDistance =
                distance;

            bestMatch =
                item;
        }
    });


    if (bestDistance <= 3) {

        destination =
            bestMatch;
    }
}


        if (destination) {

    selectedDestination =
        destination;


    activeEmirate =
        destination.emirateKey;

    activeCategory =
        destination.category;

    showAllDestinations =
        false;


    document
        .querySelectorAll(
            ".emirate-chip"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.emirate ===
                destination.emirateKey
            );

        });


    document
        .querySelectorAll(
            ".destination-category"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                destination.category
            );

        });


    setText(
        "map-location-label",
        `${destination.name}, ${destination.emirate}`
    );


    applyDestinationFilters();

}

        else {

            setText(
                "map-location-label",
                `No saved destination found for "${input.value}".`
            );
        }
    }


    document
        .getElementById(
            "explore-search-btn"
        )
        ?.addEventListener(
            "click",
            searchDestination
        );


    document
        .getElementById(
            "explore-search-input"
        )
        ?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    searchDestination();
                }
            }
        );


    /* =====================================================
       GOOGLE MAPS
    ===================================================== */

    document
        .getElementById(
            "open-google-maps"
        )
        ?.addEventListener(
            "click",
            () => {

                const query =
                    selectedDestination
                        ? `${selectedDestination.name} ${selectedDestination.emirate}`
                        : "United Arab Emirates tourist attractions";


                const url =
                    "https://www.google.com/maps/search/?api=1&query=" +
                    encodeURIComponent(query);


                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );


    /* =====================================================
       FEEDBACK STARS
    ===================================================== */

    document
        .querySelectorAll(
            ".feedback-rating-buttons button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedRating =
                        Number(
                            button.dataset.rating
                        );


                    document
                        .querySelectorAll(
                            ".feedback-rating-buttons button"
                        )
                        .forEach(
                            (star, index) => {

                                star.textContent =
                                    index < selectedRating
                                        ? "★"
                                        : "☆";
                            }
                        );


                    setText(
                        "feedback-status",
                        `Rating selected: ${selectedRating}/5`
                    );

                }
            );

        });


    /* =====================================================
       FEEDBACK SUBMIT
    ===================================================== */

    document
        .getElementById(
            "submit-explore-feedback"
        )
        ?.addEventListener(
            "click",
            () => {

                const feedback =
                    document
                        .getElementById(
                            "explore-feedback-text"
                        )
                        ?.value
                        .trim();


                if (
                    selectedRating === 0 &&
                    !feedback
                ) {

                    setText(
                        "feedback-status",
                        "Please select a rating or write a short comment."
                    );

                    return;
                }


                setText(
                    "feedback-status",
                    "Thank you. Your feedback has been recorded for this session."
                );

            }
        );


    /* =====================================================
   AI CHAT — LIVE BACKEND CONNECTION
===================================================== */

    function addChatMessage(
        text,
        role
    ) {

        const history =
            document.getElementById(
                "ai-chat-history"
            );


        if (!history) return;


        const message =
            document.createElement(
                "div"
            );


        message.className =
            `ai-message ${
                role === "user"
                    ? "user-message"
                    : "assistant-message"
            }`;


        const avatar =
            document.createElement(
                "span"
            );


        avatar.className =
            "message-avatar";


        avatar.textContent =
            role === "user"
                ? "YOU"
                : "AI";


        const textElement =
            document.createElement(
                "p"
            );


        textElement.textContent =
            text;


        message.appendChild(
            avatar
        );

        message.appendChild(
            textElement
        );


        history.appendChild(
            message
        );


        history.scrollTop =
            history.scrollHeight;
    }


    document
        .querySelectorAll(
            ".ai-prompt-chip"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            "ai-question-input"
                        );


                    if (input) {

                        input.value =
                            button.textContent.trim();

                        input.focus();
                    }

                }
            );

        });


    document
    .getElementById(
        "ask-climacare-ai"
    )
    ?.addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "ai-question-input"
                );

            const question =
                input?.value.trim();

            if (!question) {
                return;
            }

            addChatMessage(
                question,
                "user"
            );

            input.value = "";

            addChatMessage(
                "Thinking...",
                "assistant"
            );

            try {

                const response =
                    await fetch(
                        "/api/explore/assistant",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                message: question
                            })
                        }
                    );

                const data =
                    await response.json();

                const history =
                    document.getElementById(
                        "ai-chat-history"
                    );

                const lastMessage =
                    history?.lastElementChild;

                if (
                    lastMessage &&
                    lastMessage.classList.contains(
                        "assistant-message"
                    )
                ) {
                    lastMessage.remove();
                }

                if (!response.ok) {

                    addChatMessage(
                        data.detail ||
                        "AI assistant is temporarily unavailable.",
                        "assistant"
                    );

                    return;
                }

                addChatMessage(
                    data.answer ||
                    "I could not generate a response.",
                    "assistant"
                );

            } catch (error) {

                const history =
                    document.getElementById(
                        "ai-chat-history"
                    );

                const lastMessage =
                    history?.lastElementChild;

                if (
                    lastMessage &&
                    lastMessage.classList.contains(
                        "assistant-message"
                    )
                ) {
                    lastMessage.remove();
                }

                addChatMessage(
                    "Unable to connect to the AI assistant. Please try again.",
                    "assistant"
                );

                console.error(
                    "ClimaCare AI error:",
                    error
                );
            }
        }
    );


/* =====================================================
   USER FEEDBACK
===================================================== */

let selectedFeedbackRating = 0;

const feedbackButtons = document.querySelectorAll(
    ".feedback-rating-buttons button"
);

const feedbackText = document.getElementById(
    "explore-feedback-text"
);

const feedbackSubmitButton = document.getElementById(
    "submit-explore-feedback"
);

const feedbackStatus = document.getElementById(
    "feedback-status"
);


feedbackButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectedFeedbackRating = Number(
                button.dataset.rating
            );

            feedbackButtons.forEach(item => {

                const rating = Number(
                    item.dataset.rating
                );

                item.textContent =
                    rating <= selectedFeedbackRating
                        ? "★"
                        : "☆";
            });

            if (feedbackStatus) {
                feedbackStatus.textContent = "";
            }
        }
    );

});


if (feedbackSubmitButton) {

    feedbackSubmitButton.addEventListener(
        "click",
        async () => {

            if (selectedFeedbackRating === 0) {

                feedbackStatus.textContent =
                    "Please select a rating first.";

                return;
            }


            const formData = new FormData();

            formData.append(
                "rating",
                selectedFeedbackRating
            );

            formData.append(
                "comment",
                feedbackText
                    ? feedbackText.value.trim()
                    : ""
            );


            feedbackSubmitButton.disabled = true;
            feedbackSubmitButton.textContent =
                "Submitting...";


            try {

                const response = await fetch(
                    "/api/feedback",
                    {
                        method: "POST",
                        body: formData
                    }
                );


                const data = await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Unable to submit feedback."
                    );
                }


                feedbackStatus.textContent =
                    data.message ||
                    "Thank you for your feedback.";


                selectedFeedbackRating = 0;


                feedbackButtons.forEach(
                    item => {
                        item.textContent = "☆";
                    }
                );


                if (feedbackText) {
                    feedbackText.value = "";
                }

            } catch (error) {

                feedbackStatus.textContent =
                    error.message;

            } finally {

                feedbackSubmitButton.disabled = false;

                feedbackSubmitButton.textContent =
                    "Submit Feedback";
            }
        }
    );
}

    /* =====================================================
       START PAGE
    ===================================================== */

    updateDate();

    renderDestinationCards();

    initialiseExploreMap();

    loadEnvironment();

    loadForecast();

    applyDestinationFilters();

});