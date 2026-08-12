import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Users, LayoutDashboard, Library, FileText } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <BookOpen size={32} color="var(--primary-blue)" />
        <h2>Biblio<span className="text-gradient">Escolar</span></h2>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/livros" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Library size={20} />
          <span>Acervo (Livros)</span>
        </NavLink>

        <NavLink to="/autores" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Users size={20} />
          <span>Autores</span>
        </NavLink>

        <NavLink to="/alunos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <Users size={20} />
          <span>Alunos & Usuários</span>
        </NavLink>

        <NavLink to="/emprestimos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <FileText size={20} />
          <span>Empréstimos</span>
        </NavLink>

        <NavLink to="/atrasados" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <FileText size={20} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: 600 }}>Em Atraso</span>
        </NavLink>

        <NavLink to="/reservas" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <BookOpen size={20} />
          <span>Reservas</span>
        </NavLink>
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.illustrationPlace}>
           {/* Decorative element to make it feel more "school" friendly */}
           <div className={styles.circle}></div>
           <div className={styles.square}></div>
        </div>
      </div>
    </aside>
  );
};
