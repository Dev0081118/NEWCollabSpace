import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, toggleLike, getComments, addComment, deleteComment, sendCollabRequest } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [collabMsg, setCollabMsg] = useState('');
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projRes, commRes] = await Promise.all([
          getProject(id),
          getComments(id),
        ]);
        setProject(projRes.data);
        setComments(commRes.data.comments);
      } catch (err) {
        showToast('Failed to load project', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, showToast]);

  const handleLike = async () => {
    if (!user) { setShowAuth(true); return; }
    try {
      const { data } = await toggleLike(id);
      setProject((prev) => ({ ...prev, likedByUser: data.liked, likesCount: data.likesCount }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!newComment.trim()) return;
    try {
      const { data } = await addComment(id, newComment);
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast('Comment deleted');
    } catch (err) {
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleCollabRequest = async (e) => {
    e.preventDefault();
    if (!collabMsg.trim()) return;
    setSubmitting(true);
    try {
      await sendCollabRequest(id, collabMsg);
      showToast('Collaboration request sent!');
      setCollabMsg('');
      setShowCollabForm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="skeleton" style={{ height: 300, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 30, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '40%' }} />
      </div>
    );
  }

  if (!project) return null;

  const isOwner = user && project.user?._id === user.id;

  return (
    <div>
      {/* Hero Image */}
      <div style={styles.hero}>
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} style={styles.heroImage} />
        ) : (
          <div style={styles.heroPlaceholder}>
            <span style={{ fontSize: 64 }}>📁</span>
          </div>
        )}
        <div style={styles.heroOverlay}>
          <div className="container" style={styles.heroContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span className="badge badge-primary">{project.category}</span>
              {project.lookingForCollab && (
                <span className="badge badge-success">Open for collaboration</span>
              )}
            </div>
            <h1 style={styles.projectTitle}>{project.title}</h1>
            <div style={styles.projectMeta}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar avatar-sm">
                  {project.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span>{project.user?.name}</span>
              </div>
              <span style={styles.dot}>·</span>
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              <span style={styles.dot}>·</span>
              <span>❤️ {project.likesCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 0' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <section style={{ marginBottom: 32 }}>
              <h2 style={styles.sectionTitle}>Description</h2>
              <p style={styles.description}>{project.description}</p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2 style={styles.sectionTitle}>Tech Stack</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {project.techStack?.map((tech, i) => (
                  <span key={i} className="tag" style={{ padding: '6px 14px', fontSize: 13 }}>{tech}</span>
                ))}
              </div>
            </section>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <button className="btn btn-primary" onClick={handleLike}>
                {project.likedByUser ? '❤️ Unlike' : '🤍 Like'} ({project.likesCount})
              </button>
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  📂 GitHub
                </a>
              )}
              {project.demoLink && (
                <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  🚀 Live Demo
                </a>
              )}
            </div>

            {/* Collaboration Request */}
            {user && !isOwner && project.lookingForCollab && (
              <div style={{ marginBottom: 32 }}>
                {showCollabForm ? (
                  <form onSubmit={handleCollabRequest} style={styles.collabForm}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Send Collaboration Request</h3>
                    <textarea
                      placeholder="Tell the project owner why you'd like to collaborate..."
                      style={styles.collabTextarea}
                      value={collabMsg}
                      onChange={(e) => setCollabMsg(e.target.value)}
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Request'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCollabForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowCollabForm(true)}>
                    🤝 Request to Collaborate
                  </button>
                )}
              </div>
            )}

            {/* Comments Section */}
            <section>
              <h2 style={styles.sectionTitle}>Comments ({comments.length})</h2>

              {user ? (
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div className="avatar avatar-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{
                        flex: 1, padding: '10px 14px', background: 'var(--bg-input)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)', fontSize: 14,
                      }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Post</button>
                  </div>
                </form>
              ) : (
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
                  <button onClick={() => setShowAuth(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontSize: 14 }}>
                    Log in
                  </button> to leave a comment
                </p>
              )}

              {comments.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 20px' }}>
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {comments.map((comment) => (
                    <div key={comment._id} style={styles.commentCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">
                            {comment.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{comment.user?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {user && comment.user?._id === user.id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 13 }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Project Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Category</span>
                  <div style={{ fontWeight: 500 }}>{project.category}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Posted</span>
                  <div style={{ fontWeight: 500 }}>{new Date(project.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Collaboration</span>
                  <div style={{ fontWeight: 500 }}>
                    {project.lookingForCollab ? '✅ Open' : '❌ Closed'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Author</span>
                  <div style={{ fontWeight: 500 }}>{project.user?.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} />}
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    height: 300,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    padding: '40px 0 24px',
  },
  heroContent: {},
  projectTitle: {
    fontSize: 32,
    fontWeight: 700,
  },
  projectMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginTop: 12,
  },
  dot: {
    color: 'var(--text-muted)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
  },
  collabForm: {
    padding: 20,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  },
  collabTextarea: {
    width: '100%',
    padding: 12,
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 14,
    marginBottom: 12,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  commentCard: {
    padding: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
  },
};