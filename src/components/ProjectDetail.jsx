import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';

export function ProjectDetail({ project, activities, logs = [], onBack, onAddActivity, onEditActivity, onToggleActivity, onDeleteActivity }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('one-time'); // 'one-time' | 'recurring'

  const projectActivities = activities.filter(a => a.projectId === project.id);
  const projectLogs = logs.filter(l => l.projectId === project.id);
  
  const recurring = projectActivities.filter(a => a.type === 'recurring');
  const oneTimePending = projectActivities.filter(a => a.type === 'one-time' && a.status === 'pending');

  const Icon = LucideIcons[project.iconName] || LucideIcons.Folder;

  const openCreateModal = () => {
    setEditingActivityId(null);
    setNewTitle('');
    setNewType('one-time');
    setIsModalOpen(true);
  };

  const openEditModal = (act) => {
    setEditingActivityId(act.id);
    setNewTitle(act.title);
    setNewType(act.type);
    setIsModalOpen(true);
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    if (editingActivityId) {
      onEditActivity(editingActivityId, {
        title: newTitle.trim(),
        type: newType,
        frequency: newType === 'recurring' ? 'weekly' : undefined
      });
    } else {
      onAddActivity({
        projectId: project.id,
        title: newTitle.trim(),
        type: newType,
        frequency: newType === 'recurring' ? 'weekly' : undefined
      });
    }
    
    setNewTitle('');
    setIsModalOpen(false);
  };

  const ActivityItem = ({ act }) => {
    const isCompleted = act.status === 'completed';
    return (
      <div className={cn(
        "group flex items-center justify-between p-4 bg-white border rounded-xl transition-all",
        isCompleted ? "border-gray-100 bg-gray-50/50" : "border-gray-200 shadow-sm hover:border-indigo-200"
      )}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onToggleActivity(act.id)}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
              isCompleted ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent hover:border-indigo-500 hover:text-indigo-100"
            )}
          >
            <LucideIcons.Check size={14} strokeWidth={3} className={isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-50"} />
          </button>
          <div>
            <span className={cn(
              "text-base font-medium transition-colors",
              isCompleted ? "text-gray-400 line-through" : "text-gray-700"
            )}>
              {act.title}
            </span>
            {act.type === 'recurring' && (
              <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium tracking-wide uppercase">
                Semanal
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <button 
            onClick={() => openEditModal(act)}
            className="p-2 md:p-1 text-gray-400 hover:text-indigo-500 transition-all rounded-lg hover:bg-indigo-50"
            title="Editar"
          >
            <LucideIcons.Edit2 size={18} className="md:w-4 md:h-4" />
          </button>
          <button 
            onClick={() => setActivityToDelete(act.id)}
            className="p-2 md:p-1 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
            title="Eliminar"
          >
            <LucideIcons.Trash2 size={18} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    );
  };

  const groupedLogs = {};
  [...projectLogs].sort((a, b) => b.completedAt - a.completedAt).forEach(log => {
    const d = new Date(log.completedAt);
    const isToday = d.toDateString() === new Date().toDateString();
    let dateStr = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (isToday) dateStr = 'Hoy';
    
    if (!groupedLogs[dateStr]) groupedLogs[dateStr] = [];
    groupedLogs[dateStr].push(log);
  });

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium"
      >
        <LucideIcons.ArrowLeft size={18} />
        Volver a proyectos
      </button>

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <LucideIcons.Calendar size={14} />
              Creado el {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <LucideIcons.Plus size={20} />
          Añadir Actividad
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tareas Pendientes */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LucideIcons.Repeat size={20} className="text-indigo-500" />
              Actividades Recurrentes
            </h2>
            <div className="space-y-3">
              {recurring.length === 0 && (
                <p className="text-gray-400 text-sm italic py-4">No hay tareas recurrentes. ¡Agrega una para crear un hábito!</p>
              )}
              {recurring.map(act => <ActivityItem key={act.id} act={act} />)}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LucideIcons.ListTodo size={20} className="text-emerald-500" />
              Tareas de una sola vez
            </h2>
            
            <div className="space-y-3 mb-6">
              {oneTimePending.length === 0 && (
                <p className="text-gray-400 text-sm italic py-2">Todo al día. Ninguna tarea pendiente.</p>
              )}
              {oneTimePending.map(act => <ActivityItem key={act.id} act={act} />)}
            </div>
          </section>
        </div>

        {/* Diario del Proyecto */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
            <LucideIcons.BookOpen size={20} className="text-amber-500" />
            Diario de Actividades
          </h2>
          
          <div className="space-y-6">
            {Object.keys(groupedLogs).length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center py-8">
                Aún no has completado ninguna actividad. Tus logros aparecerán aquí como un informe.
              </p>
            ) : (
              Object.entries(groupedLogs).map(([date, logsList]) => (
                <div key={date} className="relative pl-4 border-l-2 border-gray-200">
                  <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px] top-1.5 border-2 border-gray-50"></div>
                  <h3 className="text-sm font-semibold text-gray-900 capitalize mb-3">{date}</h3>
                  <div className="space-y-2">
                    {logsList.map(log => (
                      <div key={log.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-700 flex items-center justify-between group">
                        <span className="flex items-center gap-2">
                          <LucideIcons.CheckCircle2 size={16} className="text-green-500" />
                          {log.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingActivityId ? "Editar Actividad" : "Nueva Actividad"}>
        <form onSubmit={handleSaveActivity} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input 
              type="text" 
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="Ej. Revisar métricas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de actividad</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={cn(
                "border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 text-center",
                newType === 'one-time' ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}>
                <input type="radio" name="type" value="one-time" className="sr-only" checked={newType === 'one-time'} onChange={() => setNewType('one-time')} />
                <LucideIcons.CheckSquare size={24} />
                <span className="font-medium">Una sola vez</span>
                <span className="text-xs opacity-75">Se registra en el diario y desaparece</span>
              </label>
              
              <label className={cn(
                "border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 text-center",
                newType === 'recurring' ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}>
                <input type="radio" name="type" value="recurring" className="sr-only" checked={newType === 'recurring'} onChange={() => setNewType('recurring')} />
                <LucideIcons.Repeat size={24} />
                <span className="font-medium">Recurrente</span>
                <span className="text-xs opacity-75">Se registra en el diario y se reinicia</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit">{editingActivityId ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!activityToDelete} onClose={() => setActivityToDelete(null)} title="Confirmar Eliminación">
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar esta actividad de forma permanente? 
            Esta acción no se puede deshacer y borrará su registro del diario.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setActivityToDelete(null)}>Cancelar</Button>
            <Button className="bg-red-500 hover:bg-red-600 shadow-sm" onClick={() => { onDeleteActivity(activityToDelete); setActivityToDelete(null); }}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
