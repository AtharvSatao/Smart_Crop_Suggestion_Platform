# Import necessary libraries
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Step 1: Load the dataset
# THIS IS THE CORRECTED LINE: We've added delimiter='\t'
df = pd.read_csv('crop_data.csv', delimiter='\t')

# Step 2: Prepare the data
X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']] # Features
y = df['label'] # Target

# Step 3: Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 4: Initialize and train the RandomForestClassifier model
print("Training the crop suggestion model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Model training complete.")

# Step 5: Make predictions and evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Step 6: Save the trained model to a file
joblib.dump(model, 'crop_model.pkl')
print("Model saved successfully as 'crop_model.pkl'")