import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Authors.module.css';

interface Autor {
  id: string;
  nome: string;
  livros: any[];
}

export const Authors: React.FC = () => {
  const { user } = useAuth();
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');

  useEffect(() => {
    fetchAutores();
  }, []);

  const fetchAutores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/autor');
      setAutores(response.data);
    } catch (error) {
      console.error("Erro ao buscar autores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAutor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/autor', { nome });
      setIsModalOpen(false);
      setNome('');
      fetchAutores();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao adicionar autor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este autor? Ele não pode ter livros vinculados.')) {
      try {
        await api.delete(`/autor/${id}`);
        fetchAutores();
      } catch (error: any) {
        alert(error.response?.data?.message || "Erro ao deletar. Verifique se o autor possui livros.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Autores Cadastrados</h1>
          <p>Gerencie os autores do acervo.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={20} /> Novo Autor
          </Button>
        )}
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.loading}>Carregando autores...</div>
        ) : autores.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} color="var(--border-color)" />
            <p>Nenhum autor cadastrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Autor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {autores.map((autor) => (
                <tr key={autor.id}>
                  <td>#{autor.id}</td>
                  <td className={styles.titleCell}>{autor.nome}</td>
                  <td>
                    {(user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(autor.id)}
                        title="Deletar Autor"
                      >
                        <Trash2 size={18} />
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
            <h2>Cadastrar Autor</h2>
            <form onSubmit={handleAddAutor} className={styles.form}>
              <Input 
                label="Nome do Autor" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
