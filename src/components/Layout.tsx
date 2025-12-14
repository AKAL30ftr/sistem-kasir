import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { OfflineIndicator } from './OfflineIndicator';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        padding: '2rem',
        backgroundColor: 'var(--bg-light)',
        overflowY: 'auto'
      }}>
        <Outlet />
      </main>
      <OfflineIndicator />
    </div>
  );
}
