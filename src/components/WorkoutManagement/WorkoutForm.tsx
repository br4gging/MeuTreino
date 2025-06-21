import React from 'react';
import { Exercise, SetTemplate } from '../../types/workout';

interface WorkoutFormProps {
  workoutName: string;
  exercises: Exercise[];
  onNameChange: (name: string) => void;
  onExerciseChange: (exerciseId: string, field: string, value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onAddSet: (exerciseId: string, type: 'warmup' | 'work') => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onSetChange: (exerciseId: string, setId: string, field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  workoutName,
  exercises,
  onNameChange,
  onExerciseChange,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onSetChange,
  onSave,
  onCancel,
  isEditing
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Treino' : 'Criar Novo Treino'}</h3>
      <button onClick={onCancel} className="text-gray-600 hover:text-gray-800 transition-colors">✕</button>
    </div>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Treino</label>
        <input type="text" value={workoutName} onChange={e => onNameChange(e.target.value)} placeholder="Ex: Treino A - Peito e Tríceps" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Exercícios</h4>
          <button onClick={onAddExercise} className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2">+ Adicionar Exercício</button>
        </div>
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-blue-700">Exercício {index + 1}</span>
                <button onClick={() => onRemoveExercise(exercise.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">🗑️</button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Exercício</label>
                <input type="text" value={exercise.name} onChange={e => onExerciseChange(exercise.id, 'name', e.target.value)} placeholder="Ex: Supino Reto com Halteres" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-3">
                {exercise.sets && exercise.sets.map((set: SetTemplate) => (
                  <div key={set.id} className={`p-3 rounded-lg border ${set.type === 'warmup' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-center">
                      <h5 className="font-semibold text-sm">{set.type === 'warmup' ? 'Série de Aquecimento' : 'Série de Trabalho'}</h5>
                      <button onClick={() => onRemoveSet(exercise.id, set.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Repetições</label>
                        <input type="text" value={set.reps} onChange={e => onSetChange(exercise.id, set.id, 'reps', e.target.value)} placeholder="8-12" className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{set.type === 'warmup' ? '% Carga' : 'RIR'}</label>
                        <input type="text" value={set.value} onChange={e => onSetChange(exercise.id, set.id, 'value', e.target.value)} placeholder={set.type === 'warmup' ? '50-60' : '2-3'} className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Descanso (s)</label>
                        <input type="text" value={set.restTime} onChange={e => onSetChange(exercise.id, set.id, 'restTime', e.target.value)} placeholder="90" className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => onAddSet(exercise.id, 'warmup')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1 px-2 bg-yellow-400/50 text-yellow-800 rounded-md hover:bg-yellow-400/80">+ Aquecimento</button>
                <button onClick={() => onAddSet(exercise.id, 'work')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1 px-2 bg-blue-400/50 text-blue-800 rounded-md hover:bg-blue-400/80">+ Trabalho</button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Exercício</label>
                <input type="text" value={exercise.notes} onChange={e => onExerciseChange(exercise.id, 'notes', e.target.value)} placeholder="Ex: Focar na contração, cadência 2-1-2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button onClick={onSave} disabled={!workoutName.trim() || exercises.length === 0} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50">{isEditing ? 'Salvar Alterações' : 'Criar Treino'}</button>
        <button onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
      </div>
    </div>
  </div>
);

export default WorkoutForm; 