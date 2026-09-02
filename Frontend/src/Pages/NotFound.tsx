import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NotFound: React.FC = () => {
  useDocumentTitle('404 Not Found');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1110] flex flex-col items-center justify-center p-4">
      <div className="glass-card rounded-lg p-8 max-w-md w-full text-center border-zinc-800">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">404 - Page Not Found</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
        >
          {user ? 'Return to Dashboard' : 'Return Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
