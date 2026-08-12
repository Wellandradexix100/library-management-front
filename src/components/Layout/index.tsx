import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import styles from './Layout.module.css';
import { useAuth } from '../../contexts/AuthContext';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.userInfo}>
            <span className={styles.greeting}>Olá, {user?.email}</span>
            <span className={styles.roleBadge}>{user?.role}</span>
          </div>
          <button onClick={signOut} className={styles.logoutBtn}>Sair</button>
        </header>
        <main className={styles.pageContent}>
          <div className="glass-panel" style={{ padding: '24px', minHeight: 'calc(100vh - 120px)' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
