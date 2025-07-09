import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import TaskDetailsModal from '../components/TaskDetailsModal';
import FilesView from '../components/FilesView';
import * as ProjectTaskAPI from '../API/ProjectTaskAPI';
import { downloadAttachment } from '../API/AttachmentAPI';
import { isTokenValid } from '../API/AuthAPI';

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'completed', title: 'Completed' },
];

const priorityColors = {
  high: 'bg-red-500 text-white',
  medium: 'bg-yellow-400 text-white',
  low: 'bg-green-400 text-white',
};

// For demo, assign tasks to columns by id or status
const getColumnTasks = (tasks) => ({
  todo: tasks.filter(t => t.status === 'todo'),
  in_progress: tasks.filter(t => t.status === 'in_progress'),
  completed: tasks.filter(t => t.status === 'completed'),
});

const Tasks = ({ onLogout, projects = [], projectTasks = [], userInfo = {} }) => {
  // const { tasks, addTask, updateTask } = useTasks();
  const [tasks, setTasks] = useState(Array.isArray(projectTasks) ? projectTasks : []);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'dashboard', 'files'

  // Fetch user info from token once on mount
  useEffect(() => {
    const result = isTokenValid();
    if (result && result.isValid) {
      setUsername(result.username || "");
    }
  }, []);

  // Fetch all tasks from API
  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await ProjectTaskAPI.getAllTasksByUserId();
  //       const data = response?.data || response;
  //       setTasks(Array.isArray(data) ? data : []);
  //     } catch (error) {
  //       console.error('Error fetching tasks:', error);
  //       setTasks([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchTasks();
  // }, []);

  // Update task in API and local state
  const updateTask = async (id, updates) => {
    try {
      await ProjectTaskAPI.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating task:', error);
      // Fallback to local state only
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const columnTasks = getColumnTasks(tasks);

  // Get all files from all tasks
  const allFiles = tasks.reduce((files, task) => {
    if (task.attachments && task.attachments.length > 0) {
      return [...files, ...task.attachments.map(file => ({ ...file, taskTitle: task.title, taskId: task.id }))];
    }
    return files;
  }, []);

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  // Find project name for modal (if any)
  const getProjectName = (task) => {
    if (task.projectId) {
      const project = projects.find(p => p.id === task.projectId);
      return project ? (project.name || project.title) : '';
    }
    return '';
  };

  const renderBoardView = () => (
    <div className="flex gap-4 w-full overflow-x-auto pb-8 min-h-[70vh]">
      {columns.map(col => (
        <div key={col.key} className="bg-gray-100 rounded-xl min-w-[300px] w-72 flex flex-col p-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-black text-base flex items-center gap-2">
              {col.title}
              <span className="bg-gray-700 text-gray-200 text-xs rounded-full px-2 py-0.5 ml-1">{columnTasks[col.key]?.length || 0}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 min-h-[60vh]">
            {columnTasks[col.key]?.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-lg p-4 shadow flex flex-col gap-2 border border-gray-800 group relative cursor-pointer"
                onClick={() => setSelectedTask({ ...task, projectName: getProjectName(task) })}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* <button
                    onClick={e => { e.stopPropagation(); toggleComplete(task.id); }}
                    className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors duration-200 ${task.completed ? 'border-green-400 bg-green-400' : 'border-gray-400 bg-transparent hover:border-cyan-400'}`}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.completed ? (
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="block w-3 h-3 rounded-full bg-transparent"></span>
                    )}
                  </button> */}
                  <div className={`font-medium text-black ${task.status === "completed" ? 'line-through text-gray-400' : ''}`}>{task.title}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[task.priority]}`}>{task.priority}</span>
                </div>
                {task.endDate && (
                  <div className="text-xs text-gray-800">Due: {String(task.endDate).slice(0, 10)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Layout onLogout={onLogout} projects={projects}>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading tasks...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout} projects={projects}>
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-lg text-gray-900">{username ? username.charAt(0).toUpperCase() : "?"}</div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        </div>
      </div>
      {/* Board Tabs and Options */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex gap-2">
          <button
            className={`px-2 pb-1 font-medium ${activeTab === 'board' ? 'text-black/80 border-b-2 border-blue-500' : 'text-black/40 hover:text-black/20'}`}
            onClick={() => setActiveTab('board')}
          >
            Board
          </button>
        </div>
        <div className="flex-1" />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'board' && renderBoardView()}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-500">Dashboard view coming soon...</p>
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={updated => updateTask(selectedTask.id, updated)}
          projects={projects}
        />
      )}
    </Layout>
  );
};

export default Tasks; 