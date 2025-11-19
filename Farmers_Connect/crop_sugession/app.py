
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the trained machine learning model
model = joblib.load('crop_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    
    features = [
        data['N'], data['P'], data['K'], data['temperature'],
        data['humidity'], data['ph'], data['rainfall']
    ]
    
    # Convert features to a format suitable for the model
    final_features = [np.array(features)]
    
    # --- CHANGE: Use predict_proba to get probabilities ---
    probabilities = model.predict_proba(final_features)
    
    # --- NEW: Get top 3 predictions ---
    # Get the indices that would sort the probabilities in descending order
    top_3_indices = np.argsort(probabilities[0])[-3:][::-1]
    
    # Get the class labels (crop names) corresponding to these indices
    top_3_crops = model.classes_[top_3_indices]
    
    # Return the list of the top 3 crops
    return jsonify({'predictions': top_3_crops.tolist()})

if __name__ == '__main__':
    app.run(port=5000, debug=True)