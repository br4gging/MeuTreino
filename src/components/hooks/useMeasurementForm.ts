// ARQUIVO: src/components/hooks/useMeasurementForm.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { BodyMeasurement, CustomMeasurementField, UserMeasurementSource } from '../../types/workout';
import { useAppContext } from '../../context/AppContext';

interface UseMeasurementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (measurement: BodyMeasurement) => Promise<void>;
  measurementToEdit?: BodyMeasurement | null; // <-- Prop para edição
}

export function useMeasurementForm({ isOpen, onClose, onSave, measurementToEdit }: UseMeasurementFormProps) {
  const { showToast, showConfirmation, setLoading: setGlobalLoading } = useAppContext();
  const [localLoading, setLocalLoading] = useState(true);
  const isEditMode = !!measurementToEdit;
  
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [sources, setSources] = useState<UserMeasurementSource[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [showNewSourceInput, setShowNewSourceInput] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [activeCustomFields, setActiveCustomFields] = useState<CustomMeasurementField[]>([]);
  const [availableCustomFields, setAvailableCustomFields] = useState<CustomMeasurementField[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState('cm');
  
  const resetForm = useCallback(() => {
    setMeasuredAt(new Date().toISOString().split('T')[0]);
    setWeight('');
    setBodyFat('');
    setFieldValues({});
    setActiveCustomFields([]);
    setShowNewSourceInput(false);
    setNewSourceName('');
    setSelectedSource('');
    setShowAddMenu(false);
    setShowNewFieldForm(false);
    setErrors({});
  }, []);

  const populateForm = useCallback((measurement: BodyMeasurement, allFields: CustomMeasurementField[]) => {
      setMeasuredAt(new Date(measurement.measured_at).toISOString().split('T')[0]);
      setWeight(measurement.weight_kg?.toString() || '');
      setBodyFat(measurement.body_fat_percentage?.toString() || '');
      setSelectedSource(measurement.source);

      if (measurement.details) {
          const detailsValues: { [key: string]: string } = {};
          const activeFields: CustomMeasurementField[] = [];
          
          Object.keys(measurement.details).forEach(key => {
              const fieldMeta = allFields.find(f => f.field_key === key);
              if (fieldMeta) {
                  activeFields.push(fieldMeta);
                  detailsValues[key] = measurement.details![key].toString();
              }
          });
          setActiveCustomFields(activeFields);
          setFieldValues(detailsValues);
      }
  }, []);

  const fetchData = useCallback(async () => {
    setLocalLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocalLoading(false);
      return;
    }
    const [sourcesRes, fieldsRes] = await Promise.all([
      supabase.from('user_measurement_sources').select('*').eq('user_id', user.id),
      supabase.from('custom_measurement_fields').select('*').eq('user_id', user.id)
    ]);

    const allSources = sourcesRes.data || [];
    const allFields = fieldsRes.data || [];

    setSources(allSources);
    setAvailableCustomFields(allFields);

    if (isEditMode && measurementToEdit) {
        populateForm(measurementToEdit, allFields);
    }
    
    setLocalLoading(false);
  }, [isEditMode, measurementToEdit, populateForm]);

  useEffect(() => {
    if (isOpen) {
      if (!isEditMode) {
        resetForm();
      }
      fetchData();
    }
  }, [isOpen, isEditMode, fetchData, resetForm]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (showNewSourceInput && !newSourceName.trim()) {
      newErrors.source = 'O nome da nova fonte não pode ser vazio.';
    }
    if (!showNewSourceInput && !selectedSource) {
      newErrors.source = 'Selecione ou crie uma fonte para a medição.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setGlobalLoading(true);
    let finalSource = selectedSource;
    if (showNewSourceInput && newSourceName.trim()) {
      finalSource = newSourceName.trim();
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
        const { error: insertError } = await supabase.from('user_measurement_sources').insert({ source_name: finalSource, user_id: user.id });
        if (insertError) {
          showToast('Erro ao criar a nova fonte.', { type: 'error' });
          setGlobalLoading(false);
          return;
        }
      }
    }

    const measurementData: BodyMeasurement = {
      id: isEditMode ? measurementToEdit?.id : undefined,
      measured_at: measuredAt,
      source: finalSource,
      weight_kg: weight ? parseFloat(weight) : undefined,
      body_fat_percentage: bodyFat ? parseFloat(bodyFat) : undefined,
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
      showToast('Erro ao criar o campo: ' + error.message, { type: 'error' });
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

  const handleDeleteSource = async (sourceId: string) => {
    showConfirmation("Apagar Fonte?", "Tem certeza que quer apagar esta fonte de medição? Esta ação não pode ser desfeita.", async () => {
        setLocalLoading(true);
        const { error } = await supabase.from('user_measurement_sources').delete().eq('id', sourceId);
        if (error) {
            showToast("Erro ao apagar a fonte: " + error.message, { type: 'error' });
        } else {
            showToast("Fonte apagada com sucesso.");
            await fetchData();
            setSelectedSource('');
        }
        setLocalLoading(false);
    });
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    showConfirmation("Apagar Campo?", "Tem certeza que quer apagar este campo personalizado?", async () => {
        setLocalLoading(true);
        const { data: fieldToDelete } = await supabase.from('custom_measurement_fields').select('field_key').eq('id', fieldId).single();
        const { error } = await supabase.from('custom_measurement_fields').delete().eq('id', fieldId);

        if (error) {
            showToast("Erro ao apagar o campo: " + error.message, { type: 'error' });
        } else {
            showToast("Campo apagado com sucesso.");
            await fetchData();
            if(fieldToDelete) removeFieldFromForm(fieldToDelete.field_key);
        }
        setLocalLoading(false);
    });
  };

  const unselectedCustomFields = availableCustomFields.filter(f => !activeCustomFields.find(acf => acf.id === f.id));

  return {
    measuredAt, setMeasuredAt,
    weight, setWeight,
    bodyFat, setBodyFat,
    sources, selectedSource, setSelectedSource,
    showNewSourceInput, newSourceName, setNewSourceName, setShowNewSourceInput,
    handleSourceChange, handleSave, localLoading,
    activeCustomFields, fieldValues, setFieldValues,
    addFieldToForm, removeFieldFromForm,
    showAddMenu, setShowAddMenu,
    showNewFieldForm, setShowNewFieldForm,
    newFieldLabel, setNewFieldLabel,
    newFieldUnit, setNewFieldUnit,
    handleCreateNewField,
    unselectedCustomFields,
    errors,
    availableCustomFields,
    handleDeleteSource,
    handleDeleteCustomField,
    isEditMode,
  };
}