import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../api/projectApi';

const CATEGORIES = ['Web', 'Mobile', 'AI/ML', 'Design', 'DevOps', 'Game Dev', 'Other'];

export default function UploadProject() {
  const { user, showToast, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: '',
    category: 'Web',
    githubLink: '',
    demoLink: '',
    lookingForCollab: false,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && !user) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.techStack.trim()) { setError('Tech stack is required'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('techStack', form.techStack);
      formData.append('category', form.category);
      formData.append('githubLink', form.githubLink);
      formData.append('demoLink', form.demoLink);
      formData.append('lookingForCollab', form.lookingForCollab);
      if (image) formData.append('image', image);

      const { data } = await createProject(formData);
      showToast('Project uploaded successfully!');
      navigate(`/project/${data.project._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to upload project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 32, paddingBottom: 60 }}>
      <div className="card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Upload Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
          Share your project with the community
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(225, 112, 85, 0.15)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              placeholder="My Amazing Project"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Describe what your project does, what problems it solves..."
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="input-group">
            <label>Tech Stack * (comma separated)</label>
            <input
              type="text"
              name="techStack"
              placeholder="React, Node.js, MongoDB, Tailwind..."
              value={form.techStack}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Thumbnail Image (optional, max 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: 14,
              }}
            />
            {imagePreview && (
              <div style={{ marginTop: 8, borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxWidth: 200 }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto' }} />
              </div>
            )}
          </div>

          <div className="input-group">
            <label>GitHub Link (optional)</label>
            <input
              type="url"
              name="githubLink"
              placeholder="https://github.com/yourusername/project"
              value={form.githubLink}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Live Demo Link (optional)</label>
            <input
              type="url"
              name="demoLink"
              placeholder="https://yourproject.vercel.app"
              value={form.demoLink}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.lookingForCollab}
                onChange={(e) => setForm({ ...form, lookingForCollab: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 14 }}>Looking for collaborators</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Uploading...' : '🚀 Upload Project'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}