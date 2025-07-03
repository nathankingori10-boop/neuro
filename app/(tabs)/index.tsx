
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { UrlTile } from 'react-native-maps';


export default function IndexScreen() {
  const [temperature, setTemperature] = useState('--');
  const [bpm, setBpm] = useState('--');
  const [fallStatus, setFallStatus] = useState('Unknown');
  const [location, setLocation] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
  });
//   useEffect(() => {
//   const fetchData = async () => {
//     // Request location permission
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       console.warn('Permission to access location was denied');
//       return;
//     }

//     // Optionally get device's real-time location
//     let currentLocation = await Location.getCurrentPositionAsync({});
//     setLocation({
//       latitude: currentLocation.coords.latitude,
//       longitude: currentLocation.coords.longitude,
//     });

//     // Fetch sensor data
//     try {
//       const res = await fetch('https://map-production-8a33.up.railway.app/api/sensor-data');
//       const json = await res.json();
//       const data = json.data;
//       const latestValues: { [key: string]: any } = {};

//       for (let entry of data) {
//         const type = entry.sensorType;
//         if (!latestValues[type]) {
//           latestValues[type] = entry.sensorValue;
//         }
//       }

//       if (latestValues.Temperature !== undefined) {
//         setTemperature(`${latestValues.Temperature}°C`);
//       }
//       if (latestValues.Pulse !== undefined) {
//         setBpm(`${latestValues.Pulse}`);
//       }
//       if (latestValues.FallStatus !== undefined) {
//         setFallStatus(latestValues.FallStatus === 1 ? 'Fallen' : 'Normal');
//       }
//       if (
//         latestValues.Latitude !== undefined &&
//         latestValues.Longitude !== undefined
//       ) {
//         setLocation({
//           latitude: latestValues.Latitude,
//           longitude: latestValues.Longitude,
//         });
//       }
//     } catch (err) {
//       console.error('Error fetching sensor data:', err);
//     }
//   };

//   fetchData();
//   const interval = setInterval(fetchData, 5000);
//   return () => clearInterval(interval);
// }, []);


  useEffect(() => {
    const fetchData = () => {
      fetch('https://neurostep-production.up.railway.app/api/sensor-data')
        .then(res => res.json())
        .then(json => {
          const data = json.data;
          const latestValues: { [key: string]: any } = {};
          for (let entry of data) {
            const type = entry.sensorType;
            if (!latestValues[type]) {
              latestValues[type] = entry.sensorValue;
            }
          }

          if (latestValues.Temperature !== undefined) {
            setTemperature(`${latestValues.Temperature}°C`);
          }
          if (latestValues.Pulse !== undefined) {
            setBpm(`${latestValues.Pulse}`);
          }
          if (latestValues.FallStatus !== undefined) {
            setFallStatus(latestValues.FallStatus === 1 ? 'Fallen' : 'Normal');
          }
          if (
            latestValues.Latitude !== undefined &&
            latestValues.Longitude !== undefined
          ) {
            setLocation({
              latitude: latestValues.Latitude,
              longitude: latestValues.Longitude,
            });
          }
        })
        .catch(err => console.error('Error fetching sensor data:', err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Cards */}
      <View style={styles.topRow}>
        <View style={styles.card}>
          <Text style={styles.tempTitle}>Temperature</Text>
          <Text style={styles.tempValue}>{temperature}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bpmTitle}>BPM</Text>
          <Text style={styles.bpmValue}>{bpm}</Text>
        </View>
      </View>

      {/* Posture Card */}
      <View style={styles.statusCard}>
        <Text style={styles.postureTitle}>🧍 Posture Status</Text>
        <Image
          source={
            fallStatus === 'Fallen'
              ? require('../../assets/fallen.jpg')
              : require('../../assets/upright.jpg')
          }
          style={styles.fallImage}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.postureValue,
            { color: fallStatus === 'Fallen' ? '#D32F2F' : '#388E3C' },
          ]}
        >
          {fallStatus}
        </Text>
      </View>

      {/* Map Section */}
      <Text style={styles.mapTitle}> Patient's Location 📍</Text>
      
      <View style={styles.mapContainer}>
        {/* <MapView
          style={styles.map}
          region={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="Patient Location" />
        </MapView> */}
        <MapView
  style={styles.map}
  region={{
    ...location,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
  
>
  <UrlTile
    urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
  />
  <Marker coordinate={location} title="Patient Location" />
</MapView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#f0f4f8',
    padding: 28,
    borderRadius: 20,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  tempTitle: {
    fontSize: 16,
    color: 'green',
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tempValue: {
    fontSize: 28,
    color: 'red',
    fontWeight: 'bold',
  },
  bpmTitle: {
    fontSize: 16,
    color: 'blue',
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  bpmValue: {
    fontSize: 28,
    color: 'purple',
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fef7e0',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  postureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  postureValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  fallImage: {
    width: 160,
    height: 110,
    marginVertical: 1,
  },
  mapTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  fontFamily: 'serif',
  textAlign: 'center',
  color: '#1E3A8A', // navy blue for more dominance
  marginTop: 10,
  marginBottom: 0,
},

  mapContainer: {
  height: 320,
  marginHorizontal: 10,
  marginBottom: 10,
  marginTop: 10,
  borderRadius: 10,
  overflow: 'hidden',
  elevation: 20,
},
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

