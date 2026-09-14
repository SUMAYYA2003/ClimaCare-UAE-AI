# ---------------------------------------------------------
# ClimaCare UAE AI
# Production AQI Forecast Service
# ---------------------------------------------------------

from datetime import timedelta

from app.services.daily_data_service import (
    get_recent_daily_environment
)

from app.services.feature_service import (
    build_model_features
)

from app.services.model_service import (
    FEATURE_COLUMNS,
    predict_next_day_aqi
)


# ---------------------------------------------------------
# AQI health category
# ---------------------------------------------------------

def get_aqi_category(aqi: float) -> str:

    if aqi <= 50:
        return "Good"

    elif aqi <= 100:
        return "Moderate"

    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"

    elif aqi <= 200:
        return "Unhealthy"

    elif aqi <= 300:
        return "Very Unhealthy"

    else:
        return "Hazardous"


# ---------------------------------------------------------
# Simple health-risk level for the app
# ---------------------------------------------------------

def get_health_risk(category: str) -> str:

    if category == "Good":
        return "Low"

    if category == "Moderate":
        return "Mild"

    if category == "Unhealthy for Sensitive Groups":
        return "Elevated"

    if category == "Unhealthy":
        return "High"

    if category == "Very Unhealthy":
        return "Very High"

    return "Severe"


# ---------------------------------------------------------
# Generate automatic ClimaCare forecast
# ---------------------------------------------------------

def generate_aqi_forecast():

    # Get recent Dubai daily environmental timeline
    daily_df = get_recent_daily_environment()

    # Recreate production ML features
    feature_df = build_model_features(
        daily_df
    )

    # Use latest available daily environmental profile
    latest_row = feature_df.iloc[-1]

    latest_features = (
        feature_df[FEATURE_COLUMNS]
        .tail(1)
    )


    # -----------------------------------------------------
    # Safety validation before model inference
    # -----------------------------------------------------

    if latest_features.shape[1] != len(FEATURE_COLUMNS):
        raise ValueError(
            "ClimaCare feature-count validation failed."
        )

    if latest_features.isnull().any().any():
        raise ValueError(
            "ClimaCare model input contains missing values."
        )

    if list(latest_features.columns) != FEATURE_COLUMNS:
        raise ValueError(
            "ClimaCare feature-order validation failed."
        )


    # -----------------------------------------------------
    # Run trained Random Forest
    # -----------------------------------------------------

    feature_values = (
        latest_features
        .iloc[0]
        .to_dict()
    )

    predicted_aqi = predict_next_day_aqi(
        feature_values
    )


    # -----------------------------------------------------
    # Forecast interpretation
    # -----------------------------------------------------

    predicted_category = get_aqi_category(
        predicted_aqi
    )

    health_risk = get_health_risk(
        predicted_category
    )

    # Threshold previously selected by ClimaCare
    warning_threshold = 90

    early_warning = (
        predicted_aqi >= warning_threshold
    )


    forecast_date = (
        latest_row["date"]
        + timedelta(days=1)
    )


    # -----------------------------------------------------
    # Application-ready response
    # -----------------------------------------------------

    return {

        "location": "Dubai, UAE",

        "source_date":
            latest_row["date"].strftime(
                "%Y-%m-%d"
            ),

        "forecast_date":
            forecast_date.strftime(
                "%Y-%m-%d"
            ),

        "current_environment": {

            "us_aqi":
                round(
                    float(latest_row["us_aqi"]),
                    2
                ),

            "pm2_5":
                round(
                    float(latest_row["pm2_5"]),
                    2
                ),

            "pm10":
                round(
                    float(latest_row["pm10"]),
                    2
                ),

            "temperature":
                round(
                    float(latest_row["temperature"]),
                    2
                ),

            "humidity":
                round(
                    float(latest_row["humidity"]),
                    2
                ),

            "dust":
                round(
                    float(latest_row["dust"]),
                    2
                )
        },

        "ai_forecast": {

            "next_day_aqi":
                round(
                    predicted_aqi,
                    2
                ),

            "category":
                predicted_category,

            "health_risk":
                health_risk,

            "early_warning":
                early_warning,

            "warning_threshold":
                warning_threshold
        },

        "model_validation": {

            "feature_count":
                len(FEATURE_COLUMNS),

            "missing_features":
                0,

            "feature_order_verified":
                True
        }
    }