import {
  DesignerProfileData,
  ProjectItem,
  DEFAULT_CATEGORIES,
} from '@/types/portfolio';

export const STORAGE_KEY = 'mylink_designer_portfolio';

export const INITIAL_DESIGNER_PROFILE: DesignerProfileData = {
  handle: '',
  name: '',
  roleTitle: '',
  bio: '',
  avatarUrl: '',
  resumePdfUrl: '',
  socialLinks: {},
  skills: [],
  toolProficiencies: [],
  projects: [],
  careers: [],
  categories: DEFAULT_CATEGORIES,
  customTools: [],
};

export function getDesignerProfile(): DesignerProfileData {
  if (typeof window === 'undefined') {
    return INITIAL_DESIGNER_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DESIGNER_PROFILE));
      return INITIAL_DESIGNER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_DESIGNER_PROFILE,
      ...parsed,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
      projects: parsed.projects || [],
      toolProficiencies: parsed.toolProficiencies || [],
      careers: parsed.careers || [],
      customTools: parsed.customTools || [],
      skills: parsed.skills || [],
    };
  } catch (error) {
    console.error('Failed to get designer profile:', error);
    return INITIAL_DESIGNER_PROFILE;
  }
}

export function saveDesignerProfile(data: DesignerProfileData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save designer profile:', error);
  }
}

export function resetDesignerProfile(): DesignerProfileData {
  if (typeof window === 'undefined') return INITIAL_DESIGNER_PROFILE;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DESIGNER_PROFILE));
  } catch (error) {
    console.error('Failed to reset designer profile:', error);
  }
  return INITIAL_DESIGNER_PROFILE;
}

export function addProjectToStorage(project: ProjectItem): DesignerProfileData {
  const current = getDesignerProfile();
  const updatedProjects = [project, ...(current.projects || [])];
  const updated = {
    ...current,
    projects: updatedProjects,
  };
  saveDesignerProfile(updated);
  return updated;
}

export function deleteProjectFromStorage(projectId: string): DesignerProfileData {
  const current = getDesignerProfile();
  const updatedProjects = (current.projects || []).filter((p) => p.id !== projectId);
  const updated = {
    ...current,
    projects: updatedProjects,
  };
  saveDesignerProfile(updated);
  return updated;
}
