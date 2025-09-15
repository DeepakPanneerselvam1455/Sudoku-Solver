import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ onConfirm, onCancel, title, children }) => {
  return (
    <div className="modal-overlay" onClick={onCancel} aria-modal="true" role="dialog">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ExclamationTriangleIcon className="modal-icon" style={{ width: 48, height: 48, color: '#f59e0b' }} />

            <h2 className="modal-title" style={{fontSize: '1.5rem'}}>{title}</h2>
            <p className="modal-subtitle">{children}</p>
        
            <div className="modal-buttons">
                <button onClick={onCancel} className="modal-button btn-cancel">
                    Cancel
                </button>
                <button onClick={onConfirm} className="modal-button btn-confirm">
                    Confirm
                </button>
            </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
