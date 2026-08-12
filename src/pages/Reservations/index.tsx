import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../Loans/Loans.module.css';

interface Reserva {
  id: string;
  livroId: string;
  userId: string;
  dataReserva: string;
  status: string;
  livro: { titulo: string, capaUrl?: string };
  user: { nome: string };
}

export const Reservations: React.FC = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [livroBusca, setLivroBusca] = useState('');
  const [usuarioBusca, setUsuarioBusca] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');


  const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const usuarioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReservas();
    fetchDadosBusca();
  }, []);

  const fetchDadosBusca = async () => {
    try {
      const [resLivros, resUsuarios] = await Promise.all([
        api.get('/livros'),
        api.get('/usuarios')
      ]);
      setLivrosDisponiveis(resLivros.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      console.error("Erro ao carregar dados de busca", error);
    }
  };

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedLivro = livrosDisponiveis.find(l => l.titulo === livroBusca || l.id === livroBusca || l.codigoBarras === livroBusca);
      const selectedUser = usuarios.find(u => u.nome === usuarioBusca || u.id === usuarioBusca);

      if (!selectedLivro) {
        alert("Livro não encontrado. Verifique o nome ou bip o código novamente.");
        return;
      }
      if (!selectedUser) {
        alert("Usuário não encontrado. Verifique o nome ou bip a carteirinha novamente.");
        return;
      }

      await api.post('/reservas', {
        livroId: selectedLivro.id,
        usuarioId: selectedUser.id,
        dataExpiracao: dataExpiracao ? new Date(dataExpiracao).toISOString() : undefined
      });
      setIsModalOpen(false);
      setLivroBusca('');
      setUsuarioBusca('');
      setDataExpiracao('');
      fetchReservas();
      fetchDadosBusca();
    } catch (error: any) {
      console.error("Erro ao registrar reserva:", error);
      alert(error.response?.data?.message || "Erro ao registrar reserva.");
    }
  };

  const handleEfetivar = async (id: string) => {
    if (window.confirm('Efetivar reserva (transformar em empréstimo ativo)?')) {
      try {
        await api.post(`/reservas/${id}/efetivar`);
        fetchReservas();
      } catch (error: any) {
        alert(error.response?.data?.message || "Erro ao efetivar.");
      }
    }
  };

  const handleCancelar = async (id: string) => {
    if (window.confirm('Deseja realmente cancelar esta reserva?')) {
      try {
        await api.delete(`/reservas/${id}/cancelar`);
        fetchReservas();
      } catch (error: any) {
        alert(error.response?.data?.message || "Erro ao cancelar.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PENDENTE') return <span className={`${styles.badge} ${styles.badgeWarning}`}>Pendente</span>;
    if (status === 'EFETIVADA') return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Efetivada</span>;
    return <span className={`${styles.badge}`} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Cancelada</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Reservas de Livros</h1>
          <p>Acompanhe os pedidos de reserva feitos pelos alunos/professores.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Nova Reserva
        </Button>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.loading}>Carregando reservas...</div>
        ) : reservas.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} color="var(--border-color)" />
            <p>Nenhuma reserva registrada.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Aluno/Usuário</th>
                <th>Data da Reserva</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((res) => (
                <tr key={res.id}>
                  <td className={styles.titleCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {res.livro?.capaUrl ? (
                        <img 
                          src={res.livro.capaUrl} 
                          alt={res.livro.titulo} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpen size={16} color="#94a3b8" />
                        </div>
                      )}
                      <span>{res.livro?.titulo || `Livro ${res.livroId}`}</span>
                    </div>
                  </td>
                  <td>{res.user?.nome || `Usuário ${res.userId}`}</td>
                  <td>{new Date(res.dataReserva).toLocaleDateString('pt-BR')}</td>
                  <td>{getStatusBadge(res.status || 'PENDENTE')}</td>
                  <td>
                    {(!res.status || res.status === 'PENDENTE') && (user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={styles.returnBtn}
                          onClick={() => handleEfetivar(res.id)}
                          title="Efetivar (Emprestar)"
                        >
                          <CheckCircle size={18} /> Efetivar
                        </button>
                        <button 
                          className={styles.returnBtn}
                          style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                          onClick={() => handleCancelar(res.id)}
                          title="Cancelar Reserva"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modal}`}>
            <h2>Registrar Reserva</h2>
            <form onSubmit={handleAddReserva} className={styles.form}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Livro (Bipe ou digite o nome)</label>
                <input 
                  type="text"
                  value={livroBusca}
                  onChange={(e) => setLivroBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      usuarioInputRef.current?.focus();
                    }
                  }}
                  list="livros-busca"
                  required 
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  placeholder="Ex: Harry Potter ou código"
                />
                <datalist id="livros-busca">
                  {livrosDisponiveis.map(livro => (
                    <option key={livro.id} value={livro.titulo} />
                  ))}
                </datalist>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Aluno/Usuário (Bipe ou digite o nome)</label>
                <input 
                  ref={usuarioInputRef}
                  type="text"
                  value={usuarioBusca}
                  onChange={(e) => setUsuarioBusca(e.target.value)}
                  list="usuarios-busca"
                  required 
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  placeholder="Ex: Joãozinho ou código"
                />
                <datalist id="usuarios-busca">
                  {usuarios.map(u => (
                    <option key={u.id} value={u.nome} />
                  ))}
                </datalist>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Expira em (Opcional)</label>
                <input 
                  type="date"
                  value={dataExpiracao}
                  onChange={(e) => setDataExpiracao(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                />
              </div>
              
              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancelar
                </Button>
                <Button type="submit">
                  Confirmar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
