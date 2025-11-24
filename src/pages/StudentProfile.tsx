import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
}

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');

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

      const [student, sessions] = await Promise.all([
        api.get(`/api/students/${id}`).catch(() => null),
        api.get(`/api/students/${id}/sessions`).catch(() => [])
      ]);

      if (student) {
        setStudent(student);
        setSummaryText(student.progressSummary || '');
      }

      setSessions(Array.isArray(sessions) ? sessions : []);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      await api.put(`/api/students/${id}/progress`, { progressSummary: summaryText });
      setStudent(prev => prev ? { ...prev, progressSummary: summaryText } : null);
      setIsEditingSummary(false);
    } catch (error) {
      console.error('Error updating summary:', error);
    }
  };

  if (isLoading) return <div className="flex justify-center p-xl"><div className="spinner"></div></div>;
  if (!student) return <div className="p-xl text-center">Student not found</div>;

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <div className="card mb-xl">
        <div className="flex gap-lg items-start">
          <div className="avatar avatar-xl" style={{ fontSize: '2rem' }}>
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.firstName} />
            ) : (
              `${student.firstName[0]}${student.lastName[0]}`
            )}
          </div>
          <div className="flex-1">
            <h1>{student.firstName} {student.lastName}</h1>
            <div className="flex gap-sm mt-sm">
              <span className="badge badge-primary">Grade {student.gradeLevel}</span>
              {student.birthday && <span className="text-muted">Born: {new Date(student.birthday).toLocaleDateString()}</span>}
            </div>
            {student.bio && <p className="mt-md">{student.bio}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-xl">
        <div>
          <div className="card mb-xl">
            <div className="flex justify-between items-center mb-md">
              <h2>Progress Summary</h2>
              {user?.role !== 'student' && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => isEditingSummary ? handleSaveSummary() : setIsEditingSummary(true)}
                >
                  {isEditingSummary ? 'Save' : 'Edit'}
                </button>
              )}
            </div>
            {isEditingSummary ? (
              <textarea
                className="input"
                style={{ minHeight: '150px' }}
                value={summaryText}
                onChange={e => setSummaryText(e.target.value)}
              />
            ) : (
              <p>{student.progressSummary || 'No progress summary yet.'}</p>
            )}
          </div>

          <div className="card">
            <h2>Workbook Progress</h2>
            <div className="mb-md">
              <div className="flex justify-between mb-xs">
                <strong>Math Level {student.gradeLevel}</strong>
                <span>45%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-xs">
                <strong>Reading Level {student.gradeLevel}</strong>
                <span>60%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-xl">
            <h2>Google Drive</h2>
            <div className="p-lg border rounded text-center bg-light">
              <p className="mb-md">Access scanned work and documents</p>
              <a href="#" className="btn btn-primary" onClick={e => e.preventDefault()}>
                Open Student Folder
              </a>
            </div>
          </div>

          <div className="card">
            <h2>Session History</h2>
            <div className="flex flex-col gap-md">
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session.id} className="border-bottom pb-md">
                  <div className="flex justify-between">
                    <strong>{new Date(session.sessionDate).toLocaleDateString()}</strong>
                    <span className="text-muted">with {session.volunteerName}</span>
                  </div>
                  {session.notes && <p className="mt-xs text-sm">{session.notes}</p>}
                </div>
              )) : (
                <p className="text-muted">No sessions recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;