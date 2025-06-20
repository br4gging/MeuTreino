// ARQUIVO COMPLETO, FINAL E VERIFICADO: src/components/MeasurementModal.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BodyMeasurement, CustomMeasurementField, UserMeasurementSource } from '../types/workout';
import { X, Plus, Trash2 } from 'lucide-react';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: BodyMeasurement) => Promise<void>;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [sources, setSources] = useState<UserMeasurementSource[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [activeCustomFields, setActiveCustomFields] = useState<CustomMeasurementField[]>([]);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
  const [availableCustomFields, setAvailableCustomFields] = useState<CustomMeasurementField[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('cm');

  const fetchData = async () => {
    const { data: sourcesData } = await supabase.from('user_measurement_sources').select('*');
    if (sourcesData) setSources(sourcesData);

    const { data: fieldsData } = await supabase.from('custom_measurement_fields').select('*');
    if (fieldsData) setAvailableCustomFields(fieldsData);
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setMeasuredAt(new Date().toISOString().split('T')[0]);
      setWeight('');
      setBodyFat('');
      setFieldValues({});
      setActiveCustomFields([]);
      setShowNewSourceInput(false);
      setNewSourceName('');
      setSelectedSource('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    let finalSource = selectedSource;

    if (showNewSourceInput) {
      if (!newSourceName.trim()) { alert("O nome da nova fonte não pode ser vazio."); setLoading(false); return; }
      finalSource = newSourceName.trim();
      const { data: existing } = await supabase.from('user_measurement_sources').select('id').eq('source_name', finalSource).single();
      if (!existing) {
        const { error: insertError } = await supabase.from('user_measurement_sources').insert({ source_name: finalSource });
        if (insertError) {
          alert("Erro ao criar a nova fonte.");
          setLoading(false);
          return;
        }
      }
    }
    if (!finalSource) { alert("Por favor, selecione ou crie uma fonte para a medição."); setLoading(false); return; }

    const weightValue = weight ? parseFloat(parseFloat(weight).toFixed(2)) : undefined;
    const bodyFatValue = bodyFat ? parseFloat(parseFloat(bodyFat).toFixed(2)) : undefined;

    if (bodyFatValue !== undefined && (bodyFatValue < 0 || bodyFatValue >= 100)) {
        alert("Valor inválido! O percentual de gordura deve ser entre 0 e 99.99.");
        setLoading(false); return;
    }
    if (weightValue !== undefined && (weightValue <= 0 || weightValue > 999)) {
        alert("Valor inválido! O peso deve ser maior que 0 e menor que 999.99.");
        setLoading(false); return;
    }

    const measurementData: BodyMeasurement = {
      measured_at: measuredAt,
      source: finalSource,
      weight_kg: weightValue,
      body_fat_percentage: bodyFatValue,
      details: fieldValues,
    };
    await onSave(measurementData);
    setLoading(false);
  };
  
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'CREATE_NEW') {
      setShowNewSourceInput(true);
      setSelectedSource('');
    } else {
      setShowNewSourceInput(false);
      setSelectedSource(value);
    }
  };
  
  const addFieldToForm = (field: CustomMeasurementField) => {
    if (!activeCustomFields.find(f => f.id === field.id)) {
      setActiveCustomFields([...activeCustomFields, field]);
    }
    setShowAddMenu(false);
  };

  const removeFieldFromForm = (fieldKey: string) => {
    setActiveCustomFields(activeCustomFields.filter(f => f.field_key !== fieldKey));
    const newValues = { ...fieldValues };
    delete newValues[fieldKey];
    setFieldValues(newValues);
  };

  const handleCreateNewField = async () => {
    if (!newFieldLabel.trim()) return alert("O nome do campo não pode ser vazio.");
    const newFieldKey = newFieldLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('custom_measurement_fields')
      .upsert({ user_id: user.id, field_key: newFieldKey, label: newFieldLabel, unit: newFieldUnit }, { onConflict: 'user_id,field_key' })
      .select().single();
    
    if (error) {
      alert("Erro ao criar/atualizar o campo: " + error.message);
    } else if (data) {
      await fetchData();
      addFieldToForm(data);
      setShowNewFieldForm(false);
      setNewFieldLabel('');
      setNewFieldUnit('cm');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const unselectedCustomFields = availableCustomFields.filter(f => !activeCustomFields.find(acf => acf.id === f.id));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Registrar Medidas</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Medição</label>
                <input type="date" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonte da Medição</label>
                {showNewSourceInput ? (
                    <div className="flex gap-2">
                        <input type="text" placeholder="Ex: Balança de casa" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" autoFocus />
                        <button onClick={() => setShowNewSourceInput(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300">Cancelar</button>
                    </div>
                ) : (
                    <select value={selectedSource} onChange={handleSourceChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                        <option value="" disabled>-- Selecione --</option>
                        {sources.map(s => <option key={s.id} value={s.source_name}>{s.source_name}</option>)}
                        <option value="CREATE_NEW" className="font-bold text-blue-600">+ Criar nova fonte</option>
                    </select>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label><input type="number" placeholder="85.5" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gordura Corporal (%)</label><input type="number" placeholder="15.2" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl" /></div>
            </div>
            <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-700">Medidas Personalizadas</h4>
                {activeCustomFields.map(field => (
                    <div key={field.id} className="flex items-end gap-2">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label} ({field.unit})</label>
                            <input type="number" value={fieldValues[field.field_key] || ''} onChange={(e) => setFieldValues(prev => ({ ...prev, [field.field_key]: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
                        </div>
                        <button onClick={() => removeFieldFromForm(field.field_key)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={20} /></button>
                    </div>
                ))}
                {activeCustomFields.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Nenhuma medida personalizada adicionada.</p>}
            </div>
            <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"><Plus size={16} /> Adicionar Medida</button>
                {showAddMenu && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                        {unselectedCustomFields.length > 0 ? (unselectedCustomFields.map(field => (<button key={field.id} onClick={() => addFieldToForm(field)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">{field.label}</button>))) : (<p className="px-4 py-2 text-sm text-gray-500">Todos os campos já foram adicionados.</p>)}
                        <button className="block w-full text-left px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 border-t" onClick={() => { setShowAddMenu(false); setShowNewFieldForm(true); }}>+ Criar Novo Campo...</button>
                    </div>
                )}
            </div>
            {showNewFieldForm && (
                <div className="p-4 bg-gray-50 rounded-lg mt-2 space-y-2 border">
                    <h5 className="font-bold">Criar Novo Campo</h5>
                    <div><label className="text-sm">Nome do Campo</label><input type="text" placeholder="Ex: Circunferência da Coxa" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="text-sm">Unidade</label><input type="text" placeholder="Ex: cm" value={newFieldUnit} onChange={(e) => setNewFieldUnit(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    <div className="flex gap-2"><button onClick={handleCreateNewField} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400">{loading ? '...' : 'Criar'}</button><button onClick={() => setShowNewFieldForm(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button></div>
                </div>
            )}
        </div>

        <div className="flex gap-4 mt-8">
            <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100">Cancelar</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar Medidas'}</button>
        </div>
      </div>
    </div>
  );
};