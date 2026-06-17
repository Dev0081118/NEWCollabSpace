import { useState, useEffect, useCallback, useRef } from 'react';
import { getProjects, getTrendingProjects, toggleLike } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import AuthModal from '../components/AuthModal';

const CATEGORIES = ['All', 'Web', 'Mobile', 'AI/ML', 'Design', 'DevOps', 'Game Dev', 'Other'];

export default function Home() {
  const { user, showToast } = useAuth();
  const [projects, setProjects] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const debounceTimer = useRef(null);

  // Debounce search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category && category !== 'All') params.category = category;
      const { data } = await getProjects(params);
      setProjects(data.projects);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  const fetchTrending = useCallback(async () => {
    try {
      const { data } = await getTrendingProjects();
      setTrending(data.projects);
    } catch (err) {
      console.error('Failed to fetch trending', err);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLike = async (id) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const { data } = await toggleLike(id);
      setProjects((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, likedByUser: data.liked, likesCount: data.likesCount } : p
        )
      );
      setTrending((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, likedByUser: data.liked, likesCount: data.likesCount } : p
        )
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle like', 'error');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroContent}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>
              Discover & Showcase{' '}
              <span style={{ background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Amazing Projects
              </span>
            </h1>
            <p style={styles.heroSubtitle}>
              The creative community for developers, designers, and innovators. 
              Share your work, find collaborators, and get inspired.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setDebouncedSearch(search); setPage(1); }} style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search projects by title, description or tech stack..."
                value={search}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
              <button type="submit" className="btn btn-primary" style={{ height: 48, borderRadius: '0 12px 12px 0' }}>
                🔍 Search
              </button>
            </form>
            <div style={styles.heroStats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>500+</span>
                <span style={styles.statLabel}>Projects</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>2K+</span>
                <span style={styles.statLabel}>Creators</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>10K+</span>
                <span style={styles.statLabel}>Collaborations</span>
              </div>
            </div>
          </div>
          <div style={styles.heroVisual}>
            <div style={styles.heroCard1}>
              <span style={{ fontSize: 40 }}>🚀</span>
              <span style={{ fontWeight: 600 }}>Build Together</span>
            </div>
            <div style={styles.heroCard2}>
              <span style={{ fontSize: 40 }}>💡</span>
              <span style={{ fontWeight: 600 }}>Get Inspired</span>
            </div>
            <div style={styles.heroCard3}>
              <span style={{ fontSize: 40 }}>🤝</span>
              <span style={{ fontWeight: 600 }}>Collaborate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section style={styles.section}>
          <div className="container">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🔥 Trending Projects</h2>
              <p style={styles.sectionDesc}>Most popular projects in the community</p>
            </div>
            <div className="grid grid-3">
              {trending.map((project) => (
                <ProjectCard key={project._id} project={project} onLike={handleLike} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery / All Projects */}
      <section style={{ ...styles.section, background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📂 Explore Projects</h2>
            <p style={styles.sectionDesc}>Browse all projects from our community</p>
          </div>

          {/* Category Filters */}
          <div style={styles.filters}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                style={{
                  ...styles.filterBtn,
                  background: category === cat ? 'var(--gradient-1)' : 'var(--bg-input)',
                  color: category === cat ? '#fff' : 'var(--text-secondary)',
                  border: category === cat ? 'none' : '1px solid var(--border)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card" style={{ height: 320 }}>
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No projects found</h3>
              <p>Be the first to share your project with the community!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-3">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} onLike={handleLike} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </button>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Community Section */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🌐 Our Community</h2>
            <p style={styles.sectionDesc}>Join thousands of creators building the future</p>
          </div>
          <div className="grid grid-4" style={{ marginTop: 32 }}>
            {[
              { icon: '👨‍💻', title: 'Developers', desc: 'Share your code and get feedback from peers' },
              { icon: '🎨', title: 'Designers', desc: 'Showcase your UI/UX projects and design systems' },
              { icon: '🤖', title: 'AI Engineers', desc: 'Collaborate on cutting-edge ML projects' },
              { icon: '🎮', title: 'Game Devs', desc: 'Build and test games with a passionate community' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} />}
    </div>
  );
}

const styles = {
  hero: {
    background: 'var(--gradient-hero)',
    padding: '80px 0 60px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 60,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: 28,
    maxWidth: 540,
  },
  searchBox: {
    display: 'flex',
    maxWidth: 520,
    marginBottom: 32,
  },
  searchInput: {
    flex: 1,
    padding: '14px 20px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px 0 0 12px',
    color: 'white',
    fontSize: 15,
    outline: 'none',
  },
  heroStats: {
    display: 'flex',
    gap: 40,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--primary-light)',
  },
  statLabel: {
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  heroVisual: {
    flex: '0 0 320px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'relative',
  },
  heroCard1: {
    padding: 20,
    background: 'rgba(108, 92, 231, 0.15)',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transform: 'rotate(-3deg)',
  },
  heroCard2: {
    padding: 20,
    background: 'rgba(253, 121, 168, 0.15)',
    border: '1px solid rgba(253, 121, 168, 0.3)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transform: 'rotate(2deg)',
    marginLeft: 40,
  },
  heroCard3: {
    padding: 20,
    background: 'rgba(0, 206, 201, 0.15)',
    border: '1px solid rgba(0, 206, 201, 0.3)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transform: 'rotate(-1deg)',
    marginLeft: 20,
  },
  section: {
    padding: '60px 0',
  },
  sectionHeader: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  sectionDesc: {
    color: 'var(--text-secondary)',
    fontSize: 15,
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  filterBtn: {
    padding: '8px 18px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
};