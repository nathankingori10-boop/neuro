// import React, { useEffect, useState } from 'react';
// import { Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import 'react-native-reanimated';
// import { LineChart } from 'react-native-svg-charts';

// globalThis.global = globalThis;


// export default function index() {

//   const [sensorData, setSensorData] = useState({
//     temperature: null,
//     heartbeat: null,
//     fallen: false,
//     latitude: null,
//     longitude: null,
//   });

//   const [heartbeatHistory, setHeartbeatHistory] = useState([]);

//   useEffect(() => {
//     const requestPermissions = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//         );
//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           console.warn('Location permission denied');
//         }
//       }
//     };

//     const fetchSensorData = async () => {
//       try {
//         const response = await fetch('https://map-production-8a33.up.railway.app/api/sensor-data');
    
//         if (!response.ok) {
//           throw new Error(`Server responded with status ${response.status}`);
//         }
    
//         const result = await response.json();
        
//         if (!result.data || !Array.isArray(result.data)) {
//           throw new Error('Invalid data format received from backend');
//         }
    
//         // 💥 Create a fresh new object directly (NO spreading old state)
//         let updatedSensorData = {
//           temperature: null,
//           heartbeat: null,
//           fallen: false,
//           latitude: null,
//           longitude: null,
//         };
    
//         result.data.forEach(sensor => {
//           switch (sensor.sensorType) {
//             case 'Temperature':
//               updatedSensorData.temperature = parseFloat(sensor.sensorValue) || 0;
//               break;
//             case 'Pulse':
//               updatedSensorData.heartbeat = parseInt(sensor.sensorValue) || 0;
//               break;
//             case 'FallStatus':
//               if (typeof sensor.sensorValue === 'string') {
//                 updatedSensorData.fallen = sensor.sensorValue === '1' || sensor.sensorValue.toLowerCase() === 'fallen';
//               } else if (typeof sensor.sensorValue === 'number') {
//                 updatedSensorData.fallen = sensor.sensorValue === 1;
//               } else {
//                 updatedSensorData.fallen = false;
//               }
//               break;
//             case 'Latitude':
//               updatedSensorData.latitude = parseFloat(sensor.sensorValue) || 0;
//               break;
//             case 'Longitude':
//               updatedSensorData.longitude = parseFloat(sensor.sensorValue) || 0;
//               break;
//             default:
//               break;
//           }
//         });
    
//         setSensorData(updatedSensorData);

//         if (updatedSensorData.heartbeat !== null) {
//           setHeartbeatHistory(prevHistory => [...prevHistory.slice(-6), updatedSensorData.heartbeat]);
//         }

//       } catch (error) {
//         console.error('Error fetching sensor data:', error.message);
//       }
//     };

//     requestPermissions();
//     fetchSensorData();
//     const interval = setInterval(fetchSensorData, 2000); // Fetch every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       {/* Temperature & Pulse */}
//       <View style={styles.cardRow}>
//         <View style={styles.card}>
//           <Text style={styles.tempTitle}>Temperature</Text>
//           <Text style={styles.tempValue}>
//             {sensorData.temperature !== null ? `${sensorData.temperature}°C` : 'Loading...'}
//           </Text>
//         </View>
//         <View style={styles.card}>
//           <Text style={styles.pulseTitle}>Pulse</Text>
//           <Text style={styles.cardValue}>
//             {sensorData.heartbeat !== null ? `${sensorData.heartbeat} bpm` : 'Loading...'}
//           </Text>
//           <LineChart
//             style={styles.chart}
//             data={heartbeatHistory.length > 0 ? heartbeatHistory : [0]}
//             svg={{ stroke: '#E91E63', strokeWidth: 2 }}
//             contentInset={{ top: 10, bottom: 10 }}
//           />
//         </View>
//       </View>

//       {/* Posture */}
//       <View style={styles.statusCard}>
//         <Text style={styles.cardTitle}>Posture Status</Text>
//         <Image
//           source={sensorData.fallen ? require('../../assets/images/fallen.jpg') : require('../../assets/images/upright.jpg')}
//           style={styles.fallImage}
//           resizeMode="contain"
//         />
//         <Text style={[styles.cardValue, { color: sensorData.fallen ? '#D32F2F' : '#388E3C' }]}>
//           {sensorData.fallen ? 'Fallen' : 'Upright'}
//         </Text>
//       </View>

//       {/* Map */}
//       <View style={styles.mapCard}>
//         <Text style={styles.cardTitle}>Patient Location</Text>
//         {sensorData.latitude !== null && sensorData.longitude !== null ? (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: sensorData.latitude,
//               longitude: sensorData.longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }}
//           >
//             <Marker
//               coordinate={{
//                 latitude: sensorData.latitude,
//                 longitude: sensorData.longitude,
//               }}
//               title="Current Location"
//             />
//           </MapView>
//         ) : (
//           <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading map...</Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// }


// // (styles remain exactly as you posted them)


// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#f0f2f5', // Softer overall background
//     padding: 16,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   card: {
//     flex: 1,
//     backgroundColor: '#e0f7fa', // Light aqua background for cards
//     marginHorizontal: 5,
//     borderRadius: 20,
//     padding: 3,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   tempTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#d32f2f',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   tempValue: {
//     fontSize: 44,
//     color: '#388e3c',
//     textAlign: 'center',
//     fontWeight: '700',
//   },
//   pulseTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#3949ab',
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   cardTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   cardValue: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#555',
//   },
//   chart: {
//     height: 70,
//     marginTop: 7,
//   },
//   statusCard: {
//     backgroundColor: '#ffe0b2', // Warm orange background
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 15,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   fallImage: {
//     height: 150,
//     width: 150,
//     marginVertical: 3,
//     borderRadius: 3,
//   },
//   mapCard: {
//     backgroundColor: '#d1c4e9', // Soft purple background
//     borderRadius: 20,
//     overflow: 'hidden',
//     height: 300,
//     marginBottom: 10,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   map: {
//     flex: 1,
//   },
// });
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function IndexScreen() {
  const [temperature, setTemperature] = useState('--');
  const [bpm, setBpm] = useState('--');
  const [fallStatus, setFallStatus] = useState('Unknown');
  const [location, setLocation] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
  });

  useEffect(() => {
    const fetchData = () => {
      fetch('https://map-production-8a33.up.railway.app/api/sensor-data')
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
        <MapView
          style={styles.map}
          region={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
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

