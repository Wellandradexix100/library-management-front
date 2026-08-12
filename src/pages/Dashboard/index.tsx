import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, FileText, Library } from 'lucide-react';
import api from '../../services/api';
import styles from './Dashboard.module.css';

interface DashboardData {
  livros: number;
  autores: number;
  emprestimos: number;
  reservas: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({ livros: 0, autores: 0, emprestimos: 0, reservas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resLivros, resAutores, resEmprestimos, resReservas] = await Promise.all([
          api.get('/livros'),
          api.get('/autor'),
          api.get('/emprestimo'),
          api.get('/reservas')
        ]);
        
        setData({
          livros: resLivros.data.length || 0,
          autores: resAutores.data.length || 0,
          emprestimos: resEmprestimos.data.length || 0,
          reservas: resReservas.data.length || 0
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Carregando painel...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Painel de Controle</h1>
        <p>Bem-vindo ao sistema de biblioteca escolar. Aqui está o resumo do nosso acervo.</p>
      </div>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.cardIcon} style={{ backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)' }}>
            <Library size={28} />
          </div>
          <div className={styles.cardInfo}>
            <h3>Total de Livros</h3>
            <p className={styles.number}>{data.livros}</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.cardIcon} style={{ backgroundColor: 'var(--primary-orange-light)', color: 'var(--primary-orange)' }}>
            <Users size={28} />
          </div>
          <div className={styles.cardInfo}>
            <h3>Autores Cadastrados</h3>
            <p className={styles.number}>{data.autores}</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.cardIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <FileText size={28} />
          </div>
          <div className={styles.cardInfo}>
            <h3>Empréstimos Ativos</h3>
            <p className={styles.number}>{data.emprestimos}</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <div className={styles.cardIcon} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <BookOpen size={28} />
          </div>
          <div className={styles.cardInfo}>
            <h3>Reservas Pendentes</h3>
            <p className={styles.number}>{data.reservas}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={`glass-panel ${styles.recentSection}`}>
           <h2>Avisos e Atividades</h2>
           <div className={styles.emptyState}>
             <BookOpen size={48} color="var(--border-color)" />
             <p>Nenhuma atividade recente registrada.</p>
             <span className={styles.hint}>Comece registrando novos livros ou autores no menu lateral.</span>
           </div>
        </div>
      </div>
    </div>
  );
};
