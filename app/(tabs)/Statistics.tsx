import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface SensorEntry {
  sensorType: string;
  sensorValue: number;
  timestamp: string;
}

type SensorData = {
  temperature: number[];
  Pulse: number[];
  FallStatus: number[];
  Latitude: number[];
  timestamps: string[];
};

const sanitizeData = (dataPoints: number[]): number[] => {
  return dataPoints.filter((value) => typeof value === 'number' && !isNaN(value));
};

const Statistics = () => {
  const [data, setData] = useState<SensorData>({
    temperature: [],
    Pulse: [],
    FallStatus: [],
    Latitude: [],
    timestamps: [],
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('https://map-production-8a33.up.railway.app/api/sensor-data');
      const backendData: SensorEntry[] = response.data.data;

      const temperature = backendData.filter(item => item.sensorType === 'Temperature').map(item => item.sensorValue);
      const Pulse = backendData.filter(item => item.sensorType === 'Pulse').map(item => item.sensorValue);
      const FallStatus = backendData.filter(item => item.sensorType === 'FallStatus').map(item => item.sensorValue);
      const Latitude = backendData.filter(item => item.sensorType === 'Latitude').map(item => item.sensorValue);

      // ✅ Convert timestamps to readable string
      const timestamps = backendData.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleTimeString(); // e.g., "14:22:30"
      });

      setData({ temperature, Pulse, FallStatus, Latitude, timestamps });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(34, 94, 168, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 1,
    propsForLabels: {
      fontSize: 12,
      paddingTop: 4,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: '#225EA8',
    },
  };

  const renderGraph = (label: string, dataPoints: number[]): JSX.Element => {
    const sanitizedDataPoints = sanitizeData(dataPoints);

    if (sanitizedDataPoints.length === 0) {
      return (
        <View style={styles.chartCard}>
          <Text style={styles.chartLabel}>{label}</Text>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      );
    }

    const chartWidth = Math.max(Dimensions.get('window').width, sanitizedDataPoints.length * 50);
    const labels = data.timestamps.slice(0, sanitizedDataPoints.length).reverse();

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartLabel}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: sanitizedDataPoints.reverse() }],
            }}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
            formatXLabel={((label: string, index: number) => index % 3 === 0 ? label : '') as unknown as (xValue: string) => string}
            verticalLabelRotation={45}
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Health Synopsis</Text>
      {renderGraph('🌡 Temperature (°C)', data.temperature)}
      {renderGraph('💓 Pulse (bpm)', data.Pulse)}
      {renderGraph('🚨 Fall Status', data.FallStatus)}
      {renderGraph('📍 Latitude', data.Latitude)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 20,
    textAlign: 'center',
    color: '#225EA8',
  },
  chartCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  chartStyle: {
    marginRight: 10,
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default Statistics;



// // export default Statistics;
// import React from 'react';
// import { Text, View } from 'react-native';

// export default function Statistics() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Statistics Page</Text>
//     </View>
//   );
// }

// import { View, Text } from 'react-native';

// export default function Statistics() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Statistics Page</Text>
//     </View>
//   );
// }
