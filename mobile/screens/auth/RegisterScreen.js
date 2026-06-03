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
  Picker,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'http://192.168.x.x:5000';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: 'student',
    department: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    staffId: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const departments = [
    'Space Science',
    'Astrophysics',
    'Engineering',
    'Administration',
    'IT',
  ];

  const handleRegister = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.userType === 'student' && !formData.rollNumber) {
      Alert.alert('Error', 'Roll number required for students');
      return;
    }

    if (formData.userType === 'staff' && !formData.staffId) {
      Alert.alert('Error', 'Staff ID required for staff');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType,
        department: formData.department,
        password: formData.password,
        rollNumber: formData.rollNumber,
        staffId: formData.staffId,
      });

      Alert.alert(
        'Success',
        `Registration successful!\nYour unique ID: ${response.data.data.uniqueId}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Icon name="person-add" size={60} color="#007bff" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Space Centre</Text>
      </View>

      <View style={styles.formSection}>
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              editable={!loading}
            />
          </View>
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              editable={!loading}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* User Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>User Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.userType}
              onValueChange={(value) => setFormData({ ...formData, userType: value })}
              enabled={!loading}
            >
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Staff" value="staff" />
            </Picker>
          </View>
        </View>

        {/* Department */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              enabled={!loading}
            >
              <Picker.Item label="Select Department" value="" />
              {departments.map((dept) => (
                <Picker.Item key={dept} label={dept} value={dept} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Roll Number (Students only) */}
        {formData.userType === 'student' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll Number</Text>
            <View style={styles.inputContainer}>
              <Icon name="document-outline" size={18} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Roll number"
                value={formData.rollNumber}
                onChangeText={(text) => setFormData({ ...formData, rollNumber: text })}
                editable={!loading}
              />
            </View>
          </View>
        )}

        {/* Staff ID (Staff only) */}
        {formData.userType === 'staff' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Staff ID</Text>
            <View style={styles.inputContainer}>
              <Icon name="id-card-outline" size={18} color="#999" />
              <TextInput
                style={styles.input}
                placeholder="Staff ID"
                value={formData.staffId}
                onChangeText={(text) => setFormData({ ...formData, staffId: text })}
                editable={!loading}
              />
            </View>
          </View>
        )}

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Icon name="checkmark-done-outline" size={20} color="#fff" />
              <Text style={styles.registerButtonText}>Register</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#666',
  },
  loginLink: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
