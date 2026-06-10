import React, { useState } from 'react';
import { useData } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { ProjectDetail } from './components/ProjectDetail';

function App() {
  const data = useData();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const selectedProject = selectedProjectId 
    ? data.projects.find(p => p.id === selectedProjectId)
    : null;

  return (
    <div className="min-h-screen max-w-5xl mx-auto p-6 md:p-12">
      {!selectedProject ? (
        <Dashboard 
          projects={data.projects} 
          activities={data.activities}
          logs={data.logs}
          onAddProject={data.addProject}
          onEditProject={data.editProject}
          onSelectProject={(project) => setSelectedProjectId(project.id)}
          onDeleteProject={data.deleteProject}
          exportData={data.exportData}
          importData={data.importData}
        />
      ) : (
        <ProjectDetail 
          project={selectedProject}
          activities={data.activities}
          logs={data.logs}
          onBack={() => setSelectedProjectId(null)}
          onAddActivity={data.addActivity}
          onEditActivity={data.editActivity}
          onToggleActivity={data.toggleActivity}
          onDeleteActivity={data.deleteActivity}
        />
      )}
    </div>
  );
}

export default App;
