from flask import Flask, request, jsonify
import pandas as pd
import mysql.connector
from sklearn.linear_model import LinearRegression
import numpy as np

app = Flask(__name__)

# Connect to MySQL database
def get_database_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='magicD53@',  # Replace with your actual password
        database='crop_monitoring'
    )

# Machine Learning Endpoint
@app.route('/predict', methods=['GET'])
def predict():
    # Connect to the database
    conn = get_database_connection()
    cursor = conn.cursor()

    # Fetch the sensor readings
    query = """
    SELECT sr.timestamp, sr.value, s.sensor_type
    FROM sensor_readings sr
    JOIN sensors s ON sr.sensor_id = s.id
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    # Close the connection
    cursor.close()
    conn.close()

    # Process the data into a DataFrame
    df = pd.DataFrame(rows, columns=['timestamp', 'value', 'sensor_type'])

    # Prepare predictions for each sensor type
    predictions = {}
    for sensor_type in df['sensor_type'].unique():
        sensor_data = df[df['sensor_type'] == sensor_type]
        sensor_data['timestamp'] = pd.to_datetime(sensor_data['timestamp']).view(int) // 10**9
        X = np.array(sensor_data['timestamp']).reshape(-1, 1)
        y = sensor_data['value']

        # Fit a simple linear regression model
        if len(X) > 1:
            model = LinearRegression()
            model.fit(X, y)
            future_time = np.array([[X[-1][0] + 3600]])  # Predict for 1 hour into the future
            predicted_value = model.predict(future_time)[0]
            predictions[sensor_type] = predicted_value
        else:
            predictions[sensor_type] = 'Not enough data'

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(port=5001)
