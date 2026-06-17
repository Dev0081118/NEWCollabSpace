import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProjectCard({ project, onLike }) {
  const { user } = useAuth();

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && onLike) onLike(project._id);
  };

  return (
    <Link to={`/project/${project._id}`} className="card" style={styles.card}>
      <div style={styles.imageWrap}>
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>
            <span style={{ fontSize: 32 }}>📁</span>
          </div>
        )}
        {project.lookingForCollab && (
          <span style={styles.collabBadge}>Open for collab</span>
        )}
      </div>
      <div style={styles.body}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={styles.title}>{project.title}</h3>
          <button
            onClick={handleLike}
            style={{
              ...styles.likeBtn,
              color: project.likedByUser ? 'var(--secondary)' : 'var(--text-muted)',
            }}
            title={user ? 'Like/Unlike' : 'Log in to like'}
          >
            {project.likedByUser ? '❤️' : '🤍'}
          </button>
        </div>
        <p style={styles.description}>{project.description?.slice(0, 100)}...</p>
        <div style={styles.tags}>
          {project.techStack?.slice(0, 3).map((tech, i) => (
            <span key={i} className="tag">{tech}</span>
          ))}
          {project.techStack?.length > 3 && (
            <span className="tag">+{project.techStack.length - 3}</span>
          )}
        </div>
        <div style={styles.footer}>
          <div style={styles.author}>
            <div className="avatar avatar-sm">
              {project.user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span style={styles.authorName}>{project.user?.name || 'Unknown'}</span>
          </div>
          <div style={styles.stats}>
            <span>❤️ {project.likesCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  imageWrap: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
    background: 'var(--bg-card)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%)',
  },
  collabBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '4px 10px',
    background: 'rgba(0, 206, 201, 0.9)',
    color: '#fff',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  body: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.3,
    flex: 1,
  },
  likeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    flexShrink: 0,
    transition: 'transform 0.2s',
  },
  description: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: '1px solid var(--border)',
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  stats: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};