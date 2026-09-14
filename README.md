# 🌍 ClimaCare UAE AI

### AI-Driven Climate-Health Intelligence Platform for Environmental Risk Forecasting and Sustainable Decision Support in the UAE

ClimaCare UAE AI is an end-to-end Data Science and Artificial Intelligence platform designed to transform environmental data into practical climate-health intelligence.

The platform integrates historical air-quality data, weather information, live environmental conditions, machine-learning forecasting, explainable AI, health-risk interpretation, and an AI-powered assistant through an interactive web application.

The current predictive model was developed and evaluated using Dubai environmental data, while the application is designed as a UAE-focused framework that can be extended to additional emirates and locations.

---

## 🎯 Project Objectives

- Analyse historical air-quality and weather patterns.
- Integrate current environmental information into an interactive platform.
- Forecast next-day air-quality conditions using Machine Learning.
- Translate environmental measurements into understandable health-risk guidance.
- Provide explainable and transparent AI insights.
- Support environmentally informed travel and activity decisions across the UAE.
- Demonstrate an end-to-end Data Science lifecycle from raw data to a working AI application.

---

## ✨ Key Features

### 📊 Environmental Dashboard
Displays current environmental indicators including AQI, PM2.5, temperature, humidity, wind and other relevant conditions.

### 🤖 AI Forecast
Uses a trained Machine Learning regression model to predict next-day US AQI using environmental, weather, temporal and lag-based features.

### ❤️ Climate & Health Guidance
Transforms environmental conditions into understandable health-oriented guidance while avoiding medical diagnosis.

### 📈 Trends Analytics
Visualises recent environmental trends and changes to support interpretation of air-quality conditions.

### 🧠 AI Insights
Provides contextual interpretation of current environmental conditions, model predictions and influential environmental signals.

### 🗺️ AI Explore
Provides UAE destination discovery with environmental suitability recommendations, emirate/category filtering, destination search and Google Maps integration.

### 💬 AI-Powered Assistant
A backend-grounded AI assistant combines current environmental information and model forecasts to answer climate-health and destination-related questions.

### 🔐 Authentication & Administration
Includes user registration, secure password hashing, login sessions and an administration foundation for application management.

---

## 🧠 Machine Learning

The project evaluates multiple regression approaches for next-day AQI forecasting.

The strongest evaluated model was **Random Forest Regression**.

| Metric | Random Forest |
|---|---:|
| MAE | 7.909 |
| RMSE | 10.215 |
| R² | 0.842 |

An R² of **0.842** indicates that the evaluated Random Forest model explained approximately 84.2% of the variation in the test target under the project's evaluation setup.

Model performance is reported using regression metrics rather than presenting R² as a classification-style “accuracy” score.

---

## 🔬 Data Science Pipeline

```text
Environmental Data
        ↓
Data Inspection & Cleaning
        ↓
Weather Data Integration
        ↓
Exploratory Data Analysis
        ↓
Feature Engineering
        ↓
Chronological Train/Test Split
        ↓
Model Training & Evaluation
        ↓
Model Selection
        ↓
Deployment Model
        ↓
FastAPI Backend
        ↓
Interactive Web Application
        ↓
Forecasting + Explainability + AI Decision Support
```

---

## 🛠️ Technology Stack

**Data Science & Machine Learning**
- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Jupyter Notebook

**Backend**
- FastAPI
- Python
- REST APIs
- SQLite
- Session-based authentication

**Frontend**
- HTML5
- CSS3
- JavaScript
- Jinja2

**AI**
- LLM-powered assistant
- Context-grounded environmental responses
- Machine-learning forecast integration

**Data & Visualisation**
- Historical air-quality data
- Weather data integration
- Live environmental data integration
- Interactive charts and dashboards

---

## 📁 Project Structure

```text
ClimaCare-UAE-AI/
│
├── app/
│   ├── services/
│   ├── static/
│   ├── templates/
│   ├── auth.py
│   └── main.py
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
├── notebooks/
├── requirements.txt
└── README.md
```

---

## 📓 Data Science Notebooks

The repository contains notebooks covering the main stages of the analytical workflow:

1. `01_data_inspection.ipynb`
2. `02_eda_analysis.ipynb`
3. `03_model_training.ipynb`
4. `04_external_validation.ipynb`

These document data inspection, exploratory analysis, model development and external validation activities.

---

## 🔎 Explainability

ClimaCare UAE AI includes explainability-oriented components to make model outputs easier to understand.

The application distinguishes between predictive model outputs and contextual environmental interpretation. Contextual driver rankings should therefore not be interpreted as causal effects or per-instance SHAP explanations unless explicitly identified as such.

---

## 🔒 Security

Sensitive local configuration is excluded from version control.

The repository does **not** intentionally publish:

- API keys
- `.env` configuration
- Local virtual environments
- Local application databases
- User passwords

Passwords are stored as hashes rather than plaintext within the local authentication system.

---

## ⚠️ Scope & Responsible Use

ClimaCare UAE AI is an academic Data Science and AI project.

The current forecasting model was trained primarily using **Dubai environmental data**. Therefore, model performance should not automatically be interpreted as equivalent across every UAE emirate without appropriate regional data and validation.

Health-related information provided by the application is intended for environmental awareness and decision support and is **not a medical diagnosis or substitute for professional medical advice**.

---

## 🚀 Future Development

Planned extensions include:

- Broader UAE multi-emirate model training
- Expanded real-time environmental data sources
- Advanced model explainability
- Interactive geospatial environmental intelligence
- Enhanced administrative analytics
- Production cloud deployment
- Continued model monitoring and validation

---

## 🎓 Academic Context

Developed as part of an **MSc Data Science & Artificial Intelligence** individual project.

The project demonstrates the practical integration of:

**Data Science → Machine Learning → AI → APIs → Web Development → Explainability → Climate-Health Decision Support**

---

## 👩‍💻 Author

**Sumayya Sheeba Salim**

MSc Data Science & Artificial Intelligence  
B.Tech Computer Science & Engineering

---

### 🌱 ClimaCare UAE AI

**Turning environmental data into understandable, actionable climate-health intelligence.**