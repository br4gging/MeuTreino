import React from 'react';

interface CardioConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CardioConfirmationModal: React.FC<CardioConfirmationModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Treino</h3>
        <p className="text-gray-600 mb-6">Deseja salvar esta sessão de cardio?</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default CardioConfirmationModal; 