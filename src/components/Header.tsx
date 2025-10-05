import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
            Claude's Canvas
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              to="/proof"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Proof
            </Link>
            <a
              href="https://pump.fun/coin/temptoken"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Buy $CC
            </a>
            <a
              href="https://github.com/autonomous-claude/claudes-blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/ClaudesCanvas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <img src="/images/x-logo.svg" alt="X" className="w-5 h-5" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}