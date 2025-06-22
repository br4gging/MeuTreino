import React from 'react';
import { UserWorkout } from '../../types/workout';
import { List, Plus, Edit, Trash2 } from 'lucide-react';

interface UserWorkoutsListProps {
  userWorkouts: UserWorkout[];
  onEdit: (workout: UserWorkout) => void;
  onDelete: (workout: UserWorkout) => void;
  onCreate: () => void;
}

const UserWorkoutsList: React.FC<UserWorkoutsListProps> = ({ userWorkouts, onEdit, onDelete, onCreate }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-secondary-gradient rounded-lg flex items-center justify-center text-white"><List size={24} /></div>
        <div>
            <h3 className="text-xl font-bold text-text-primary">Os Meus Treinos</h3>
            <p className="text-sm text-text-muted">Seus modelos de treino personalizados</p>
        </div>
      </div>
      <button onClick={onCreate} className="btn-primary flex items-center gap-2"><Plus size={16}/> Novo Treino</button>
    </div>
    {userWorkouts.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🏋️</div>
        <h4 className="text-lg font-semibold text-text-primary mb-2">Nenhum treino criado</h4>
        <p className="text-text-muted">Crie seu primeiro treino personalizado clicando em "Novo Treino".</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userWorkouts.map(workout => (
          <div key={workout.id} className="bg-bg-secondary rounded-xl p-4 border border-white/10 transition-all hover:border-primary">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-text-primary">{workout.name}</h4>
              <div className="flex gap-2">
                <button onClick={() => onEdit(workout)} className="p-2 text-text-muted hover:text-primary transition-colors"><Edit size={16}/></button>
                <button onClick={() => onDelete(workout)} className="p-2 text-text-muted hover:text-error transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
            <p className="text-sm text-text-muted">{Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercícios</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default UserWorkoutsList;