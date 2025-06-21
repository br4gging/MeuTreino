import React from 'react';
import { UserWorkout } from '../../types/workout';

interface UserWorkoutsListProps {
  userWorkouts: UserWorkout[];
  onEdit: (workout: UserWorkout) => void;
  onDelete: (workout: UserWorkout) => void;
  onCreate: () => void;
}

const UserWorkoutsList: React.FC<UserWorkoutsListProps> = ({ userWorkouts, onEdit, onDelete, onCreate }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800">Os Meus Treinos</h3>
      <button onClick={onCreate} className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all flex items-center gap-2">+ Novo Treino</button>
    </div>
    {userWorkouts.length === 0 ? (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">🏋️</div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Nenhum treino criado</h4>
        <p className="text-gray-600">Crie o seu primeiro treino personalizado</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userWorkouts.map(workout => (
          <div key={workout.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{workout.name}</h4>
              <div className="flex gap-2">
                <button onClick={() => onEdit(workout)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                <button onClick={() => onDelete(workout)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercícios</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default UserWorkoutsList; 