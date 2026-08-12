import React, { useEffect, useState } from 'react';
import { FileText, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Loans.module.css';

interface Emprestimo {
  id: string;
  livroId: string;
  userId: string;
  dataEmprestimo: string;
  dataDevolucao: string | null;
  livro: { titulo: string, capaUrl?: string };
  user: { nome: string };
}

export const Loans: React.FC = () => {
  const { user } = useAuth();
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [livroBusca, setLivroBusca] = useState('');
  const [usuarioBusca, setUsuarioBusca] = useState('');
  const [previstaDevolucao, setPrevistaDevolucao] = useState('');
  

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [pendingLoanData, setPendingLoanData] = useState<any>(null);
  const [warningStudentName, setWarningStudentName] = useState('');


  const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const usuarioInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEmprestimos();
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

  const fetchEmprestimos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/emprestimo');
      setEmprestimos(response.data);
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async (e: React.FormEvent) => {
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

      const payload = {
        livroId: selectedLivro.id,
        usuarioId: selectedUser.id,
        previstaDevolucao: previstaDevolucao ? new Date(previstaDevolucao).toISOString() : undefined
      };

      const temEmprestimoAtivo = emprestimos.some(emp => emp.userId === selectedUser.id && !emp.dataDevolucao);
      if (temEmprestimoAtivo) {
        setWarningStudentName(selectedUser.nome);
        setPendingLoanData(payload);
        setWarningModalOpen(true);
        return;
      }

      await submitLoan(payload);
    } catch (error: any) {
      console.error("Erro ao preparar empréstimo:", error);
    }
  };

  const submitLoan = async (payload: any) => {
    try {
      await api.post('/emprestimo', payload);
      setIsModalOpen(false);
      setWarningModalOpen(false);
      setPendingLoanData(null);
      setLivroBusca('');
      setUsuarioBusca('');
      setPrevistaDevolucao('');
      fetchEmprestimos();
      fetchDadosBusca();
    } catch (error: any) {
      console.error("Erro ao registrar empréstimo:", error);
      alert(error.response?.data?.message || "Erro ao registrar empréstimo.");
    }
  };

  const handleReturn = async (id: string) => {
    if (window.confirm('Confirmar a devolução deste livro?')) {
      try {
        await api.put(`/emprestimo/${id}`);
        fetchEmprestimos();
      } catch (error: any) {
        console.error("Erro ao devolver livro:", error);
        alert(error.response?.data?.message || "Erro ao realizar devolução.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Controle de Empréstimos</h1>
          <p>Registre saídas e devoluções do acervo escolar.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Novo Empréstimo
          </Button>
        )}
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.loading}>Carregando registros...</div>
        ) : emprestimos.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} color="var(--border-color)" />
            <p>Nenhum empréstimo registrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Livro</th>
                <th>Aluno/Usuário</th>
                <th>Data Empréstimo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((emp) => (
                <tr key={emp.id}>
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
                          <FileText size={16} color="#94a3b8" />
                        </div>
                      )}
                      <span>{emp.livro?.titulo || `Livro ${emp.livroId}`}</span>
                    </div>
                  </td>
                  <td>{emp.user?.nome || `Usuário ${emp.userId}`}</td>
                  <td>{new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {emp.dataDevolucao ? (
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>Devolvido</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeWarning}`}>Em aberto</span>
                    )}
                  </td>
                  <td>
                    {!emp.dataDevolucao && (user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
                      <button 
                        className={styles.returnBtn}
                        onClick={() => handleReturn(emp.id)}
                        title="Registrar Devolução"
                      >
                        <CheckCircle size={18} /> Devolver
                      </button>
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
            <h2>Registrar Empréstimo</h2>
            <form onSubmit={handleAddLoan} className={styles.form}>
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
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Previsão de Devolução</label>
                <input 
                  type="date"
                  value={previstaDevolucao}
                  onChange={(e) => setPrevistaDevolucao(e.target.value)}
                  required 
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
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {warningModalOpen && (
        <div className={styles.modalOverlay} style={{ backdropFilter: 'blur(6px)', zIndex: 1000 }}>
          <div className={`glass-panel ${styles.modal}`} style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '50%' }}>
                <AlertTriangle size={32} color="#ef4444" />
              </div>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-main)' }}>Empréstimo Ativo Detectado</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              O aluno <strong>{warningStudentName}</strong> já possui um empréstimo em aberto. Deseja registrar um novo empréstimo mesmo assim?
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <Button 
                variant="secondary" 
                onClick={() => { setWarningModalOpen(false); setPendingLoanData(null); }} 
                type="button"
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => submitLoan(pendingLoanData)}
                style={{ flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
