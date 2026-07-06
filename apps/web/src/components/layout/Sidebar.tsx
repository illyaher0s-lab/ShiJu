import { Home, Book, Library, RotateCcw } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/import', label: 'Articles', icon: Book },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/review', label: 'Review', icon: RotateCcw },
  ];
  
  return (
    <aside className="sidebar">
      <div className="logo">ShiJu</div>
      
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="spacer" />
      
      <div className="sidebar-footer">
        <p style={{ fontSize: '12px', color: 'var(--vercel-gray-500)' }}>
          AI Reading Trainer
        </p>
      </div>
    </aside>
  );
}
