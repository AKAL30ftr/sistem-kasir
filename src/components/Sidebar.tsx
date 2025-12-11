import { LayoutDashboard, Coffee, ShoppingCart, History, FileText, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Coffee, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'POS System', path: '/pos' },
    { icon: History, label: 'History', path: '/history' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--bg-white)',
      borderRight: '1px solid #E2E8F0',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ padding: '0 1rem 2rem 1rem' }}>
          <h1 style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem' }}>POS System</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? '#FFF5F2' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s',
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          width: '100%',
          border: 'none',
          background: 'transparent',
          color: '#E53E3E', // Red for logout
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
