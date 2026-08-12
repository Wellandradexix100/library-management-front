import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  className,
  style,
}) => (
  <div
    className={`${styles.skeleton} ${className || ''}`}
    style={{ width, height, borderRadius, ...style }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className={styles.card}>
    <div className={styles.cardCover}>
      <Skeleton width="100%" height="100%" borderRadius="0" />
    </div>
    <div className={styles.cardBody}>
      <Skeleton height="14px" width="85%" />
      <Skeleton height="12px" width="55%" />
      <div className={styles.cardFooter}>
        <Skeleton height="22px" width="72px" borderRadius="999px" />
      </div>
    </div>
  </div>
);

export const SkeletonRow: React.FC = () => (
  <tr className={styles.row}>
    <td><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Skeleton width="36px" height="36px" borderRadius="50%" /><Skeleton width="140px" height="13px" /></div></td>
    <td><Skeleton width="100px" height="13px" /></td>
    <td><Skeleton width="80px" height="13px" /></td>
    <td><Skeleton width="64px" height="22px" borderRadius="999px" /></td>
    <td><Skeleton width="56px" height="28px" borderRadius="8px" /></td>
  </tr>
);
