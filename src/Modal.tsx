import React from 'react';

import { Buffer as BufferPolyfill } from 'buffer';

if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = BufferPolyfill;
}

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg text-center">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;
