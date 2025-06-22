import React, { useState } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { useMeasurementForm } from './hooks/useMeasurementForm';
import { CustomMeasurementField, UserMeasurementSource } from '../types/workout';

// --- Subcomponentes movidos para fora para melhor performance e clareza ---

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-black/20 border-2 border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-primary/10 transition-all" />
);

interface ManageItemsModalProps {
    title: string;
    items: (UserMeasurementSource | CustomMeasurementField)[];
    onClose: () => void;
    onDelete: (id: string) => void;
    displayField: 'source_name' | 'label';
}

const ManageItemsModal: React.FC<ManageItemsModalProps> = ({ title, items, onClose, onDelete, displayField }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
        <div className="card max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {items.length > 0 ? items.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-bg-secondary p-3 rounded-lg">
                        <span className="text-text-secondary">{item[displayField]}</span>
                        <button onClick={() => onDelete(item.id)} className="p-2 text-text-muted hover:text-error"><Trash2 size={16}/></button>
                    </div>
                )) : <p className="text-text-muted text-center py-4">Nenhum item para gerir.</p>}
            </div>
             <div className="flex justify-end mt-4">
                <button onClick={onClose} className="btn-secondary">Fechar</button>
            </div>
        </div>
    </div>
);

// --- Componente Principal do Modal ---

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: any) => Promise<void>;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    measuredAt, setMeasuredAt, weight, setWeight, bodyFat, setBodyFat,
    sources, selectedSource, showNewSourceInput, newSourceName, setNewSourceName, setShowNewSourceInput, handleSourceChange,
    handleSave, localLoading, errors,
    activeCustomFields, fieldValues, setFieldValues, addFieldToForm, removeFieldFromForm,
    availableCustomFields, unselectedCustomFields, showAddMenu, setShowAddMenu,
    showNewFieldForm, setShowNewFieldForm, newFieldLabel, setNewFieldLabel, newFieldUnit, setNewFieldUnit, handleCreateNewField,
    handleDeleteSource, handleDeleteCustomField,
  } = useMeasurementForm({ isOpen, onClose, onSave });

  const [manageSourcesOpen, setManageSourcesOpen] = useState(false);
  const [manageFieldsOpen, setManageFieldsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-2xl font-bold text-text-primary">Registar Medidas</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <InputField type="date" value={measuredAt} onChange={e => setMeasuredAt(e.target.value)} />
            
            {/* Bloco da Fonte de Medição */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-text-secondary">Fonte da Medição</label>
                    <button onClick={() => setManageSourcesOpen(true)} className="text-xs text-text-muted hover:text-primary flex items-center gap-1"><Settings size={12}/> Gerir</button>
                </div>
                {showNewSourceInput ? (
                    <div className="flex gap-2">
                        <InputField type="text" placeholder="Ex: Balança de casa" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} autoFocus />
                        <button onClick={() => setShowNewSourceInput(false)} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
                    </div>
                ) : (
                    <select value={selectedSource} onChange={handleSourceChange} className="w-full px-4 py-3 bg-black/20 border-2 border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary appearance-none">
                        <option value="" disabled>-- Selecione --</option>
                        {sources.map((s) => <option key={s.id} value={s.source_name}>{s.source_name}</option>)}
                        <option value="CREATE_NEW" className="font-bold text-accent bg-bg-card">+ Criar nova fonte</option>
                    </select>
                )}
                {errors.source && <span className="text-xs text-red-600">{errors.source}</span>}
            </div>

            {/* Campos de Peso e Gordura */}
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-text-secondary mb-1">Peso (kg)</label><InputField type="number" placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-text-secondary mb-1">Gordura (%)</label><InputField type="number" placeholder="0.0" value={bodyFat} onChange={e => setBodyFat(e.target.value)} /></div>
            </div>

            {/* Medidas Personalizadas */}
            <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between items-center"><h4 className="font-semibold text-text-primary">Medidas Personalizadas</h4><button onClick={() => setManageFieldsOpen(true)} className="text-xs text-text-muted hover:text-primary flex items-center gap-1"><Settings size={12}/> Gerir</button></div>
                {activeCustomFields.map((field) => (
                    <div key={field.id} className="flex items-end gap-2">
                        <div className="flex-grow"><label className="block text-sm font-medium text-text-secondary mb-1">{field.label} ({field.unit})</label><InputField type="number" value={fieldValues[field.field_key] || ''} onChange={e => setFieldValues(prev => ({ ...prev, [field.field_key]: e.target.value }))} /></div>
                        <button onClick={() => removeFieldFromForm(field.field_key)} className="p-3 text-text-muted hover:text-error bg-black/20 rounded-xl"><Trash2 size={20} /></button>
                    </div>
                ))}

                <div className="relative">
                    <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black/20 text-text-secondary font-semibold rounded-xl hover:bg-white/10"><Plus size={16} /> Adicionar Medida</button>
                    {showAddMenu && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-bg-card border border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                            {unselectedCustomFields.map((field) => (<button key={field.id} onClick={() => addFieldToForm(field)} className="block w-full text-left px-4 py-2 text-text-secondary hover:bg-white/5">{field.label}</button>))}
                            <button className="block w-full text-left px-4 py-2 text-accent font-bold hover:bg-accent/10 border-t border-white/10" onClick={() => { setShowAddMenu(false); setShowNewFieldForm(true); }}>+ Criar Novo Campo...</button>
                        </div>
                    )}
                </div>
                
                {showNewFieldForm && (
                  <div className="p-4 bg-black/20 rounded-lg mt-2 space-y-3 border border-white/10">
                      <h5 className="font-bold text-text-primary">Criar Novo Campo</h5>
                      <div><label className="text-sm text-text-secondary">Nome do Campo</label><InputField type="text" placeholder="Ex: Circunferência da Coxa" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} /></div>
                      <div><label className="text-sm text-text-secondary">Unidade</label><InputField type="text" placeholder="Ex: cm" value={newFieldUnit} onChange={e => setNewFieldUnit(e.target.value)} /></div>
                      {errors.newFieldLabel && <span className="text-xs text-red-600">{errors.newFieldLabel}</span>}
                      <div className="flex gap-2"><button onClick={handleCreateNewField} className="btn bg-success text-white">Criar</button><button onClick={() => setShowNewFieldForm(false)} className="btn-secondary">Cancelar</button></div>
                  </div>
                )}
            </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 border-t border-white/10 pt-4">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary" disabled={localLoading}>Salvar</button>
        </div>
      </div>
      
      {manageSourcesOpen && <ManageItemsModal title="Gerir Fontes" items={sources} onClose={() => setManageSourcesOpen(false)} onDelete={handleDeleteSource} displayField="source_name" />}
      {manageFieldsOpen && <ManageItemsModal title="Gerir Campos" items={availableCustomFields} onClose={() => setManageFieldsOpen(false)} onDelete={handleDeleteCustomField} displayField="label" />}
    </div>
  );
};