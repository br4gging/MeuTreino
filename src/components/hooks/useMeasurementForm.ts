import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BodyMeasurement, CustomMeasurementField, UserMeasurementSource } from '../../types/workout';
import { useAppContext } from '../../context/AppContext';

interface UseMeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: BodyMeasurement) => Promise<void>;
}

export function useMeasurementForm({ isOpen, onClose, onSave }: UseMeasurementFormProps) {
  const { showToast, setLoading: setGlobalLoading, loading: globalLoading } = useAppContext();
  const [localLoading, setLocalLoading] = useState(false);
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchData = async () => {
    setLocalLoading(true);
    const { data: sourcesData } = await supabase.from('user_measurement_sources').select('*');
    if (sourcesData) setSources(sourcesData);
    const { data: fieldsData } = await supabase.from('custom_measurement_fields').select('*');
    if (fieldsData) setAvailableCustomFields(fieldsData);
    setLocalLoading(false);
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
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (showNewSourceInput && !newSourceName.trim()) {
      newErrors.source = 'O nome da nova fonte não pode ser vazio.';
    }
    if (!showNewSourceInput && !selectedSource) {
      newErrors.source = 'Por favor, selecione ou crie uma fonte para a medição.';
    }
    if (weight && (parseFloat(weight) <= 0 || parseFloat(weight) > 999)) {
      newErrors.weight = 'Peso deve ser maior que 0 e menor que 999.99.';
    }
    if (bodyFat && (parseFloat(bodyFat) < 0 || parseFloat(bodyFat) >= 100)) {
      newErrors.bodyFat = 'Percentual de gordura deve ser entre 0 e 99.99.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setGlobalLoading(true);
    let finalSource = selectedSource;
    if (showNewSourceInput) {
      finalSource = newSourceName.trim();
      const { data: existing } = await supabase.from('user_measurement_sources').select('id').eq('source_name', finalSource).single();
      if (!existing) {
        const { error: insertError } = await supabase.from('user_measurement_sources').insert({ source_name: finalSource });
        if (insertError) {
          showToast('Erro ao criar a nova fonte.', { type: 'error' });
          setGlobalLoading(false);
          return;
        }
      }
    }
    const weightValue = weight ? parseFloat(parseFloat(weight).toFixed(2)) : undefined;
    const bodyFatValue = bodyFat ? parseFloat(parseFloat(bodyFat).toFixed(2)) : undefined;
    const measurementData: BodyMeasurement = {
      measured_at: measuredAt,
      source: finalSource,
      weight_kg: weightValue,
      body_fat_percentage: bodyFatValue,
      details: fieldValues,
    };
    await onSave(measurementData);
    onClose();
    setGlobalLoading(false);
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
    if (!newFieldLabel.trim()) {
      setErrors(prev => ({ ...prev, newFieldLabel: 'O nome do campo não pode ser vazio.' }));
      return;
    }
    const newFieldKey = newFieldLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    setGlobalLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGlobalLoading(false); return; }
    const { data, error } = await supabase.from('custom_measurement_fields').upsert({ user_id: user.id, field_key: newFieldKey, label: newFieldLabel, unit: newFieldUnit }, { onConflict: 'user_id,field_key' }).select().single();
    if (error) {
      showToast('Erro ao criar/atualizar o campo: ' + error.message, { type: 'error' });
    } else if (data) {
      await fetchData();
      addFieldToForm(data);
      setShowNewFieldForm(false);
      setNewFieldLabel('');
      setNewFieldUnit('cm');
      showToast('Campo criado com sucesso!');
    }
    setGlobalLoading(false);
  };

  const unselectedCustomFields = availableCustomFields.filter(f => !activeCustomFields.find(acf => acf.id === f.id));

  return {
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
  };
} 