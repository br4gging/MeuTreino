import { WorkoutTemplate, WeekProgression } from '../types/workout';

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'training-a',
    name: 'TREINO A (FORÇA)',
    type: 'strength',
    exercises: [
      {
        id: 'squat',
        name: 'Agachamento (Barra)',
        warmupSets: 2,
        workSets: 3,
        reps: '6-10',
        rpe: '7-9',
        lastWeight: 80,
        completed: 0,
        total: 5,
        restTime: 120
      },
      {
        id: 'bench-press',
        name: 'Supino Reto (Barra ou Halteres)',
        warmupSets: 2,
        workSets: 3,
        reps: '6-10',
        rpe: '7-9',
        lastWeight: 70,
        completed: 0,
        total: 5,
        restTime: 120
      },
      {
        id: 'bent-row',
        name: 'Remada Curvada (Barra ou Halteres)',
        warmupSets: 2,
        workSets: 3,
        reps: '8-12',
        rpe: '7-9',
        lastWeight: 60,
        completed: 0,
        total: 5,
        restTime: 90
      },
      {
        id: 'shoulder-press',
        name: 'Desenvolvimento Ombro (Halteres ou Máquina)',
        warmupSets: 1,
        workSets: 3,
        reps: '8-12',
        rpe: '7-9',
        lastWeight: 25,
        completed: 0,
        total: 4,
        restTime: 90
      },
      {
        id: 'leg-curl',
        name: 'Leg Curl (Máquina)',
        warmupSets: 1,
        workSets: 3,
        reps: '10-15',
        rpe: '7-9',
        lastWeight: 40,
        completed: 0,
        total: 4,
        restTime: 75
      },
      {
        id: 'bicep-curl',
        name: 'Bíceps Curl (Barra ou Halteres)',
        warmupSets: 1,
        workSets: 3,
        reps: '10-15',
        rpe: '7-9',
        lastWeight: 15,
        completed: 0,
        total: 4,
        restTime: 60
      }
    ]
  },
  {
    id: 'training-b',
    name: 'TREINO B (FORÇA)',
    type: 'strength',
    exercises: [
      {
        id: 'deadlift',
        name: 'Levantamento Terra (Convencional ou RDL)',
        warmupSets: 2,
        workSets: 3,
        reps: '4-8',
        rpe: '7-9',
        lastWeight: 100,
        completed: 0,
        total: 5,
        restTime: 150
      },
      {
        id: 'incline-press',
        name: 'Press Inclinado (Halteres ou Máquina)',
        warmupSets: 2,
        workSets: 3,
        reps: '8-12',
        rpe: '7-9',
        lastWeight: 30,
        completed: 0,
        total: 5,
        restTime: 120
      },
      {
        id: 'lat-pulldown',
        name: 'Puxada Alta (Lat Pulldown)',
        warmupSets: 1,
        workSets: 3,
        reps: '8-12',
        rpe: '7-9',
        lastWeight: 55,
        completed: 0,
        total: 4,
        restTime: 90
      },
      {
        id: 'leg-press',
        name: 'Leg Press ou Agachamento Búlgaro',
        warmupSets: 1,
        workSets: 3,
        reps: '10-15',
        rpe: '7-9',
        lastWeight: 120,
        completed: 0,
        total: 4,
        restTime: 90
      },
      {
        id: 'lateral-raise',
        name: 'Elevação Lateral (Halteres)',
        warmupSets: 1,
        workSets: 3,
        reps: '12-15',
        rpe: '7-9',
        lastWeight: 8,
        completed: 0,
        total: 4,
        restTime: 60
      },
      {
        id: 'tricep-pushdown',
        name: 'Tríceps Pushdown (Corda ou Barra)',
        warmupSets: 1,
        workSets: 3,
        reps: '12-15',
        rpe: '7-9',
        lastWeight: 35,
        completed: 0,
        total: 4,
        restTime: 60
      }
    ]
  }
];

export const cardioTemplate = {
  id: 'cardio-5k',
  name: 'CORRIDA',
  type: 'cardio' as const,
  distance: 5,
  targetTime: 30,
  description: 'Corrida de 5km (Leve a Moderada) - Foco na recuperação ativa e condicionamento aeróbico'
};

export const weeklySchedule = [
  { day: 1, workout: 'training-a', name: 'SEGUNDA-FEIRA' }, // Monday
  { day: 2, workout: 'cardio-5k', name: 'TERÇA-FEIRA' },    // Tuesday
  { day: 3, workout: 'training-b', name: 'QUARTA-FEIRA' },  // Wednesday
  { day: 4, workout: 'cardio-5k', name: 'QUINTA-FEIRA' },   // Thursday
  { day: 5, workout: 'training-a', name: 'SEXTA-FEIRA' },   // Friday
  { day: 6, workout: 'rest', name: 'SÁBADO' },              // Saturday
  { day: 0, workout: 'rest', name: 'DOMINGO' }              // Sunday
];

export const weekProgression: WeekProgression[] = [
  {
    week: 1,
    rpeTarget: '6-7',
    description: 'Foco na técnica e construção de volume base',
    volumeModifier: 1.0
  },
  {
    week: 2,
    rpeTarget: '7-8',
    description: 'Aumento do esforço e da carga',
    volumeModifier: 1.0
  },
  {
    week: 3,
    rpeTarget: '8-9',
    description: 'Picos de intensidade próximo à falha',
    volumeModifier: 1.0
  },
  {
    week: 4,
    rpeTarget: '6-7',
    description: 'Deload - Redução de volume para recuperação',
    volumeModifier: 0.6
  }
];