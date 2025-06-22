import React from 'react';
import { Exercise, SetTemplate } from '../../types/workout';
import { X, Plus, Trash2 } from 'lucide-react';

interface WorkoutFormProps {
  workoutName: string;
  exercises: Exercise[];
  onNameChange: (name: string) => void;
  onExerciseChange: (exerciseId: string, field: string, value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string, type: 'warmup' | 'work') => void;
  onRemoveSet: (exerciseId: string, setId: string) => void; // <<< Mantenha essa linha
  onSetChange: (exerciseId: string, setId: string, field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full px-4 py-3 bg-black/20 border-2 border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-primary/10 transition-all"
  />
);


const WorkoutForm: React.FC<WorkoutFormProps> = ({
  workoutName,
  exercises,
  onNameChange,
  onExerciseChange,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet, // <<< Mantenha essa linha na desestruturação
  onSetChange,
  onSave,
  onCancel,
  isEditing
}) => {
  // Adicione este console.log aqui
  console.log('WorkoutForm props:', { onRemoveSet });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-text-primary">{isEditing ? 'Editar Treino' : 'Criar Novo Treino'}</h3>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10"><X size={20} /></button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Nome do Treino</label>
          <InputField type="text" value={workoutName} onChange={e => onNameChange(e.target.value)} placeholder="Ex: Treino A - Peito e Tríceps" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-text-primary">Exercícios</h4>
            <button onClick={onAddExercise} className="btn bg-success text-white flex items-center gap-2"><Plus size={16}/> Adicionar Exercício</button>
          </div>
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-bg-secondary border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-primary">Exercício {index + 1}</span>
                  <button onClick={() => onRemoveExercise(exercise.id)} className="p-1 text-text-muted hover:text-error rounded-full transition-colors"><Trash2 size={16} /></button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Exercício</label>
                  <InputField type="text" value={exercise.name} onChange={e => onExerciseChange(exercise.id, 'name', e.target.value)} placeholder="Ex: Supino Reto com Halteres" />
                </div>
                <div className="space-y-3">
                  {exercise.sets && exercise.sets.map((set: SetTemplate) => (
                    <div key={set.id} className={`p-3 rounded-lg border ${set.type === 'warmup' ? 'bg-yellow-400/10 border-yellow-400/20' : 'bg-primary/10 border-primary/20'}`}>
                      <div className="flex justify-between items-center">
                        <h5 className={`font-semibold text-sm ${set.type === 'warmup' ? 'text-yellow-400' : 'text-primary'}`}>{set.type === 'warmup' ? 'Série de Aquecimento' : 'Série de Trabalho'}</h5>
                        <button onClick={() => onRemoveSet(exercise.id, set.id)} className="text-text-muted hover:text-error"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <input type="text" value={set.reps} onChange={e => onSetChange(exercise.id, set.id, 'reps', e.target.value)} placeholder="Reps" className="w-full px-2 py-1 bg-black/20 border border-white/10 rounded-md text-center text-sm" />
                        <input type="text" value={set.value} onChange={e => onSetChange(exercise.id, set.id, 'value', e.target.value)} placeholder={set.type === 'warmup' ? '% Carga' : 'RIR'} className="w-full px-2 py-1 bg-black/20 border border-white/10 rounded-md text-center text-sm" />
                        <input type="text" value={set.restTime} onChange={e => onSetChange(exercise.id, set.id, 'restTime', e.target.value)} placeholder="Descanso" className="w-full px-2 py-1 bg-black/20 border border-white/10 rounded-md text-center text-sm" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => onAddSet(exercise.id, 'warmup')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1.5 px-2 bg-yellow-400/20 text-yellow-400 rounded-md hover:bg-yellow-400/30 font-semibold">+ Aquecimento</button>
                  <button onClick={() => onAddSet(exercise.id, 'work')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1.5 px-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 font-semibold">+ Trabalho</button>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Observações</label>
                  <InputField type="text" value={exercise.notes || ''} onChange={e => onExerciseChange(exercise.id, 'notes', e.target.value)} placeholder="Ex: Focar na contração, cadência 2-1-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onSave} disabled={!workoutName.trim() || exercises.length === 0} className="flex-1 btn-primary disabled:opacity-50">{isEditing ? 'Salvar Alterações' : 'Criar Treino'}</button>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;