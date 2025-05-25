import Slider from '@react-native-community/slider';
import axios from 'axios';
import React, { useState } from 'react';
import {
  FlatList, Image,
  StyleSheet, Switch,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';


interface ChatItem {
  id: string;
  text: string;
}

const DoctorsPage: React.FC = () => {
  const [toeAngle, setToeAngle] = useState<number>(45);
  const [heelAngle, setHeelAngle] = useState<number>(45);
  const [temperatureOK, setTemperatureOK] = useState<boolean>(false);
  const [pulseOK, setPulseOK] = useState<boolean>(false);
  const [moodOK, setMoodOK] = useState<boolean>(false);
  const [painOK, setPainOK] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [lastSentAngle, setLastSentAngle] = useState<number | null>(null);
  const [lastSentMessage, setLastSentMessage] = useState<string>('');

  const sendToeAngleToBackend = async (angle: number) => {
    if (angle !== lastSentAngle) {
      try {
        await axios.post('https://map-production-8a33.up.railway.app/api/doctor-command', {
          //message: 'Toe adjustment',
          servoAngle: angle,
        });
        setLastSentAngle(angle); // Update the last sent angle
      } catch (error) {
        console.error('Error sending angle:', error);
      }
    }
  };
  

  const sendMessage = async () => {
    const trimmed = chatMessage.trim();
    if (trimmed !== '' && trimmed !== lastSentMessage) {
      const newMessage: ChatItem = {
        id: Date.now().toString(),
        text: trimmed,
      };
      setChatHistory(prevHistory => [...prevHistory, newMessage]);
  
      try {
        await axios.post('https://map-production-8a33.up.railway.app/api/doctor-command', {
          message: trimmed,
          //servoAngle: toeAngle, // optional
        });
        setLastSentMessage(trimmed); // Update the last sent message
      } catch (error) {
        console.error('Failed to send message', error);
      }
  
      setChatMessage('');
    }
  };
  

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <Text style={styles.chatMsg}>🗨️ {item.text}</Text>
  );

  
  return (
  <FlatList
    data={chatHistory}
    keyExtractor={(item) => item.id}
    renderItem={renderChatItem}
    ListHeaderComponent={
      <>
        <Image source={require('../../assets/afo.jpg')} style={styles.afoImage} resizeMode="contain" />

        <Text style={styles.header}>Doctor's Panel</Text>
        <Text style={styles.subHeader}>Foot Adjustments</Text>

        <Text style={styles.label}>Toe Angle: {toeAngle}°</Text>
        <Slider
          minimumValue={0}
          maximumValue={150}
          step={1}
          value={toeAngle}
          onValueChange={(value) => {
            setToeAngle(value);
            sendToeAngleToBackend(value);
          }}
          minimumTrackTintColor="#4CAF50"
          thumbTintColor="#00796B"
        />

        <Text style={styles.label}>Heel Angle: {heelAngle}°</Text>
        <Slider
          minimumValue={0}
          maximumValue={90}
          step={1}
          value={heelAngle}
          onValueChange={(value) => setHeelAngle(value)}
          minimumTrackTintColor="#2196F3"
          thumbTintColor="#00796B"
        />

        <Text style={styles.subHeader}>Check Points</Text>

        {[{ label: 'Temperature OK?', value: temperatureOK, setter: setTemperatureOK },
          { label: 'Pulse OK?', value: pulseOK, setter: setPulseOK },
          { label: 'Mood OK?', value: moodOK, setter: setMoodOK },
          { label: 'Pain OK?', value: painOK, setter: setPainOK }
        ].map(({ label, value, setter }) => (
          <View style={styles.switchRow} key={label}>
            <Text style={styles.label}>{label}</Text>
            <Switch
              value={value}
              onValueChange={setter}
              thumbColor={value ? '#4CAF50' : '#ccc'}
            />
          </View>
        ))}

        <Text style={styles.subHeader}>Doctor's Recommendation</Text>
        <TextInput
          placeholder="Type recommendation here..."
          style={styles.input}
          multiline
          value={recommendation}
          onChangeText={setRecommendation}
        />

        <Text style={styles.subHeader}>Doctor-Patient Chat</Text>
      </>
    }
    ListFooterComponent={
      <View style={styles.chatRow}>
        <TextInput
          placeholder="Type message..."
          style={styles.chatInput}
          value={chatMessage}
          onChangeText={setChatMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    }
    contentContainerStyle={styles.container}
  />
);

};

export default DoctorsPage;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  afoImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
  },
  chatList: {
    maxHeight: 150,
    marginVertical: 10,
  },
  chatMsg: {
    fontSize: 14,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#00796B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

