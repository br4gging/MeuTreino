import React, { useState } from 'react';
import { Smile, Frown, Meh, Angry } from 'lucide-react';

interface IntensityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (intensity: number) => void;
}

const IntensityModal: React.FC<IntensityModalProps> = ({ isOpen, onClose, onSave }) => {
  const [intensity, setIntensity] = useState(2);
  if (!isOpen) return null;
  const intensityMap = [
    { level: 1, label: 'Fácil', icon: <Smile className="text-green-500" size={32} />, color: 'bg-green-500' },
    { level: 2, label: 'Manejável', icon: <Meh className="text-yellow-500" size={32} />, color: 'bg-yellow-500' },
    { level: 3, label: 'Difícil', icon: <Frown className="text-orange-500" size={32} />, color: 'bg-orange-500' },
    { level: 4, label: 'Exaustivo', icon: <Angry className="text-red-500" size={32} />, color: 'bg-red-500' }
  ];
  const currentIntensity = intensityMap[intensity - 1];
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Qual foi a intensidade?</h3>
        <div className="my-8 flex flex-col items-center">{currentIntensity.icon}<p className="text-xl font-semibold mt-2 text-gray-700">{currentIntensity.label}</p></div>
        <input type="range" min="1" max="4" step="1" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${currentIntensity.color}`}/>
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100">Cancelar</button>
          <button onClick={() => onSave(intensity)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Salvar Treino</button>
        </div>
      </div>
    </div>
  );
};

export default IntensityModal; 