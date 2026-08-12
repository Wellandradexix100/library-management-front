import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        <div className={styles.iconWrap} style={{ backgroundColor: danger ? '#fee2e2' : '#eff6ff' }}>
          <AlertTriangle size={28} color={danger ? '#ef4444' : '#3b82f6'} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} type="button" style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            type="button"
            style={{
              flex: 1,
              ...(danger ? { backgroundColor: '#ef4444', borderColor: '#ef4444' } : {}),
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
