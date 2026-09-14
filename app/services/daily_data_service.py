# ---------------------------------------------------------
# ClimaCare UAE AI
# Recent Dubai Daily Environmental Timeline Service
# ---------------------------------------------------------

import pandas as pd
import requests


# ---------------------------------------------------------
# Dubai reference coordinates
# ---------------------------------------------------------

DUBAI_LATITUDE = 25.07725
DUBAI_LONGITUDE = 55.30927

TIMEZONE = "Asia/Dubai"


AIR_QUALITY_URL = (
    "https://air-quality-api.open-meteo.com/v1/air-quality"
)

WEATHER_URL = (
    "https://api.open-meteo.com/v1/forecast"
)


# ---------------------------------------------------------
# Build recent Dubai daily timeline
# ---------------------------------------------------------

def get_recent_daily_environment():

    # -----------------------------------------------------
    # Air-quality hourly data
    # -----------------------------------------------------

    air_params = {
        "latitude": DUBAI_LATITUDE,
        "longitude": DUBAI_LONGITUDE,

        "hourly": [
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

        "past_days": 7,
        "forecast_days": 1,

        "timezone": TIMEZONE,
        "domains": "cams_global"
    }

    air_response = requests.get(
        AIR_QUALITY_URL,
        params=air_params,
        timeout=40
    )

    air_response.raise_for_status()

    air_hourly = pd.DataFrame(
        air_response.json()["hourly"]
    )

    air_hourly["time"] = pd.to_datetime(
        air_hourly["time"]
    )

    air_hourly["date"] = (
        air_hourly["time"].dt.date
    )


    # -----------------------------------------------------
    # Weather hourly data
    # -----------------------------------------------------

    weather_params = {
        "latitude": DUBAI_LATITUDE,
        "longitude": DUBAI_LONGITUDE,

        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "wind_speed_10m"
        ],

        "past_days": 7,
        "forecast_days": 1,

        "timezone": TIMEZONE,
        "wind_speed_unit": "kmh"
    }

    weather_response = requests.get(
        WEATHER_URL,
        params=weather_params,
        timeout=40
    )

    weather_response.raise_for_status()

    weather_hourly = pd.DataFrame(
        weather_response.json()["hourly"]
    )

    weather_hourly["time"] = pd.to_datetime(
        weather_hourly["time"]
    )

    weather_hourly["date"] = (
        weather_hourly["time"].dt.date
    )


    # -----------------------------------------------------
    # Convert air quality to daily averages
    # -----------------------------------------------------

    air_columns = [
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
    ]

    air_daily = (
        air_hourly
        .groupby("date")[air_columns]
        .mean()
        .reset_index()
    )


    # -----------------------------------------------------
    # Convert weather to daily averages
    # -----------------------------------------------------

    weather_columns = [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m"
    ]

    weather_daily = (
        weather_hourly
        .groupby("date")[weather_columns]
        .mean()
        .reset_index()
    )


    weather_daily = weather_daily.rename(
        columns={
            "temperature_2m": "temperature",
            "relative_humidity_2m": "humidity",
            "wind_speed_10m": "wind_speed"
        }
    )


    # -----------------------------------------------------
    # Merge air quality + weather
    # -----------------------------------------------------

    daily_df = pd.merge(
        air_daily,
        weather_daily,
        on="date",
        how="inner"
    )


    daily_df["date"] = pd.to_datetime(
        daily_df["date"]
    )


    daily_df = (
        daily_df
        .sort_values("date")
        .reset_index(drop=True)
    )


    return daily_df