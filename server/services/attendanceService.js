const Attendance = require('../models/Attendance');
const User = require('../models/User');
const OTPLog = require('../models/OTPLog');
const crypto = require('crypto');

class AttendanceService {
  /**
   * Check-in user
   */
  async checkIn(userId, location, verificationMethod = 'otp', ipAddress) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if already checked in
      const existingCheckIn = await Attendance.findOne({
        userId,
        status: { $in: ['checked-in'] },
      });

      if (existingCheckIn) {
        return { 
          success: false, 
          message: 'Already checked in. Please check out first.' 
        };
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Create attendance record
      const attendance = new Attendance({
        userId,
        uniqueId: user.uniqueId,
        checkInTime: new Date(),
        location,
        otp,
        verificationMethod,
        deviceInfo: {
          userAgent: 'browser',
          ipAddress,
        },
      });

      await attendance.save();

      // Update user's last login
      user.lastLogin = new Date();
      await user.save();

      return {
        success: true,
        message: 'Check-in successful',
        data: {
          attendanceId: attendance._id,
          checkInTime: attendance.checkInTime,
          location,
        },
      };
    } catch (error) {
      console.error('Check-in Error:', error);
      return { success: false, message: 'Check-in failed' };
    }
  }

  /**
   * Verify OTP and confirm check-in
   */
  async verifyCheckIn(attendanceId, otp) {
    try {
      const attendance = await Attendance.findById(attendanceId);
      if (!attendance) {
        return { success: false, message: 'Attendance record not found' };
      }

      // Verify OTP
      if (attendance.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      // Mark as verified
      attendance.otpVerified = true;
      await attendance.save();

      return {
        success: true,
        message: 'Check-in verified successfully',
        data: attendance,
      };
    } catch (error) {
      console.error('OTP Verification Error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  /**
   * Check-out user
   */
  async checkOut(userId) {
    try {
      const attendance = await Attendance.findOne({
        userId,
        status: 'checked-in',
      });

      if (!attendance) {
        return { success: false, message: 'No active check-in found' };
      }

      // Calculate duration
      const checkOutTime = new Date();
      const durationMs = checkOutTime - attendance.checkInTime;
      const duration = Math.round(durationMs / 60000); // Convert to minutes

      attendance.checkOutTime = checkOutTime;
      attendance.duration = duration;
      attendance.status = 'completed';

      await attendance.save();

      return {
        success: true,
        message: 'Check-out successful',
        data: {
          checkOutTime,
          duration,
          totalDuration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        },
      };
    } catch (error) {
      console.error('Check-out Error:', error);
      return { success: false, message: 'Check-out failed' };
    }
  }

  /**
   * Get user's attendance history
   */
  async getAttendanceHistory(userId, limit = 30, skip = 0) {
    try {
      const attendance = await Attendance.find({ userId })
        .sort({ checkInTime: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Attendance.countDocuments({ userId });

      return {
        success: true,
        data: {
          records: attendance,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('History Error:', error);
      return { success: false, message: 'Failed to fetch history' };
    }
  }

  /**
   * Get real-time dashboard stats
   */
  async getDashboardStats(location = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const query = location ? { location } : {};

      // Today's check-ins
      const todaysCheckIns = await Attendance.countDocuments({
        ...query,
        checkInTime: { $gte: today },
      });

      // Currently checked in
      const currentlyCheckedIn = await Attendance.countDocuments({
        ...query,
        status: 'checked-in',
      });

      // Total attendance today
      const totalAttendanceToday = await Attendance.countDocuments({
        ...query,
        status: 'completed',
        checkInTime: { $gte: today },
      });

      // Average duration
      const avgDurationResult = await Attendance.aggregate([
        {
          $match: {
            ...query,
            status: 'completed',
            checkInTime: { $gte: today },
            duration: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
          },
        },
      ]);

      const avgDuration = avgDurationResult[0]?.avgDuration || 0;

      return {
        success: true,
        data: {
          todaysCheckIns,
          currentlyCheckedIn,
          totalAttendanceToday,
          averageDuration: Math.round(avgDuration),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      return { success: false, message: 'Failed to fetch stats' };
    }
  }

  /**
   * Get attendance for a specific date range
   */
  async getAttendanceReport(startDate, endDate, userType = null) {
    try {
      const query = {
        checkInTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: 'completed',
      };

      if (userType) {
        const users = await User.find({ userType }).select('_id');
        const userIds = users.map((u) => u._id);
        query.userId = { $in: userIds };
      }

      const report = await Attendance.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$userId',
            totalDays: { $sum: 1 },
            totalMinutes: { $sum: '$duration' },
            avgDuration: { $avg: '$duration' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
      ]);

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      console.error('Report Error:', error);
      return { success: false, message: 'Failed to generate report' };
    }
  }
}

module.exports = new AttendanceService();
