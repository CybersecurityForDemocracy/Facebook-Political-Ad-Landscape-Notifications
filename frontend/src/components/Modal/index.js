import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import './modal.css';

function Modal({ onClose, children }) {
  const onClickOverlay = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    function keyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', keyDown);
    return () => {
      document.removeEventListener('keydown', keyDown);
    };
  });

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-label="modal"
      aria-describedby="modal-content"
      onClick={onClickOverlay}
    >
      <div className="modal-container" role="document">
        <div className="modal-content" id="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.any.isRequired,
  onClose: PropTypes.func,
};

Modal.defaultProps = {
  onClose: () => null,
};

export default Modal;
