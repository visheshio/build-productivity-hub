import { Roadmap } from '../../types';

// Pure localStorage mock service for Workflow Builder
const STORAGE_KEY = 'productivityHub_roadmaps';

function getLocalRoadmaps(): Roadmap[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalRoadmaps(roadmaps: Roadmap[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
}

export async function fetchRoadmaps(): Promise<Roadmap[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getLocalRoadmaps();
}

export async function createRoadmap(roadmap: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newRoadmap = { 
    ...roadmap, 
    id: crypto.randomUUID(), 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  } as Roadmap;
  
  const local = getLocalRoadmaps();
  saveLocalRoadmaps([newRoadmap, ...local]);
  return newRoadmap;
}

export async function updateRoadmap(roadmap: Roadmap): Promise<Roadmap> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const local = getLocalRoadmaps();
  saveLocalRoadmaps(local.map(r => r.id === roadmap.id ? { ...roadmap, updated_at: new Date().toISOString() } : r));
  // Keep the same roadmap reference to satisfy TS
  return roadmap;
}

export async function deleteRoadmap(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const local = getLocalRoadmaps();
  saveLocalRoadmaps(local.filter(r => r.id !== id));
}
