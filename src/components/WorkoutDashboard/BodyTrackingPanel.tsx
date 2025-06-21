import React from 'react';

interface BodyTrackingPanelProps {
  onOpenMeasurementModal: () => void;
}

const BodyTrackingPanel: React.FC<BodyTrackingPanelProps> = ({ onOpenMeasurementModal }) => (
  <div className="bg-white rounded-2xl p-4 shadow-md border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3"><span className="w-5 h-5 text-indigo-500">⚖️</span>
        <h3 className="font-semibold text-gray-700">Acompanhamento Corporal</h3>
      </div>
      <button onClick={onOpenMeasurementModal} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors text-sm">Registar Medidas</button>
    </div>
  </div>
);

export default BodyTrackingPanel; 