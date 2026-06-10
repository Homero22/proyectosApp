import { useState, useEffect } from 'react';

const STORAGE_KEY = 'diario_data_v1';

const getInitialData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const now = Date.now();
      let changed = false;
      
      const updatedActivities = (data.activities || []).map(act => {
        if (act.type === 'recurring' && act.status === 'completed' && act.lastCompletedAt) {
          const daysPassed = (now - act.lastCompletedAt) / (1000 * 60 * 60 * 24);
          if (daysPassed >= 7) {
            changed = true;
            return { ...act, status: 'pending', lastCompletedAt: null };
          }
        }
        return act;
      });

      if (changed) {
        data.activities = updatedActivities;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return { ...data, logs: data.logs || [] };
    } catch (e) {
      console.error('Error parsing local storage data', e);
    }
  }
  return { projects: [], activities: [], logs: [] };
};

export function useData() {
  const [data, setData] = useState(getInitialData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addProject = (project) => {
    setData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { ...project, id: crypto.randomUUID(), createdAt: Date.now() }]
    }));
  };

  const editProject = (projectId, updates) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
    }));
  };

  const deleteProject = (projectId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      activities: prev.activities.filter(a => a.projectId !== projectId),
      logs: (prev.logs || []).filter(l => l.projectId !== projectId)
    }));
  };

  const addActivity = (activity) => {
    setData(prev => ({
      ...prev,
      activities: [...(prev.activities || []), { ...activity, id: crypto.randomUUID(), createdAt: Date.now(), status: 'pending' }]
    }));
  };

  const editActivity = (activityId, updates) => {
    setData(prev => {
      // Si cambia el título de la actividad, actualizamos también en los logs para consistencia visual futura
      const activities = prev.activities.map(a => a.id === activityId ? { ...a, ...updates } : a);
      const logs = (prev.logs || []).map(l => (l.activityId === activityId && updates.title) ? { ...l, title: updates.title } : l);
      return { ...prev, activities, logs };
    });
  };

  const toggleActivity = (activityId) => {
    setData(prev => {
      let newLogs = prev.logs || [];
      const activities = prev.activities.map(act => {
        if (act.id === activityId) {
          const isCompleting = act.status === 'pending';
          
          if (isCompleting) {
            newLogs = [...newLogs, { 
              id: crypto.randomUUID(), 
              activityId: act.id, 
              projectId: act.projectId, 
              title: act.title, 
              completedAt: Date.now() 
            }];
          } else {
            const logIndex = newLogs.map(l => l.activityId).lastIndexOf(act.id);
            if (logIndex !== -1) {
              newLogs = newLogs.filter((_, idx) => idx !== logIndex);
            }
          }

          return {
            ...act,
            status: isCompleting ? 'completed' : 'pending',
            lastCompletedAt: isCompleting ? Date.now() : act.lastCompletedAt
          };
        }
        return act;
      });

      return { ...prev, activities, logs: newLogs };
    });
  };

  const deleteActivity = (activityId) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== activityId),
      logs: (prev.logs || []).filter(l => l.activityId !== activityId)
    }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "diario_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.projects)) {
        setData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error al importar datos:', e);
      return false;
    }
  };

  return {
    projects: data.projects || [],
    activities: data.activities || [],
    logs: data.logs || [],
    addProject,
    editProject,
    deleteProject,
    addActivity,
    editActivity,
    toggleActivity,
    deleteActivity,
    exportData,
    importData
  };
}
