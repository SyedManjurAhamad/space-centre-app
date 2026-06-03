import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Picker,
  TextInput,
  Modal,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';

const API_URL = 'http://192.168.x.x:5000';

const CheckInScreen = () => {
  const [location, setLocation] = useState('');
  const [otp, setOtp] = useState('');
  const [attendanceId, setAttendanceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('location'); // 'location' or 'otp'
  const [socket, setSocket] = useState(null);

  const locations = [
    { label: 'Main Gate', value: 'main-gate' },
    { label: 'Lab 1', value: 'lab-1' },
    { label: 'Lab 2', value: 'lab-2' },
    { label: 'Library', value: 'library' },
    { label: 'Cafeteria', value: 'cafeteria' },
    { label: 'Auditorium', value: 'auditorium' },
  ];

  useEffect(() => {
    connectSocket();
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const connectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io(`${API_URL}/attendance`, {
        auth: { token },
      });
      setSocket(newSocket);
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/attendance/check-in`,
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendanceId(response.data.data.attendanceId);
      setStep('otp');
      Alert.alert('Success', 'OTP has been sent. Please verify to complete check-in.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/attendance/verify-check-in`,
        { attendanceId, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', '✓ Check-in verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setStep('location');
            setLocation('');
            setOtp('');
            setAttendanceId('');
            socket?.emit('user-checked-in', {
              firstName: 'User',
              lastName: 'Name',
              location,
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {step === 'location' ? (
        <View style={styles.content}>
          <View style={styles.header}>
            <Icon name="location-outline" size={60} color="#007bff" />
            <Text style={styles.title}>Select Location</Text>
            <Text style={styles.subtitle}>Choose where you want to check in</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={location}
                onValueChange={(value) => setLocation(value)}
                enabled={!loading}
              >
                <Picker.Item label="-- Select Location --" value="" />
                {locations.map((loc) => (
                  <Picker.Item key={loc.value} label={loc.label} value={loc.value} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.checkInButton, loading && styles.buttonDisabled]}
              onPress={handleCheckIn}
              disabled={loading || !location}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Icon name="arrow-down-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Check In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <Icon name="shield-checkmark" size={60} color="#28a745" />
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to your email/phone</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>6-Digit OTP</Text>
            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
                editable={!loading}
                placeholderTextColor="#ccc"
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Verify OTP</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setStep('location');
                setOtp('');
              }}
              disabled={loading}
            >
              <Icon name="arrow-back-outline" size={20} color="#007bff" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 25,
    overflow: 'hidden',
  },
  otpInputContainer: {
    marginBottom: 25,
  },
  otpInput: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#28a745',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 15,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#007bff',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CheckInScreen;
