import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Notification {
  message: string;
  type: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('https://map-production-8a33.up.railway.app/api/notifications')
      .then((response) => response.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <View key={index} style={styles.notificationCard}>
            <Text style={styles.message}>{notification.message}</Text>
            <Text style={styles.type}>{notification.type}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noNotifications}>No new notifications</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  notificationCard: {
    marginBottom: 15,
    padding: 20,
    backgroundColor: '#ffeaea', // light soft red background
    borderRadius: 10,
    borderColor: '#ff4d4d', // slightly bright border
    borderWidth: 1,
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000', // dark red for important messages
    marginBottom: 5,
  },
  type: {
    fontSize: 16,
    color: '#660000', // deeper red for type
  },
  noNotifications: {
    fontSize: 20,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default Notifications;
