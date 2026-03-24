import { Roadmap, Phase, RoadmapMilestone, RoadmapTask, Resource } from '../../types';

export async function generateRoadmapFromPrompt(
  skill: string,
  durationWeeks: number,
  dailyMinutes: number,
  experienceLevel: string,
  preferences: string[],
  goal?: string
): Promise<Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 3500));

  const isCooking = skill.toLowerCase().includes('cook');
  
  // Base phase structure
  const phases: Phase[] = isCooking ? getCookingPhases() : getGenericPhases(skill);

  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + (durationWeeks * 7));

  return {
    user_id: 'local-user', // Mock user id
    skill,
    duration_weeks: durationWeeks,
    daily_minutes: dailyMinutes,
    experience_level: experienceLevel as any,
    learning_preferences: preferences,
    goal_statement: goal || `Learn ${skill}`,
    phases,
    status: 'active',
    progress_percentage: 0,
    started_at: new Date().toISOString(),
    estimated_completion: estimatedCompletion.toISOString(),
    ai_model_used: 'Mock GPT-4',
  };
}

function getCookingPhases(): Phase[] {
  return [
    {
      id: crypto.randomUUID(),
      roadmap_id: '',
      phase_number: 1,
      title: 'Kitchen Fundamentals',
      description: 'Master the basics of kitchen setup and safety',
      duration_text: 'Week 1-2',
      start_week: 1,
      end_week: 2,
      status: 'upcoming',
      progress_percentage: 0,
      order_index: 0,
      milestones: [
        {
          id: crypto.randomUUID(),
          phase_id: '',
          title: 'Learn knife skills',
          is_completed: false,
          order_index: 0,
          tasks: [
            { id: crypto.randomUUID(), milestone_id: '', title: 'Watch knife skills tutorial', is_completed: false, estimated_minutes: 15, order_index: 0 },
            { id: crypto.randomUUID(), milestone_id: '', title: 'Practice basic cuts (dice, julienne, mince)', is_completed: false, estimated_minutes: 30, order_index: 1 }
          ]
        },
        {
          id: crypto.randomUUID(),
          phase_id: '',
          title: 'Cook 3 simple recipes',
          is_completed: false,
          order_index: 1,
          tasks: [
            { id: crypto.randomUUID(), milestone_id: '', title: 'Cook scrambled eggs', is_completed: false, estimated_minutes: 20, order_index: 0 },
            { id: crypto.randomUUID(), milestone_id: '', title: 'Make a basic salad with dressing', is_completed: false, estimated_minutes: 15, order_index: 1 }
          ]
        }
      ],
      resources: [
        { id: crypto.randomUUID(), phase_id: '', title: 'Essential Knife Skills', url: '#', type: 'video', source: 'YouTube', duration: '12 min', description: 'Comprehensive guide to cuts.', is_consumed: false, is_bookmarked: false, order_index: 0 }
      ]
    },
    {
      id: crypto.randomUUID(),
      roadmap_id: '',
      phase_number: 2,
      title: 'Core Techniques',
      description: 'Build foundational cooking methods',
      duration_text: 'Week 3-5',
      start_week: 3,
      end_week: 5,
      status: 'upcoming',
      progress_percentage: 0,
      order_index: 1,
      milestones: [
        {
          id: crypto.randomUUID(),
          phase_id: '',
          title: 'Master 5 cooking methods',
          is_completed: false,
          order_index: 0,
          tasks: [
            { id: crypto.randomUUID(), milestone_id: '', title: 'Learn sautéing — cook a stir fry', is_completed: false, estimated_minutes: 45, order_index: 0 },
            { id: crypto.randomUUID(), milestone_id: '', title: 'Learn roasting — roast vegetables', is_completed: false, estimated_minutes: 45, order_index: 1 }
          ]
        }
      ],
      resources: []
    }
  ];
}

function getGenericPhases(skill: string): Phase[] {
  return [
    {
      id: crypto.randomUUID(),
      roadmap_id: '',
      phase_number: 1,
      title: 'Fundamentals of ' + skill,
      description: `Understand the core concepts of ${skill}`,
      duration_text: 'Phase 1',
      start_week: 1,
      end_week: 2,
      status: 'upcoming',
      progress_percentage: 0,
      order_index: 0,
      milestones: [
        {
          id: crypto.randomUUID(),
          phase_id: '',
          title: 'Basic Concepts',
          is_completed: false,
          order_index: 0,
          tasks: [
            { id: crypto.randomUUID(), milestone_id: '', title: 'Read introductory materials', is_completed: false, estimated_minutes: 30, order_index: 0 },
            { id: crypto.randomUUID(), milestone_id: '', title: 'Complete first practice exercise', is_completed: false, estimated_minutes: 45, order_index: 1 }
          ]
        }
      ],
      resources: [
        { id: crypto.randomUUID(), phase_id: '', title: `Intro to ${skill}`, url: '#', type: 'article', source: 'Web', duration: '10 min', description: 'Getting started guide.', is_consumed: false, is_bookmarked: false, order_index: 0 }
      ]
    },
    {
      id: crypto.randomUUID(),
      roadmap_id: '',
      phase_number: 2,
      title: 'Intermediate Concepts',
      description: `Take your ${skill} knowledge to the next level`,
      duration_text: 'Phase 2',
      start_week: 3,
      end_week: 6,
      status: 'upcoming',
      progress_percentage: 0,
      order_index: 1,
      milestones: [
        {
          id: crypto.randomUUID(),
          phase_id: '',
          title: 'Build a project',
          is_completed: false,
          order_index: 0,
          tasks: [
            { id: crypto.randomUUID(), milestone_id: '', title: 'Plan project architecture', is_completed: false, estimated_minutes: 60, order_index: 0 },
            { id: crypto.randomUUID(), milestone_id: '', title: 'Execute project draft', is_completed: false, estimated_minutes: 120, order_index: 1 }
          ]
        }
      ],
      resources: []
    }
  ];
}
