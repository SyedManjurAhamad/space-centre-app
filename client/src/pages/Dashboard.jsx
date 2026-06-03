import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('main');
  const [location, setLocation] = useState('');
  const [attendanceId, setAttendanceId] = useState('');
  const [otp, setOtp] = useState('');
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const locations = [
    'main-gate',
    'lab-1',
    'lab-2',
    'library',
    'cafeteria',
    'auditorium',
  ];

  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    setUser(userData);
    fetchStats();
    fetchHistory();

    // Initialize Socket.io for real-time updates
    const newSocket = io('http://localhost:5000/attendance', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    newSocket.on('attendance-update', (data) => {
      console.log('Attendance update:', data);
      fetchStats(); // Refresh stats on any attendance update
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/attendance/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/attendance/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data.data.records);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      setMessage('Please select a location');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/attendance/check-in',
        { location },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAttendanceId(response.data.data.attendanceId);
      setMessage(`Check-in initiated. OTP has been sent to your ${
        user.email
      } email/phone. Enter it to confirm.`);
      setCurrentStep('otp-verification');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        '/api/attendance/verify-check-in',
        { attendanceId, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✓ Check-in verified successfully!');
      setCurrentStep('main');
      setOtp('');
      setLocation('');

      // Emit socket event
      socket?.emit('user-checked-in', {
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1],
        location,
      });

      setTimeout(() => fetchHistory(), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/attendance/check-out',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(
        `✓ Check-out successful! Duration: ${response.data.data.totalDuration}`
      );
      setCurrentStep('main');

      // Emit socket event
      socket?.emit('user-checked-out', {
        location,
        duration: response.data.data.duration,
      });

      setTimeout(() => {
        fetchStats();
        fetchHistory();
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Space Centre Attendance</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <span className="unique-id">ID: {user.uniqueId}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="stats-panel">
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.todaysCheckIns}</div>
                <div className="stat-label">Check-ins Today</div>
              </div>
              <div className="stat-card highlight">
                <div className="stat-value">{stats.currentlyCheckedIn}</div>
                <div className="stat-label">Currently Checked In</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalAttendanceToday}</div>
                <div className="stat-label">Completed Today</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.averageDuration}m</div>
                <div className="stat-label">Avg Duration</div>
              </div>
            </div>
          )}
        </div>

        {currentStep === 'main' && (
          <div className="main-controls">
            <div className="controls-grid">
              <div className="control-section">
                <h2>Check In</h2>
                <div className="location-selector">
                  <label>Select Location:</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="">-- Choose Location --</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc.replace('-', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={loading || !location}
                  className="btn-check-in"
                >
                  {loading ? 'Processing...' : 'Check In'}
                </button>
              </div>

              <div className="control-section">
                <h2>Check Out</h2>
                <p>End your session and log the duration</p>
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="btn-check-out"
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'otp-verification' && (
          <div className="otp-verification">
            <h2>OTP Verification</h2>
            <p>Enter the 6-digit OTP sent to confirm your check-in</p>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="otp-input-large"
            />
            <div className="otp-buttons">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="btn-primary"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={() => {
                  setCurrentStep('main');
                  setOtp('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="history-section">
          <h2>Recent Attendance</h2>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((record) => (
                  <tr key={record._id}>
                    <td>
                      {new Date(record.checkInTime).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(record.checkInTime).toLocaleTimeString()}
                    </td>
                    <td>
                      {record.checkOutTime
                        ? new Date(record.checkOutTime).toLocaleTimeString()
                        : '-'}
                    </td>
                    <td>
                      {record.duration
                        ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m`
                        : '-'}
                    </td>
                    <td>{record.location.toUpperCase()}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
