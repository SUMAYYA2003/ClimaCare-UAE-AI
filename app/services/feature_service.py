# ---------------------------------------------------------
# ClimaCare UAE AI
# Production Feature Engineering Service
# ---------------------------------------------------------

import numpy as np
import pandas as pd


# ---------------------------------------------------------
# Season encoding
#
# Must remain identical to the feature engineering used
# during ClimaCare model development.
# ---------------------------------------------------------

def encode_season(month: int) -> int:

    if month in [12, 1, 2]:
        return 0

    elif month in [3, 4, 5]:
        return 1

    elif month in [6, 7, 8]:
        return 2

    else:
        return 3


# ---------------------------------------------------------
# Build ClimaCare model features from a daily timeline
# ---------------------------------------------------------

def build_model_features(daily_df: pd.DataFrame):

    df = daily_df.copy()

    df["date"] = pd.to_datetime(
        df["date"]
    )

    df = (
        df
        .sort_values("date")
        .reset_index(drop=True)
    )


    # -----------------------------------------------------
    # Calendar features
    # -----------------------------------------------------

    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.dayofweek

    df["season_encoded"] = (
        df["month"]
        .apply(encode_season)
    )


    # -----------------------------------------------------
    # One-day lag features
    # -----------------------------------------------------

    df["pm2_5_lag1"] = (
        df["pm2_5"]
        .shift(1)
    )

    df["pm10_lag1"] = (
        df["pm10"]
        .shift(1)
    )

    df["us_aqi_lag1"] = (
        df["us_aqi"]
        .shift(1)
    )


    # -----------------------------------------------------
    # Previous three-day rolling averages
    #
    # shift(1) is intentional:
    # historical rolling values must not include
    # the current day's observation.
    # -----------------------------------------------------

    df["pm2_5_roll3"] = (
        df["pm2_5"]
        .shift(1)
        .rolling(3)
        .mean()
    )

    df["pm10_roll3"] = (
        df["pm10"]
        .shift(1)
        .rolling(3)
        .mean()
    )

    df["us_aqi_roll3"] = (
        df["us_aqi"]
        .shift(1)
        .rolling(3)
        .mean()
    )


    # -----------------------------------------------------
    # Interaction features
    # -----------------------------------------------------

    df["pm_ratio"] = (
        df["pm2_5"]
        /
        (df["pm10"] + 1e-6)
    )

    df["dust_wind"] = (
        df["dust"]
        /
        (df["wind_speed"] + 1e-6)
    )

    df["temp_humidity"] = (
        df["temperature"]
        *
        df["humidity"]
    )


    return df