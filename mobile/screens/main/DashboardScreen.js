import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';

const API_URL = 'http://192.168.x.x:5000';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadUserData();
    loadStats();
    connectSocket();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/attendance/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io(`${API_URL}/attendance`, {
        auth: { token },
      });

      newSocket.on('attendance-update', () => {
        loadStats();
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userId}>ID: {user?.uniqueId}</Text>
        </View>
        <Icon name="person-circle" size={60} color="#007bff" />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
            <Icon name="arrow-down-outline" size={24} color="#007bff" />
          </View>
          <Text style={styles.statValue}>{stats?.todaysCheckIns || 0}</Text>
          <Text style={styles.statLabel}>Check-ins Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#f0f4c3' }]}>
            <Icon name="checkmark-circle-outline" size={24} color="#ffc107" />
          </View>
          <Text style={styles.statValue}>{stats?.currentlyCheckedIn || 0}</Text>
          <Text style={styles.statLabel}>Currently Checked In</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#e8f5e9' }]}>
            <Icon name="checkmark-done-outline" size={24} color="#28a745" />
          </View>
          <Text style={styles.statValue}>{stats?.totalAttendanceToday || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#fce4ec' }]}>
            <Icon name="time-outline" size={24} color="#e91e63" />
          </View>
          <Text style={styles.statValue}>{stats?.averageDuration || 0}m</Text>
          <Text style={styles.statLabel}>Avg Duration</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.checkInButton]}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Icon name="arrow-down-circle" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Check In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.checkOutButton]}
            onPress={async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.post(
                  `${API_URL}/api/attendance/check-out`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                Alert.alert('Success', `Check-out successful! Duration: ${response.data.data.totalDuration}`);
                loadStats();
              } catch (error) {
                Alert.alert('Error', error.response?.data?.message || 'Check-out failed');
              }
            }}
          >
            <Icon name="arrow-up-circle" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Check Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.historyButton]}
            onPress={() => navigation.navigate('History')}
          >
            <Icon name="list" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color="#17a2b8" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Attendance Tip</Text>
            <Text style={styles.infoText}>
              Always verify your OTP carefully before checking in. You have a maximum of 3 attempts.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#e8f4f8',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  userId: {
    fontSize: 12,
    color: '#b3d9ff',
    marginTop: 5,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#28a745',
  },
  checkOutButton: {
    backgroundColor: '#dc3545',
  },
  historyButton: {
    backgroundColor: '#17a2b8',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    gap: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    lineHeight: 18,
  },
});

export default DashboardScreen;
