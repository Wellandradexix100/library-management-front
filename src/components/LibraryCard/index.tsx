import React from 'react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import styles from './LibraryCard.module.css';

interface LibraryCardProps {
  user: {
    id: string;
    nome: string;
    email: string;
    funcao: string;
    avatarUrl?: string | null;
  };
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ user }) => {
  const schoolName = "Colégio Eximius";
  const defaultAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nome) + "&background=0056b3&color=fff";

  return (
    <div className={styles.cardWrapper}>
      {/* Frente da Carteirinha */}
      <div className={styles.cardFront}>
        <div className={styles.header}>
          <h2>{schoolName}</h2>
          <span className={styles.subtitle}>Carteira de Biblioteca</span>
        </div>
        <div className={styles.body}>
          <div className={styles.photoContainer}>
            <img 
              src={user.avatarUrl || defaultAvatar} 
              alt={`Foto de ${user.nome}`} 
              className={styles.photo}
            />
          </div>
          <div className={styles.userInfo}>
            <h3>{user.nome}</h3>
            <p>{user.email}</p>
            <span className={styles.roleBadge}>{user.funcao}</span>
          </div>
        </div>
      </div>

      {/* Verso da Carteirinha */}
      <div className={styles.cardBack}>
        <div className={styles.backTop}>
          <p>Uso exclusivo para a Biblioteca Escolar.</p>
          <p>Esta carteira é pessoal e intransferível.</p>
        </div>
        
        <div className={styles.codesContainer}>
          <div className={styles.qrCodeWrapper}>
            <QRCode value={user.id} size={70} style={{ height: "auto", maxWidth: "100%", width: "100%" }} viewBox={`0 0 256 256`} />
          </div>
          <div className={styles.barcodeWrapper}>
            <Barcode value={user.id} width={1.2} height={40} displayValue={false} margin={0} />
          </div>
        </div>
        
        <div className={styles.backFooter}>
          <span>ID: {user.id.substring(0, 8)}...</span>
        </div>
      </div>
    </div>
  );
};
