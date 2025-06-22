import React from 'react';
import { Scale } from 'lucide-react';

interface BodyTrackingPanelProps {
  onOpenMeasurementModal: () => void;
}

const BodyTrackingPanel: React.FC<BodyTrackingPanelProps> = ({ onOpenMeasurementModal }) => (
  <div className="card flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-accent-gradient flex items-center justify-center text-bg-primary">
          <Scale size={24} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-text-primary">Acompanhamento Corporal</h3>
        <p className="text-sm text-text-muted">Registre seu peso e medidas.</p>
      </div>
    </div>
    <button onClick={onOpenMeasurementModal} className="btn-secondary flex-shrink-0">
        Registrar
    </button>
  </div>
);

export default BodyTrackingPanel;