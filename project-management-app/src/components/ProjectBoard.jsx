import { useState, useEffect } from 'react';
import TaskDetailsModal from './TaskDetailsModal';
import * as ProjectTaskAPI from '../API/ProjectTaskAPI';
import { getAllUsers } from '../API/UserAPI';
import { getUserId } from '../API/AuthAPI';

const columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'completed', title: 'Completed' },
];

const getColumnTasks = (tasks) => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
});

const getPriorityStyles = (priority) => {
    if (!priority) return '';
    switch (priority) {
        case 'low':
            return 'bg-gray-100 text-gray-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'high':
            return 'bg-red-100 text-red-800';
        default:
            return '';
    }
};

const ProjectBoard = ({ projectId, projects = [] }) => {
    // Removed context; manage tasks locally
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inlineAddStatus, setInlineAddStatus] = useState(null); // which column is adding
    const [inlineTask, setInlineTask] = useState({ title: '', description: '', startDate: '', priority: 'medium', status: 'todo', dueDate: '' });
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(undefined);

    // Fetch tasks for this project
    useEffect(() => {
        const fetchProjectTasks = async () => {
            if (!projectId) return;

            setLoading(true);
            try {
                const response = await ProjectTaskAPI.getAllTasks();
                const data = response?.data || response;
                console.log('Fetched tasks:', data);
                data.forEach(task => {
                    if (task.title != 'Your New Task Title') {
                        console.log('projectId from backend:', task.projectId, 'projectId in frontend:', projectId);
                    }
                });
                const filtered = data.filter(task => String(task.projectId) === String(projectId));
                setTasks(filtered);
            } catch (error) {
                console.error('Error fetching project tasks:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectTasks();
    }, [projectId]);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await getAllUsers();
                const users = response.data || [];
                const currentUserId = await getUserId();
                const user = users.find(u => String(u.id) === String(currentUserId));
                setCurrentUserRole(user?.role);
            } catch (error) {
                setCurrentUserRole(undefined);
            }
        };
        fetchRole();
    }, []);

    // Add task to API and local state
    const addTask = async (projectId, taskData) => {
        try {
            const response = await ProjectTaskAPI.addTask(projectId, taskData);
            const newTask = response?.data || response;
            setTasks(prev => [...prev, newTask]);
            // Also update context for consistency
            // contextAddTask(newTask); // Removed context
        } catch (error) {
            console.error('Error adding task:', error);
            // Fallback to local state only
            const fallbackTask = { ...taskData, id: Date.now().toString() };
            setTasks(prev => [...prev, fallbackTask]);
            // contextAddTask(fallbackTask); // Removed context
        }
    };

    // Update task in API and local state
    // id = projecTask's id; updates = new projectTask's details
    const updateTask = async (id, updates) => {
        try {
            await ProjectTaskAPI.updateTask(id, updates);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            // Also update context for consistency
            // contextUpdateTask(id, updates); // Removed context
        } catch (error) {
            console.error('Error updating task:', error);
            // Fallback to local state only
            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
            // contextUpdateTask(id, updates); // Removed context
        }
    };

    const handleInlineAdd = async (colId) => {
        if (inlineTask.title.trim() && inlineTask.description.trim() && inlineTask.startDate) {
            await addTask(projectId, {
                title: String(inlineTask.title),
                description: String(inlineTask.description),
                startDate: String(inlineTask.startDate),
                priority: String(inlineTask.priority),
                status: String(colId),
                endDate: inlineTask.dueDate ? String(inlineTask.dueDate) : ''
            });
            setInlineTask({ title: '', description: '', startDate: '', priority: 'medium', status: colId, dueDate: '' });
            setInlineAddStatus(null);
            setShowDatePicker(false);
        }
    };

    // Find project name for modal
    const project = Array.isArray(projects) ? projects.find(p => p.id === projectId) : undefined;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600 text-lg">Loading project tasks...</div>
            </div>
        );
    }

    const columnTasks = getColumnTasks(tasks);

    return (
        <>
            <div className="flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => {
                    const tasksForColumn = columnTasks[col.key];
                    return (
                        <div key={col.key} className="p-4 flex-shrink-0 w-80 rounded-lg bg-gray-100">
                            {/* Column Header */}
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                    {col.title}
                                    <span className="bg-gray-700 text-gray-200 text-xs rounded-full px-2 py-0.5 ml-1">{tasksForColumn.length || 0}</span>
                                </h3>
                            </div>
                            {/* Inline Add Task Card */}
                            {inlineAddStatus === col.key ? (
                                <div className="bg-white rounded-lg p-4 shadow flex flex-col gap-2 border border-gray-800 mb-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={inlineTask.title}
                                            onChange={e => setInlineTask(prev => ({ ...prev, title: e.target.value }))}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleInlineAdd(col.key);
                                                if (e.key === 'Escape') { setInlineAddStatus(null); setInlineTask({ title: '', description: '', startDate: '', priority: 'medium', status: col.key, dueDate: '' }); setShowDatePicker(false); }
                                            }}
                                            placeholder="Write a task name"
                                            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base"
                                            disabled={currentUserRole === 'contributor'}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <input
                                            type="text"
                                            value={inlineTask.description}
                                            onChange={e => setInlineTask(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Description (required)"
                                            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base"
                                            disabled={currentUserRole === 'contributor'}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="w-24 text-xs text-gray-700">Start Date</label>
                                        <input
                                            type="date"
                                            value={inlineTask.startDate}
                                            onChange={e => setInlineTask(prev => ({ ...prev, startDate: e.target.value }))}
                                            placeholder="Start Date (required)"
                                            className="flex-1 bg-transparent border border-gray-300 rounded px-2 py-1 outline-none text-gray-800 placeholder-gray-400 text-base"
                                            disabled={currentUserRole === 'contributor'}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label className="w-24 text-xs text-gray-700">Due Date</label>
                                        <input
                                            type="date"
                                            value={inlineTask.dueDate}
                                            onChange={e => setInlineTask(prev => ({ ...prev, dueDate: e.target.value }))}
                                            placeholder="Due Date"
                                            className="flex-1 bg-transparent border border-gray-300 rounded px-2 py-1 outline-none text-gray-800 placeholder-gray-400 text-base"
                                            disabled={currentUserRole === 'contributor'}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <select
                                            value={inlineTask.priority}
                                            onChange={e => setInlineTask(prev => ({ ...prev, priority: e.target.value }))}
                                            className="px-2 py-1 rounded text-xs font-semibold border border-dashed border-gray-500 text-gray-700"
                                            disabled={currentUserRole === 'contributor'}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <select
                                            value={inlineTask.status}
                                            onChange={e => setInlineTask(prev => ({ ...prev, status: e.target.value }))}
                                            className="px-2 py-1 rounded text-xs font-semibold border border-dashed border-gray-500 text-gray-700"
                                            disabled={currentUserRole === 'contributor'}
                                        >
                                            {columns.map(col => (
                                                <option key={col.key} value={col.key}>{col.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 mt-1 relative">
                                        <button
                                            className="px-2 py-1 text-gray-500 text-sm font-medium"
                                            onClick={() => { setInlineAddStatus(null); setInlineTask({ title: '', description: '', startDate: '', priority: 'medium', status: col.key, dueDate: '' }); setShowDatePicker(false); }}
                                            disabled={currentUserRole === 'contributor'}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-2 py-1 text-blue-500 hover:text-blue-700 text-sm font-medium"
                                            onClick={() => handleInlineAdd(col.key)}
                                            disabled={currentUserRole === 'contributor'}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setInlineAddStatus(col.key);
                                        setInlineTask({ title: '', description: '', startDate: '', priority: 'medium', status: col.key, dueDate: '' });
                                    }}
                                    className="w-full p-3 text-left text-gray-500 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                                    disabled={currentUserRole === 'contributor'}
                                >
                                    + Add Task
                                </button>
                            )}
                            {/* Tasks Container */}
                            <div className="mt-4 space-y-3 min-h-[20px]">
                                {tasksForColumn.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className="bg-white rounded-lg p-4 shadow flex flex-col gap-2 border border-gray-800 group relative cursor-pointer"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`font-medium text-black ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityStyles(task.priority)}`}>{task.priority}</span>
                                        </div>
                                        {task.endDate && (
                                            <div className="text-xs text-gray-800">Due: {String(task.endDate).slice(0, 10)}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={updated => updateTask(selectedTask.id, updated)}
                    projects={projects}
                />
            )}
        </>
    );
};

export default ProjectBoard;