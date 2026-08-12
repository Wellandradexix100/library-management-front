import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { SkeletonCard } from '../../components/Skeleton';
import styles from './Books.module.css';

interface Livro {
  id: string;
  titulo: string;
  autorId: string;
  codigoBarras?: string;
  capaUrl?: string;
  sinopse?: string;
  autor?: { nome: string };
  quantidade: number;
  genero?: string;
  editora?: string;
  numeroEdicao?: string;
}

export const Books: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLivro, setSelectedLivro] = useState<Livro | null>(null);
  const [titulo, setTitulo] = useState('');
  const [autorNome, setAutorNome] = useState('');
  const [quantidade, setQuantidade] = useState('1');


  const [autores, setAutores] = useState<{id: string, nome: string}[]>([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [manualCapaUrl, setManualCapaUrl] = useState('');
  const [genero, setGenero] = useState('');
  const [editora, setEditora] = useState('');
  const [numeroEdicao, setNumeroEdicao] = useState('');
  const [editLivroId, setEditLivroId] = useState<string | null>(null);

  useEffect(() => {
    fetchLivros();
    fetchAutores();
  }, []);

  const fetchAutores = async () => {
    try {
      const response = await api.get('/autor');
      setAutores(response.data);
    } catch (error) {
      console.error("Erro ao buscar autores", error);
    }
  };

  const fetchLivros = async () => {
    setLoading(true);
    try {
      const response = await api.get('/livros');
      setLivros(response.data);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let selectedAutorId = autores.find(a => a.nome.toLowerCase() === autorNome.toLowerCase())?.id;
      

      if (!selectedAutorId) {
        const autorRes = await api.post('/autor', { nome: autorNome });
        selectedAutorId = autorRes.data.id;

        fetchAutores();
      }

      if (editLivroId) {
        await api.put(`/livros/${editLivroId}`, {
          titulo,
          autorId: selectedAutorId,
          quantidade: parseInt(quantidade),
          codigoBarras: codigoBarras || undefined,
          capaUrl: manualCapaUrl || undefined,
          genero: genero || undefined,
          editora: editora || undefined,
          numeroEdicao: numeroEdicao || undefined
        });
      } else {
        await api.post('/livros', {
          titulo,
          autorId: selectedAutorId,
          quantidade: parseInt(quantidade),
          codigoBarras: codigoBarras || undefined,
          manualCapaUrl: manualCapaUrl || undefined,
          genero: genero || undefined,
          editora: editora || undefined,
          numeroEdicao: numeroEdicao || undefined
        });
      }
      setIsModalOpen(false);
      setTitulo('');
      setAutorNome('');
      setQuantidade('1');
      setCodigoBarras('');
      setManualCapaUrl('');
      setGenero('');
      setEditora('');
      setNumeroEdicao('');
      setEditLivroId(null);
      fetchLivros();
    } catch (error: any) {
      console.error("Erro ao salvar livro:", error);
      showToast(error.response?.data?.message || "Erro ao salvar livro. Verifique os dados.", 'error');
    }
  };

  const openCreateModal = () => {
    setEditLivroId(null);
    setTitulo('');
    setAutorNome('');
    setQuantidade('1');
    setCodigoBarras('');
    setManualCapaUrl('');
    setGenero('');
    setEditora('');
    setNumeroEdicao('');
    setIsModalOpen(true);
  };

  const openEditModal = (livro: Livro) => {
    setEditLivroId(livro.id);
    setTitulo(livro.titulo);
    setAutorNome(livro.autor?.nome || '');
    setQuantidade(livro.quantidade.toString());
    setCodigoBarras(livro.codigoBarras || '');
    setManualCapaUrl(livro.capaUrl || '');
    setGenero(livro.genero || '');
    setEditora(livro.editora || '');
    setNumeroEdicao(livro.numeroEdicao || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/livros/${id}`);
      fetchLivros();
      showToast('Livro removido com sucesso.', 'success');
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
      showToast('Erro ao deletar. O livro pode estar emprestado ou reservado.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Acervo de Livros</h1>
          <p>Gerencie todos os livros disponíveis na biblioteca.</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
          <Button onClick={openCreateModal}>
            <Plus size={20} /> Novo Livro
          </Button>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Deletar Livro"
        message="Tem certeza que deseja remover este livro do acervo? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        danger
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.booksGrid}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : livros.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} color="var(--border-color)" />
            <p>Nenhum livro cadastrado no momento.</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {livros.map((livro) => (
              <div key={livro.id} className={styles.bookCard} onClick={() => setSelectedLivro(livro)}>
                {livro.capaUrl ? (
                  <img src={livro.capaUrl} alt={`Capa de ${livro.titulo}`} className={styles.coverImage} />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <BookOpen size={48} />
                    <span>Sem Capa</span>
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className={styles.bookTitle}>{livro.titulo}</h3>
                  <p className={styles.bookAuthor}>{livro.autor?.nome || `Autor ID: ${livro.autorId.substring(0,8)}...`}</p>
                  
                  <div className={styles.bookCardFooter}>
                    <span className={`${styles.badge} ${livro.quantidade > 0 ? styles.badgeSuccess : styles.badgeDanger}`}>
                      {livro.quantidade} un. disp.
                    </span>
                    {(user?.role === 'ADMIN' || user?.role === 'BIBLIOTECARIO') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={styles.deleteBtn}
                          style={{ color: '#3b82f6' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(livro);
                          }}
                          title="Editar Livro"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(livro.id);
                          }}
                          title="Deletar Livro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modal}`}>
            <h2>{editLivroId ? 'Editar Livro' : 'Cadastrar Novo Livro'}</h2>
            <form onSubmit={handleAddBook} className={styles.form}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>Nome do Autor</label>
                <input 
                  type="text"
                  value={autorNome}
                  onChange={(e) => setAutorNome(e.target.value)}
                  list="autores-list"
                  required 
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  placeholder="Pesquise ou digite um novo autor"
                />
                <datalist id="autores-list">
                  {autores.map(autor => (
                    <option key={autor.id} value={autor.nome} />
                  ))}
                </datalist>
              </div>
              <Input 
                label="Título do Livro" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required 
              />
              <Input 
                label="Código de Barras (Opcional)" 
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                placeholder="Bipe o livro ou digite"
              />
              <Input 
                label="URL da Capa (Opcional)" 
                value={manualCapaUrl}
                onChange={(e) => setManualCapaUrl(e.target.value)}
                placeholder="Ex: https://.../capa.jpg"
              />
              <Input 
                label="Quantidade de Exemplares" 
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <Input 
                  label="Gênero (Opcional)" 
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                />
                <Input 
                  label="Editora (Opcional)" 
                  value={editora}
                  onChange={(e) => setEditora(e.target.value)}
                />
                <Input 
                  label="Edição (Opcional)" 
                  value={numeroEdicao}
                  onChange={(e) => setNumeroEdicao(e.target.value)}
                />
              </div>
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

      {selectedLivro && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLivro(null)}>
          <div className={styles.synopsisModal} onClick={(e) => e.stopPropagation()}>
            {selectedLivro.capaUrl ? (
              <img src={selectedLivro.capaUrl} alt={selectedLivro.titulo} className={styles.synopsisCover} />
            ) : (
              <div className={`${styles.coverPlaceholder} ${styles.synopsisCover}`}>
                <BookOpen size={64} />
              </div>
            )}
            <div className={styles.synopsisContent}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{selectedLivro.titulo}</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className={`${styles.badge} ${selectedLivro.quantidade > 0 ? styles.badgeSuccess : styles.badgeDanger}`}>
                  {selectedLivro.quantidade} disponíveis
                </span>
                {selectedLivro.codigoBarras && (
                  <span className={styles.badge} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
                    EAN/ISBN: {selectedLivro.codigoBarras}
                  </span>
                )}
              </div>
              <p className={styles.bookAuthor} style={{ fontSize: '1.1rem', marginTop: '8px' }}>
                Autor: {selectedLivro.autor?.nome || selectedLivro.autorId}
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {selectedLivro.genero && <span><strong>Gênero:</strong> {selectedLivro.genero}</span>}
                {selectedLivro.editora && <span><strong>Editora:</strong> {selectedLivro.editora}</span>}
                {selectedLivro.numeroEdicao && <span><strong>Edição:</strong> {selectedLivro.numeroEdicao}</span>}
              </div>
              
              <div style={{ marginTop: '16px', flex: 1 }}>
                <h4 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Sinopse</h4>
                <div className={styles.synopsisText}>
                  {selectedLivro.sinopse ? selectedLivro.sinopse : "Nenhuma sinopse disponível para este livro no momento."}
                </div>
              </div>

              <div style={{ alignSelf: 'flex-end', marginTop: '24px' }}>
                <Button onClick={() => setSelectedLivro(null)}>Fechar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
