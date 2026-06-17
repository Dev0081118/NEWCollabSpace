import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type || 'success'}`}>
        <span>{toast.type === 'success' ? '✓' : '✕'}</span>
        {toast.message}
      </div>
    </div>
  );
}