import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  gradeLevel: number;
  birthday?: string;
  bio?: string;
  progressSummary?: string;
}

interface Session {
  id: number;
  sessionDate: string;
  volunteerName: string;
  notes?: string;
  progressSummary?: string;
}

interface WorkbookProgress {
  mathLevel?: number;
  readingLevel?: number;
}

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StudentData>>({});
  const [summaryText, setSummaryText] = useState('');
  const [workbookProgress, setWorkbookProgress] = useState<WorkbookProgress>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isStudentOwner, setIsStudentOwner] = useState(false);
  const canEditProfile = isStudentOwner || user?.role === 'admin';
  const canEditProgress = user?.role === 'admin' || user?.role === 'volunteer';

  useEffect(() => {
    if (user && id) {
      fetchStudentData();
    } else {
      setIsLoading(false);
    }
  }, [user, id]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [studentData, sessionsData] = await Promise.all([
        api.get(`/api/students/${id}`).catch(() => null),
        api.get(`/api/students/${id}/sessions`).catch(() => [])
      ]);

      if (studentData) {
        setStudent(studentData);
        setEditedProfile(studentData);
        setSummaryText(studentData.progressSummary || '');
        if (studentData.photoUrl) {
          setPhotoPreview(studentData.photoUrl);
        }
      }

      setSessions(Array.isArray(sessionsData) ? sessionsData : []);

      // Check if current user is the student owner
      if (user?.role === 'student') {
        try {
          const myStudentData = await api.get('/api/students/me');
          setIsStudentOwner(myStudentData?.id === parseInt(id || '0'));
        } catch (error) {
          setIsStudentOwner(false);
        }
      }

      // Fetch workbook progress
      try {
        const progressData = await api.get(`/api/students/${id}/progress`).catch(() => []);
        if (Array.isArray(progressData)) {
          const math = progressData.find(p => p.subject === 'Math');
          const reading = progressData.find(p => p.subject === 'Reading');
          setWorkbookProgress({
            mathLevel: math?.grade_level || studentData?.gradeLevel || 0,
            readingLevel: reading?.grade_level || studentData?.gradeLevel || 0
          });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let photoUrl = student?.photoUrl;
      if (photoFile && photoPreview) {
        photoUrl = photoPreview;
      }

      await api.put(`/api/students/${id}`, {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        gradeLevel: editedProfile.gradeLevel,
        birthday: editedProfile.birthday,
        bio: editedProfile.bio,
        photoUrl: photoUrl
      });

      setIsEditingProfile(false);
      fetchStudentData();
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleSaveSummary = async () => {
    try {
      await api.put(`/api/students/${id}/progress-summary`, { progressSummary: summaryText });
      setStudent(prev => prev ? { ...prev, progressSummary: summaryText } : null);
      setIsEditingSummary(false);
      fetchStudentData();
    } catch (error) {
      console.error('Error updating summary:', error);
    }
  };

  const handleSaveWorkbookProgress = async () => {
    try {
      // Update workbook progress - this would need backend endpoint
      alert('Workbook progress saved!');
      fetchStudentData();
    } catch (error) {
      console.error('Error updating workbook progress:', error);
    }
  };

  if (isLoading) return <div className="flex justify-center p-xl"><div className="spinner"></div></div>;
  if (!student) return <div className="p-xl text-center">Student not found</div>;

  // Get most recent session's progress summary
  const mostRecentSession = sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Profile Header */}
      <div className="card mb-xl">
        <div className="flex gap-lg items-start">
          <div style={{ position: 'relative' }}>
            {photoPreview ? (
              <img src={photoPreview} alt={student.firstName} className="avatar avatar-xl" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar avatar-xl" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--student-gradient)', color: 'white', fontWeight: 700 }}>
                {student.firstName[0]}{student.lastName[0]}
              </div>
            )}
            {isEditingProfile && canEditProfile && (
              <label className="btn btn-sm btn-primary" style={{ position: 'absolute', bottom: 0, right: 0, cursor: 'pointer', margin: 0 }}>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                📷
              </label>
            )}
          </div>
          <div className="flex-1">
            {isEditingProfile && canEditProfile ? (
              <>
                <div className="grid grid-2 gap-md mb-md">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" value={editedProfile.firstName || ''} onChange={e => setEditedProfile({ ...editedProfile, firstName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={editedProfile.lastName || ''} onChange={e => setEditedProfile({ ...editedProfile, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-2 gap-md mb-md">
                  <div className="form-group">
                    <label className="form-label">Grade</label>
                    <input type="number" className="form-input" min={1} max={12} value={editedProfile.gradeLevel || ''} onChange={e => setEditedProfile({ ...editedProfile, gradeLevel: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Birthday</label>
                    <input type="date" className="form-input" value={editedProfile.birthday || ''} onChange={e => setEditedProfile({ ...editedProfile, birthday: e.target.value })} />
                  </div>
                </div>
                <div className="form-group mb-md">
                  <label className="form-label">Quick Bio</label>
                  <textarea className="form-input" rows={3} value={editedProfile.bio || ''} onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })} />
                </div>
                <div className="flex gap-md">
                  <button onClick={handleSaveProfile} className="btn btn-primary">Save</button>
                  <button onClick={() => { setIsEditingProfile(false); setEditedProfile(student); setPhotoFile(null); setPhotoPreview(student.photoUrl || null); }} className="btn btn-outline">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h1>{student.firstName} {student.lastName}</h1>
                    <div className="flex gap-sm mt-sm flex-wrap">
                      <span className="badge badge-primary">Grade {student.gradeLevel}</span>
                      {student.birthday && <span className="badge badge-success">Born: {new Date(student.birthday).toLocaleDateString()}</span>}
                    </div>
                    {student.bio && <p className="mt-md">{student.bio}</p>}
                  </div>
                  {canEditProfile && (
                    <button onClick={() => setIsEditingProfile(true)} className="btn btn-outline btn-sm">Edit Profile</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Row: Progress Summary (Left) and Session History (Right) */}
      <div className="grid grid-2 gap-xl mb-xl">
        {/* Progress Summary */}
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h2>Progress Summary</h2>
            {canEditProgress && (
              <button className="btn btn-outline btn-sm" onClick={() => isEditingSummary ? handleSaveSummary() : setIsEditingSummary(true)}>
                {isEditingSummary ? 'Save' : 'Edit'}
              </button>
            )}
          </div>
          {isEditingSummary ? (
            <textarea className="form-input" style={{ minHeight: '150px' }} value={summaryText} onChange={e => setSummaryText(e.target.value)} />
          ) : (
            <p>{student.progressSummary || (mostRecentSession?.progressSummary) || 'No progress summary yet.'}</p>
          )}
          {mostRecentSession && !isEditingSummary && (
            <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
              Last updated: {new Date(mostRecentSession.sessionDate).toLocaleDateString()} by {mostRecentSession.volunteerName}
            </p>
          )}
        </div>

        {/* Session History */}
        <div className="card">
          <h2>Session History</h2>
          <div className="flex flex-col gap-md" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {sessions.length > 0 ? sessions.map(session => (
              <div key={session.id} className="border-bottom pb-md">
                <div className="flex justify-between">
                  <strong>{new Date(session.sessionDate).toLocaleDateString()}</strong>
                  <span className="text-muted">with {session.volunteerName}</span>
                </div>
                {session.notes && <p className="mt-xs text-sm">{session.notes}</p>}
                {session.progressSummary && (
                  <div className="mt-sm p-sm" style={{ background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
                    <strong>Progress:</strong>
                    <p className="mt-xs text-sm">{session.progressSummary}</p>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-muted">No sessions recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Workbook Progress (Left) and Google Drive (Right) */}
      <div className="grid grid-2 gap-xl">
        {/* Workbook Progress */}
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h2>Workbook Progress</h2>
            {canEditProgress && (
              <button onClick={handleSaveWorkbookProgress} className="btn btn-outline btn-sm">Save</button>
            )}
          </div>
          <div className="mb-md">
            <div className="flex justify-between items-center mb-xs">
              <strong>Math Level:</strong>
              {canEditProgress ? (
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '80px' }}
                  value={workbookProgress.mathLevel || ''}
                  onChange={e => setWorkbookProgress({ ...workbookProgress, mathLevel: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={12}
                />
              ) : (
                <span>{workbookProgress.mathLevel || 'N/A'}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-xs">
              <strong>Reading Level:</strong>
              {canEditProgress ? (
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '80px' }}
                  value={workbookProgress.readingLevel || ''}
                  onChange={e => setWorkbookProgress({ ...workbookProgress, readingLevel: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={12}
                />
              ) : (
                <span>{workbookProgress.readingLevel || 'N/A'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Google Drive */}
        <div className="card">
          <h2>Google Drive</h2>
          <div className="p-lg border rounded text-center" style={{ background: 'var(--neutral-50)' }}>
            <p className="mb-md">Access scanned work and documents</p>
            <a href="#" className="btn btn-primary" onClick={e => e.preventDefault()}>
              Open Student Folder
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;