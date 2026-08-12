import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../Loans/Loans.module.css';

interface Emprestimo {
  id: string;
  livroId: string;
  userId: string;
  dataEmprestimo: string;
  previstaDevolucao: string;
  dataDevolucao: string | null;
  livro: { titulo: string, capaUrl?: string };
  user: { nome: string };
}

export const OverdueLoans: React.FC = () => {
  const { user } = useAuth();
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  const fetchEmprestimos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/emprestimo/atrasados');
      setEmprestimos(response.data);
    } catch (error) {
      console.error("Erro ao buscar empréstimos atrasados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysOverdue = (prevista: string) => {
    const prev = new Date(prevista);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - prev.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={32} /> Livros em Atraso
          </h1>
          <p>Alunos que não devolveram o livro no prazo previsto.</p>
        </div>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`} style={{ border: '1px solid #fee2e2' }}>
        {loading ? (
          <div className={styles.loading}>Buscando atrasos...</div>
        ) : emprestimos.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} color="var(--border-color)" />
            <p>Ufa! Nenhum livro atrasado no momento.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Aluno/Usuário</th>
                <th>Previsto Para</th>
                <th>Dias de Atraso</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((emp) => (
                <tr key={emp.id} style={{ backgroundColor: '#fff5f5' }}>
                  <td className={styles.titleCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {emp.livro?.capaUrl ? (
                        <img 
                          src={emp.livro.capaUrl} 
                          alt={emp.livro.titulo} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AlertTriangle size={16} color="#ef4444" />
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: '#991b1b' }}>{emp.livro?.titulo || `Livro ${emp.livroId}`}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.user?.nome || `Usuário ${emp.userId}`}</td>
                  <td>{new Date(emp.previstaDevolucao).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeDanger}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                      <Clock size={14} /> {calculateDaysOverdue(emp.previstaDevolucao)} dias
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
