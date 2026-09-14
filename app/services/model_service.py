# ---------------------------------------------------------
# ClimaCare UAE AI
# AI Model Service
# ---------------------------------------------------------

from pathlib import Path
import json
import joblib
import pandas as pd


# ---------------------------------------------------------
# Project paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "climacare_aqi_forecaster.joblib"
)

FEATURE_SCHEMA_PATH = (
    BASE_DIR
    / "models"
    / "climacare_feature_schema.json"
)

MODEL_METADATA_PATH = (
    BASE_DIR
    / "models"
    / "climacare_deployment_metadata.json"
)


# ---------------------------------------------------------
# Load model resources once
# ---------------------------------------------------------

model = joblib.load(MODEL_PATH)

with open(
    FEATURE_SCHEMA_PATH,
    "r",
    encoding="utf-8"
) as file:
    feature_schema = json.load(file)

with open(
    MODEL_METADATA_PATH,
    "r",
    encoding="utf-8"
) as file:
    model_metadata = json.load(file)


FEATURE_COLUMNS = feature_schema["features"]


# ---------------------------------------------------------
# Service information
# ---------------------------------------------------------

def get_model_status():

    return {
        "model_loaded": True,
        "model_type": model_metadata["model_type"],
        "feature_count": len(FEATURE_COLUMNS),
        "location": model_metadata["location"],
        "prediction_task": model_metadata["prediction_task"]
    }


# ---------------------------------------------------------
# AQI prediction
# ---------------------------------------------------------

def predict_next_day_aqi(feature_values: dict):

    missing_features = [
        feature
        for feature in FEATURE_COLUMNS
        if feature not in feature_values
    ]

    if missing_features:
        raise ValueError(
            f"Missing model features: {missing_features}"
        )

    input_row = pd.DataFrame(
        [
            {
                feature: feature_values[feature]
                for feature in FEATURE_COLUMNS
            }
        ]
    )

    prediction = model.predict(input_row)[0]

    return float(prediction)