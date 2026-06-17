import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, getUserProjects, getIncomingRequests, getSentRequests, acceptRequest, rejectRequest } from '../api/profileApi';
import { deleteProject } from '../api/projectApi';

export default function Profile() {
  const { user, showToast, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [incomingReqs, setIncomingReqs] = useState([]);
  const [sentReqs, setSentReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('projects');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, projectsRes, incomingRes, sentRes] = await Promise.all([
          getProfile(),
          getUserProjects(),
          getIncomingRequests(),
          getSentRequests(),
        ]);
        setProfile(profileRes.data);
        setProjects(projectsRes.data.projects || []);
        setIncomingReqs(incomingRes.data.requests);
        setSentReqs(sentRes.data.requests);
      } catch (err) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, navigate, showToast]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      showToast('Project deleted');
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id);
      setIncomingReqs((prev) => prev.map((r) => r._id === id ? { ...r, status: 'Accepted' } : r));
      showToast('Request accepted');
    } catch (err) {
      showToast('Failed to accept', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id);
      setIncomingReqs((prev) => prev.map((r) => r._id === id ? { ...r, status: 'Rejected' } : r));
      showToast('Request rejected');
    } catch (err) {
      showToast('Failed to reject', 'error');
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg" style={{ width: 80, height: 80, fontSize: 32 }}>
            {profile.user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{profile.user.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{profile.user.email}</p>
          </div>
          <Link to="/upload" className="btn btn-primary">+ New Project</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Projects', value: profile.stats.totalProjects },
            { label: 'Likes Received', value: profile.stats.totalLikesReceived },
            { label: 'Open for Collab', value: profile.stats.collabOpenProjects },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-light)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'projects', label: 'My Projects' },
          { id: 'incoming', label: `Incoming (${incomingReqs.filter(r => r.status === 'Pending').length})` },
          { id: 'sent', label: 'Sent Requests' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Upload your first project to showcase your work!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map((project) => (
                <div key={project._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ width: 80, height: 60, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-card-hover)', flexShrink: 0 }}>
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📁</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link to={`/project/${project._id}`} style={{ fontWeight: 600, fontSize: 15 }}>{project.title}</Link>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {project.category} · ❤️ {project.likesCount}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/edit/${project._id}`} className="btn btn-secondary btn-sm">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'incoming' && (
        <div>
          {incomingReqs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📨</div>
              <h3>No incoming requests</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {incomingReqs.map((req) => (
                <div key={req._id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm">{req.sender?.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{req.sender?.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          wants to collaborate on <Link to={`/project/${req.project?._id}`} style={{ color: 'var(--primary-light)' }}>{req.project?.title}</Link>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>"{req.message}"</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {req.status === 'Pending' ? (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req._id)}>Accept</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleReject(req._id)}>Reject</button>
                        </>
                      ) : (
                        <span className={`badge ${req.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sent' && (
        <div>
          {sentReqs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📤</div>
              <h3>No sent requests</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sentReqs.map((req) => (
                <div key={req._id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        <Link to={`/project/${req.project?._id}`} style={{ color: 'var(--primary-light)' }}>{req.project?.title}</Link>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Owner: {req.owner?.name}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>"{req.message}"</div>
                    </div>
                    <span className={`badge ${req.status === 'Accepted' ? 'badge-success' : req.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}