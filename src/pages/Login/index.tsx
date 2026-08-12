import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password: senha });
      const { token } = response.data;
      signIn(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.illustration}>
          {/* Decorative elements representing school */}
          <div className={`${styles.shape} ${styles.circle}`}></div>
          <div className={`${styles.shape} ${styles.square}`}></div>
          <div className={`${styles.shape} ${styles.triangle}`}></div>
        </div>
        <div className={styles.brandInfo}>
          <BookOpen size={48} color="white" />
          <h1>BiblioEscolar</h1>
          <p>O sistema inteligente para gerenciar o acervo da sua escola.</p>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={`glass-panel ${styles.loginCard}`}>
          <h2>Bem-vindo(a) de volta!</h2>
          <p className={styles.subtitle}>Faça login para acessar o sistema</p>
          
          <form onSubmit={handleLogin} className={styles.form}>
            <Input 
              label="E-mail" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
            
            <Input 
              label="Senha" 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha secreta"
              required
            />

            {error && <div className={styles.errorAlert}>{error}</div>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>
          
          <div className={styles.registerLink}>
             Não tem uma conta? <a href="/register">Solicite ao administrador</a>
          </div>
        </div>
      </div>
    </div>
  );
};
