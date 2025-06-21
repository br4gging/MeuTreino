// ARQUIVO: src/components/MeasurementModal.tsx (100% Completo e Funcional)

import React, { useRef, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useMeasurementForm } from './hooks/useMeasurementForm';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: any) => Promise<void>;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    measuredAt, setMeasuredAt,
    weight, setWeight,
    bodyFat, setBodyFat,
    sources, selectedSource, setSelectedSource,
    showNewSourceInput, newSourceName, setNewSourceName,
    handleSourceChange, handleSave, localLoading, globalLoading,
    activeCustomFields, fieldValues, setFieldValues,
    availableCustomFields, addFieldToForm, removeFieldFromForm,
    showAddMenu, setShowAddMenu,
    showNewFieldForm, setShowNewFieldForm,
    newFieldLabel, setNewFieldLabel,
    newFieldUnit, setNewFieldUnit,
    handleCreateNewField,
    unselectedCustomFields,
    errors
  } = useMeasurementForm({ isOpen, onClose, onSave });

  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} tabIndex={-1} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl transition-all outline-none" >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-2xl font-bold text-gray-800">Registar Medidas</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full" aria-label="Fechar modal"><X size={24} /></button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Medição</label>
            <input type="date" value={measuredAt} onChange={e => setMeasuredAt(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
          </div>
          <SourceField
            sources={sources}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            showNewSourceInput={showNewSourceInput}
            newSourceName={newSourceName}
            setNewSourceName={setNewSourceName}
            handleSourceChange={handleSourceChange}
            error={errors.source}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input type="number" placeholder="85.5" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              {errors.weight && <span className="text-xs text-red-600">{errors.weight}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gordura Corporal (%)</label>
              <input type="number" placeholder="15.2" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              {errors.bodyFat && <span className="text-xs text-red-600">{errors.bodyFat}</span>}
            </div>
          </div>
          <CustomFieldsSection
            activeCustomFields={activeCustomFields}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            removeFieldFromForm={removeFieldFromForm}
            showAddMenu={showAddMenu}
            setShowAddMenu={setShowAddMenu}
            availableCustomFields={availableCustomFields}
            addFieldToForm={addFieldToForm}
            showNewFieldForm={showNewFieldForm}
            setShowNewFieldForm={setShowNewFieldForm}
            newFieldLabel={newFieldLabel}
            setNewFieldLabel={setNewFieldLabel}
            newFieldUnit={newFieldUnit}
            setNewFieldUnit={setNewFieldUnit}
            handleCreateNewField={handleCreateNewField}
            unselectedCustomFields={unselectedCustomFields}
            errors={errors}
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60" disabled={globalLoading || localLoading}>Salvar</button>
        </div>
      </div>
    </div>
  );
};

// Subcomponente: Campo de seleção/criação de fonte
function SourceField({
  sources, selectedSource, setSelectedSource, showNewSourceInput, newSourceName, setNewSourceName, handleSourceChange, error
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte da Medição</label>
      {showNewSourceInput ? (
        <div className="flex gap-2">
          <input type="text" placeholder="Ex: Balança de casa" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" autoFocus />
          <button onClick={() => { setNewSourceName(''); setSelectedSource(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">Cancelar</button>
        </div>
      ) : (
        <select value={selectedSource} onChange={handleSourceChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
          <option value="" disabled>-- Selecione --</option>
          {sources.map((s: any) => <option key={s.id} value={s.source_name}>{s.source_name}</option>)}
          <option value="CREATE_NEW" className="font-bold text-blue-600">+ Criar nova fonte</option>
        </select>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

// Subcomponente: Campos personalizados
function CustomFieldsSection({
  activeCustomFields, fieldValues, setFieldValues, removeFieldFromForm,
  showAddMenu, setShowAddMenu, availableCustomFields, addFieldToForm,
  showNewFieldForm, setShowNewFieldForm, newFieldLabel, setNewFieldLabel,
  newFieldUnit, setNewFieldUnit, handleCreateNewField, unselectedCustomFields, errors
}: any) {
  return (
    <div className="border-t pt-4 space-y-3">
      <h4 className="font-semibold text-gray-700">Medidas Personalizadas</h4>
      {activeCustomFields.map((field: any) => (
        <div key={field.id} className="flex items-end gap-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} ({field.unit})</label>
            <input type="number" value={fieldValues[field.field_key] || ''} onChange={e => setFieldValues((prev: any) => ({ ...prev, [field.field_key]: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <button onClick={() => removeFieldFromForm(field.field_key)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={20} /></button>
        </div>
      ))}
      {activeCustomFields.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Nenhuma medida personalizada adicionada.</p>}
      <div className="relative">
        <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"><Plus size={16} /> Adicionar Medida</button>
        {showAddMenu && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
            {unselectedCustomFields.length > 0 ? (
              unselectedCustomFields.map((field: any) => (
                <button key={field.id} onClick={() => addFieldToForm(field)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">{field.label}</button>
              ))
            ) : (
              <p className="px-4 py-2 text-sm text-gray-500">Todos os campos já foram adicionados.</p>
            )}
            <button className="block w-full text-left px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 border-t" onClick={() => { setShowAddMenu(false); setShowNewFieldForm(true); }}>+ Criar Novo Campo...</button>
          </div>
        )}
      </div>
      {showNewFieldForm && (
        <div className="p-4 bg-gray-50 rounded-lg mt-2 space-y-2 border">
          <h5 className="font-bold">Criar Novo Campo</h5>
          <div><label className="text-sm">Nome do Campo</label><input type="text" placeholder="Ex: Circunferência da Coxa" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} className="w-full p-2 border rounded-md" /></div>
          <div><label className="text-sm">Unidade</label><input type="text" placeholder="Ex: cm" value={newFieldUnit} onChange={e => setNewFieldUnit(e.target.value)} className="w-full p-2 border rounded-md" /></div>
          {errors.newFieldLabel && <span className="text-xs text-red-600">{errors.newFieldLabel}</span>}
          <div className="flex gap-2"><button onClick={handleCreateNewField} className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400">Criar</button><button onClick={() => setShowNewFieldForm(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button></div>
        </div>
      )}
    </div>
  );
}

// Subcomponentes internos (SourceField, CustomFieldsSection) e o hook useMeasurementForm devem ser implementados em arquivos separados ou abaixo neste arquivo.
