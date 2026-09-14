# ---------------------------------------------------------
# ClimaCare UAE AI
# Dubai Environmental Data Service
# ---------------------------------------------------------

from datetime import datetime
import requests


# Dubai reference coordinates
DUBAI_LATITUDE = 25.07725
DUBAI_LONGITUDE = 55.30927
TIMEZONE = "Asia/Dubai"


AIR_QUALITY_URL = (
    "https://air-quality-api.open-meteo.com/v1/air-quality"
)

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


def get_current_environment():

    # -----------------------------------------------------
    # Current air-quality values
    # -----------------------------------------------------

    air_params = {
        "latitude": DUBAI_LATITUDE,
        "longitude": DUBAI_LONGITUDE,

        "current": [
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
            "aerosol_optical_depth",
            "dust",
            "uv_index",
            "us_aqi",
            "european_aqi"
        ],

        "timezone": TIMEZONE,
        "domains": "cams_global"
    }

    air_response = requests.get(
        AIR_QUALITY_URL,
        params=air_params,
        timeout=30
    )

    air_response.raise_for_status()

    air_current = air_response.json().get(
        "current",
        {}
    )


    # -----------------------------------------------------
    # Current weather values
    # -----------------------------------------------------

    weather_params = {
        "latitude": DUBAI_LATITUDE,
        "longitude": DUBAI_LONGITUDE,

        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m"
        ],

        "timezone": TIMEZONE,
        "wind_speed_unit": "kmh"
    }

    weather_response = requests.get(
        WEATHER_URL,
        params=weather_params,
        timeout=30
    )

    weather_response.raise_for_status()

    weather_current = weather_response.json().get(
        "current",
        {}
    )


    # -----------------------------------------------------
    # Unified ClimaCare response
    # -----------------------------------------------------

    return {

        "location": {
            "city": "Dubai",
            "country": "UAE",
            "latitude": DUBAI_LATITUDE,
            "longitude": DUBAI_LONGITUDE
        },

        "retrieved_at": datetime.now().isoformat(),

        "air_quality": {
            "pm10": air_current.get("pm10"),
            "pm2_5": air_current.get("pm2_5"),
            "carbon_monoxide": air_current.get("carbon_monoxide"),
            "nitrogen_dioxide": air_current.get("nitrogen_dioxide"),
            "sulphur_dioxide": air_current.get("sulphur_dioxide"),
            "ozone": air_current.get("ozone"),
            "aerosol_optical_depth": air_current.get(
                "aerosol_optical_depth"
            ),
            "dust": air_current.get("dust"),
            "uv_index": air_current.get("uv_index"),
            "us_aqi": air_current.get("us_aqi"),
            "european_aqi": air_current.get("european_aqi")
        },

        "weather": {
            "temperature": weather_current.get(
                "temperature_2m"
            ),
            "humidity": weather_current.get(
                "relative_humidity_2m"
            ),
            "wind_speed": weather_current.get(
                "wind_speed_10m"
            )
        }
    }