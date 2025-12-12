import { LayoutDashboard, Coffee, ShoppingCart, History, FileText, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shiftService } from '../services/shiftService';
import toast from 'react-hot-toast';

const AuthUserInitial = ({ username }: { username?: string }) => 
  <span className="select-none">{username?.[0]?.toUpperCase() || 'U'}</span>;

const AuthUserName = ({ username }: { username?: string }) => 
  <>{username || 'Cashier'}</>;

const AuthUserRole = ({ role }: { role?: string }) => 
  <span style={{textTransform: 'capitalize'}}>{role || 'Staff'}</span>;

export default function Sidebar() {
  const { logout, user } = useAuth();
  
  const handleLogout = async () => {
    if (!user) return;

    try {
      // 1. Cek User punya shift aktif?
      const openShift = await shiftService.getCurrentShift(user.id);
      
      if (openShift) {
        // 2. Strict Policy: TIDAK BOLEH LOGOUT KALO SHIFT OPEN
        // User diminta untuk menutup shift secara manual agar hitungan fisik (Actual Cash) akurat.
        
        toast.error('Gagal Logout: Anda masih memiliki Shift Aktif!', {
          duration: 4000,
          icon: '🚫'
        });
        
        // Opsional: Redirect ke dashboard biar mereka melihat tombol End Shift
        // window.location.hash = '#/'; // Simple redirect to dashboard
        
        // Tampilkan pesan detail
        setTimeout(() => {
          alert(
            `Shift Anda (Mulai: ${new Date(openShift.start_time).toLocaleTimeString()}) masih terbuka.\n\n` +
            `Mohon lakukan "Akhiri Shift" di Dashboard terlebih dahulu untuk input setoran uang.`
          );
        }, 500);

        return; // BLOCK LOGOUT
      }
      
      logout();
    } catch (error) {
      console.error(error);
      toast.error('Gagal saat logout');
    }
  };
  
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

      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
              <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' 
              }}>
                  <AuthUserInitial username={user?.username} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <AuthUserName username={user?.username} />
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <AuthUserRole role={user?.role} />
                  </p>
              </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              width: '100%',
              border: 'none',
              borderRadius: '8px',
              background: '#FFF5F5',
              color: '#E53E3E',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
      </div>
    </aside>
  );
}
