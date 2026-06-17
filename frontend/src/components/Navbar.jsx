import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <>
      <nav style={styles.nav}>
        <div className="container" style={styles.navInner}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>✦</span>
            <span style={styles.logoText}>CollabSpace</span>
          </Link>

          <div style={styles.navRight}>
            {user ? (
              <div style={styles.userMenu}>
                <button
                  style={styles.uploadBtn}
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/upload')}
                >
                  + Upload Project
                </button>
                <div style={styles.userInfo} onClick={() => setShowMenu(!showMenu)}>
                  <div className="avatar avatar-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                  <span style={styles.chevron}>▼</span>
                </div>
                {showMenu && (
                  <div style={styles.dropdown}>
                    <button style={styles.dropdownItem} onClick={() => { navigate('/profile'); setShowMenu(false); }}>
                      👤 Profile
                    </button>
                    <button style={styles.dropdownItem} onClick={() => { navigate('/upload'); setShowMenu(false); }}>
                      📤 Upload Project
                    </button>
                    <div style={styles.dropdownDivider} />
                    <button style={{ ...styles.dropdownItem, color: 'var(--error)' }} onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.authBtns}>
                <button className="btn btn-secondary btn-sm" onClick={() => openAuth('login')}>Log in</button>
                <button className="btn btn-primary btn-sm" onClick={() => openAuth('signup')}>Sign up</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} />}
    </>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10, 10, 26, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border)',
  },
  navInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: 24,
    color: 'var(--primary-light)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    background: 'var(--gradient-1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  uploadBtn: {},
  authBtns: {
    display: 'flex',
    gap: 8,
  },
  userMenu: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
  },
  chevron: {
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 8,
    minWidth: 200,
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 14px',
    background: 'none',
    color: 'var(--text-primary)',
    fontSize: 14,
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    border: 'none',
    textAlign: 'left',
  },
  dropdownDivider: {
    height: 1,
    background: 'var(--border)',
    margin: '4px 0',
  },
};