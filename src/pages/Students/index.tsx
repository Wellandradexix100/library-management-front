import React, { useEffect, useState } from 'react';
import { Users, Printer } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { LibraryCard } from '../../components/LibraryCard';
import styles from './Students.module.css';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  funcao: string;
}

export const Students: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  

  const [userToPrint, setUserToPrint] = useState<Usuario | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (u: Usuario) => {
    setUserToPrint(u);

    setTimeout(() => {
      window.print();
      setUserToPrint(null);
    }, 500);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Acesso negado. Apenas administradores podem ver a lista de usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Oculta tudo na tela na hora da impressão, exceto o componente de impressão */}
      <div className={styles.hideOnPrint}>
        <div className={styles.header}>
          <div>
            <h1>Alunos e Usuários</h1>
            <p>Gerencie os usuários e imprima as carteirinhas com QR Code.</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.tableContainer}`}>
          {loading ? (
            <div className={styles.loading}>Carregando usuários...</div>
          ) : usuarios.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} color="var(--border-color)" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Cargo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.titleCell}>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${styles.badge} ${u.funcao === 'ADMIN' ? styles.badgeDanger : u.funcao === 'BIBLIOTECARIO' ? styles.badgeWarning : styles.badgeSuccess}`}>
                        {u.funcao}
                      </span>
                    </td>
                    <td>
                      <Button variant="secondary" onClick={() => handlePrint(u)}>
                        <Printer size={16} /> Imprimir Carteira
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Container de Impressão (Visível APENAS na hora do print via CSS) */}
      {userToPrint && (
        <div className={styles.printArea}>
          <LibraryCard user={userToPrint} />
        </div>
      )}
    </div>
  );
};
