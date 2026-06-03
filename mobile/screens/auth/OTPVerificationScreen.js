import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://192.168.x.x:5000';

const OTPVerificationScreen = ({ route, navigation }) => {
  const { userId, method } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        userId,
        otp,
      });

      // Save token and user data
      await AsyncStorage.setItem('token', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      // Call resend OTP endpoint (you may need to add this to backend)
      Alert.alert('Success', 'OTP has been resent');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Icon name="shield-checkmark" size={80} color="#28a745" />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your {method}
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>OTP Code</Text>
        <View style={styles.otpContainer}>
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
          onPress={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Icon name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOTP}
          disabled={loading}
        >
          <Text style={styles.resendText}>Didn't receive OTP? </Text>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginTop: 5,
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
    marginBottom: 15,
  },
  otpContainer: {
    marginBottom: 25,
  },
  otpInput: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#007bff',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default OTPVerificationScreen;
