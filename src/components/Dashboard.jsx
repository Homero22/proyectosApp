import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';

const ICONS_LIST = ['Briefcase', 'Code', 'Palette', 'BookOpen', 'Dumbbell', 'Coffee', 'Heart', 'Home', 'Monitor', 'Music'];

export function Dashboard({ projects, activities, logs, onAddProject, onEditProject, onSelectProject, onDeleteProject, exportData, importData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS_LIST[0]);
  
  const fileInputRef = useRef(null);

  const openCreateModal = () => {
    setEditingProjectId(null);
    setProjectName('');
    setSelectedIcon(ICONS_LIST[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (project, e) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setSelectedIcon(project.iconName || ICONS_LIST[0]);
    setIsModalOpen(true);
  };

  const confirmDelete = (projectId, e) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    if (editingProjectId) {
      onEditProject(editingProjectId, { name: projectName.trim(), iconName: selectedIcon });
    } else {
      onAddProject({ name: projectName.trim(), iconName: selectedIcon });
    }
    
    setProjectName('');
    setIsModalOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const success = importData(content);
      if (success) {
        alert('Datos importados correctamente.');
      } else {
        alert('Hubo un error al leer el archivo. Asegúrate de que es un respaldo válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  // Actividades pendientes
  const pendingActivities = activities.filter(a => a.status === 'pending');

  // Estadísticas
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0,0,0,0);
  const completedThisWeek = logs.filter(l => new Date(l.completedAt).getTime() >= startOfWeek).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Proyectos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus actividades y recordatorios.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={exportData} title="Exportar Respaldo">
            <LucideIcons.Download size={18} className="text-gray-500" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50" title="Importar Respaldo">
            <LucideIcons.Upload size={18} className="text-gray-500" />
            <span className="hidden sm:inline">Importar</span>
            <input 
              type="file" 
              accept=".json,application/json,text/plain" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
          
          <Button onClick={openCreateModal}>
            <LucideIcons.Plus size={20} />
            Nuevo Proyecto
          </Button>
        </div>
      </header>

      {/* Panel de Estadísticas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <LucideIcons.CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Completadas esta semana</p>
            <p className="text-2xl font-bold text-gray-900">{completedThisWeek}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <LucideIcons.ListTodo size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{pendingActivities.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <LucideIcons.Folder size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Proyectos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
        </div>
      </section>

      {/* Recordatorios Globales */}
      {pendingActivities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LucideIcons.Bell size={20} className="text-amber-500" />
            Actividades Pendientes ({pendingActivities.length})
          </h2>
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-wrap gap-3">
            {pendingActivities.slice(0, 5).map(act => {
              const project = projects.find(p => p.id === act.projectId);
              return (
                <div key={act.id} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-50 text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => project && onSelectProject(project)}>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  {act.title}
                  <span className="text-xs text-gray-400 font-normal ml-2">{project?.name}</span>
                </div>
              );
            })}
            {pendingActivities.length > 5 && (
              <div className="px-4 py-2 text-sm font-medium text-amber-600 flex items-center">
                +{pendingActivities.length - 5} más
              </div>
            )}
          </div>
        </section>
      )}

      {/* Grid de Proyectos */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const Icon = LucideIcons[project.iconName] || LucideIcons.Folder;
            const projectActivities = activities.filter(a => a.projectId === project.id);
            const pendingCount = projectActivities.filter(a => a.status === 'pending').length;

            return (
              <div 
                key={project.id} 
                onClick={() => onSelectProject(project)}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer relative flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => openEditModal(project, e)}
                      className="text-gray-300 hover:text-indigo-500 transition-colors p-2 md:p-1"
                      title="Editar proyecto"
                    >
                      <LucideIcons.Edit2 size={18} className="md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={(e) => confirmDelete(project.id, e)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2 md:p-1"
                      title="Eliminar proyecto"
                    >
                      <LucideIcons.Trash2 size={18} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {projectActivities.length === 0 
                    ? 'Sin actividades' 
                    : pendingCount === 0 
                      ? 'Todo completado 🎉' 
                      : `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
                </p>
              </div>
            );
          })}
          
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LucideIcons.FolderOpen size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No hay proyectos</h3>
              <p className="text-gray-500">Crea tu primer proyecto para empezar a registrar actividades.</p>
              <Button onClick={openCreateModal} className="mt-4">Crear Proyecto</Button>
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProjectId ? "Editar Proyecto" : "Nuevo Proyecto"}>
        <form onSubmit={handleSaveProject} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del proyecto</label>
            <input 
              type="text" 
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="Ej. Mi App Increíble"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Elige un icono</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS_LIST.map(iconName => {
                const Icon = LucideIcons[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(
                      "p-3 rounded-xl flex items-center justify-center transition-all",
                      selectedIcon === iconName ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/50" : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    )}
                  >
                    <Icon size={20} />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit">{editingProjectId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!projectToDelete} onClose={() => setProjectToDelete(null)} title="Confirmar Eliminación">
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar este proyecto y todas sus actividades registradas? 
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setProjectToDelete(null)}>Cancelar</Button>
            <Button className="bg-red-500 hover:bg-red-600 shadow-sm" onClick={() => { onDeleteProject(projectToDelete); setProjectToDelete(null); }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
