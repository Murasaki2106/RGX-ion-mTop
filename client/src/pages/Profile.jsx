import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Mail, Phone, MapPin, Calendar, Heart, Users, UserCheck } from 'lucide-react';
import './Profile.css';

function Profile({ userEmail }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:5000/api/profile?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => setData(data))
        .catch(console.error);
    }
  }, [userEmail]);

  if (!data) return <div className="loader">Loading...</div>;

  const { profile, totalCourses } = data;

  const avatarUrl = profile.avatar && profile.avatar.trim() !== '' 
      ? profile.avatar 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=3B82F6&color=fff&size=500`;

  return (
    <div className="profile-page">
      <header className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="text-muted">Your academic profile and personal information.</p>
        </div>
      </header>

      {/* Banner */}
      <div className="glass-card profile-banner">
        <img src={avatarUrl} alt="Profile" className="profile-avatar-lg" />
        <div className="banner-info">
          <h2>{profile.name}</h2>
          <p className="banner-dept">{profile.department}</p>
          <div className="banner-badges">
            <span className="badge-pill">{profile.regNumber}</span>
            {profile.role !== 'Professor' && (
              <>
                <span className="badge-pill green">{profile.semester}</span>
                <span className="badge-pill purple">{profile.section}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {/* Stats strip */}
      {profile.role !== 'Professor' && (
        <div className="profile-stats-strip">
          <div className="glass-card profile-stat-card">
            <div className="stat-value blue">{profile.cgpa}</div>
            <div className="stat-label">CGPA</div>
          </div>
          <div className="glass-card profile-stat-card">
            <div className="stat-value green">{profile.overallAttendance}%</div>
            <div className="stat-label">Attendance</div>
          </div>
          <div className="glass-card profile-stat-card">
            <div className="stat-value amber">{totalCourses}</div>
            <div className="stat-label">Courses</div>
          </div>
          <div className="glass-card profile-stat-card">
            <div className="stat-value purple">{profile.tasksPending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {/* Info sections */}
      <div className="profile-sections">
        <div className="glass-card profile-section">
          <h3><GraduationCap size={20} /> {profile.role === 'Professor' ? 'Professional Information' : 'Academic Information'}</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">{profile.role === 'Professor' ? 'Employee ID' : 'Registration No.'}</span>
              <span className="info-value">{profile.regNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{profile.department}</span>
            </div>
            {profile.role !== 'Professor' && (
              <>
                <div className="info-row">
                  <span className="info-label">Semester</span>
                  <span className="info-value">{profile.semester}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Section</span>
                  <span className="info-value">{profile.section}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Batch</span>
                  <span className="info-value">{profile.batch}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Faculty Advisor</span>
                  <span className="info-value">{profile.advisor}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="glass-card profile-section">
          <h3><Users size={20} /> Personal Information</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{profile.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{profile.dob}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Blood Group</span>
              <span className="info-value">{profile.bloodGroup}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Father's Name</span>
              <span className="info-value">{profile.fatherName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mother's Name</span>
              <span className="info-value">{profile.motherName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
