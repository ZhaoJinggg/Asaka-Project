import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectColors } from '../data/colors';
import Layout from '../components/Layout';
import ProjectOverview from '../components/ProjectOverview';
import ProjectBoard from '../components/ProjectBoard.jsx';
import FilesView from '../components/FilesView';
import { useTasks } from '../context/TaskContext';
import OverviewIcon from '../assets/overview-svgrepo-com.svg';
import BoardIcon from '../assets/board-svgrepo-com.svg';

const ProjectDetails = ({ onLogout, projects = [], onUpdateProject}) => {
    const { projectId } = useParams();
    const [activeTab, setActiveTab] = useState('board');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { tasks } = useTasks();

    // Find current project from list (convert id to number)
    const currentProject = projects.find(p => p.id === projectId);

    // Get all files from tasks in this project
    const projectFiles = tasks.reduce((files, task) => {
        if ((task.projectId === projectId || task.projectId === Number(projectId)) && task.attachments && task.attachments.length > 0) {
            return [...files, ...task.attachments.map(file => ({ ...file, taskTitle: task.title, taskId: task.id }))];
        }
        return files;
    }, []);

    // Determine color styling
    const isHexColor = currentProject?.color?.startsWith('#');

    // Handlers for dropdown actions
    const handleEdit = () => {
        // Placeholder: open edit modal or call onUpdateProject
        alert('Edit project details (implement modal as needed)');
        setShowDropdown(false);
    };
    const handleArchive = () => {
        onUpdateProject?.(currentProject.id, { archived: true });
        setShowDropdown(false);
    };
    const handleDelete = () => {
        setShowDeleteConfirm(true);
        setShowDropdown(false);
    };
    const confirmDelete = () => {
        onUpdateProject?.(currentProject.id, { deleted: true });
        setShowDeleteConfirm(false);
    };

    const handleFileClick = (file) => {
        // In a real app, this would open the file or download it
        if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    return (
        <Layout onLogout={onLogout} projects={projects}>
            {/* Project Header */}
            <div className="mb-6">
                {currentProject && (
                    <div className="flex items-center gap-3 relative">
                        <div className="relative">
                            <button
                                onClick={() => setShowColorPicker(prev => !prev)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${!isHexColor ? currentProject.color : ''}`}
                                style={isHexColor ? { backgroundColor: currentProject.color } : {}}
                                aria-label="Change project color"
                            />

                            {showColorPicker && (
                                <div className="absolute top-8 left-0 bg-white shadow-lg border border-gray-200 rounded-lg p-3 flex flex-wrap gap-2 w-37 z-50">
                                    {projectColors.map(col => {
                                        const isHex = col.startsWith('#');
                                        return (
                                            <button
                                                key={col}
                                                onClick={() => {
                                                    onUpdateProject?.(currentProject.id, { color: col });
                                                    setShowColorPicker(false);
                                                }}
                                                className={`w-6 h-6 rounded ${!isHex ? col : ''} border border-gray-300 hover:ring-2 hover:ring-cyan-400 transition`}
                                                style={isHex ? { backgroundColor: col } : {}}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 truncate max-w-full">
                            {currentProject.title}
                        </h1>
                        {/* Dropdown button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(v => !v)}
                                className="ml-1 px-2 py-1 rounded hover:bg-gray-100 text-gray-700 focus:outline-none"
                                aria-label="Project actions"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleArchive}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        Archive
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Delete confirmation dialog */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                                    <h2 className="text-lg font-bold mb-4">Delete Project?</h2>
                                    <p className="mb-6 text-gray-700">Are you sure you want to delete this project? This action cannot be undone.</p>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mt-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center gap-1 ${activeTab === 'overview'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <img src={OverviewIcon} alt="Overview" className="w-4 h-4" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('board')}
                            className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center gap-1 ${activeTab === 'board'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <img src={BoardIcon} alt="Board" className="w-4 h-4" />
                            Board
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`py-2 px-3 border-b-2 font-medium text-sm flex items-center gap-1 ${activeTab === 'files'
                                ? 'border-cyan-500 text-cyan-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-lg">📁</span>
                            Files
                        </button>
                        {/* Add more tabs as needed: List, Timeline, Calendar, etc. */}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && currentProject && <ProjectOverview project={currentProject} />}
            {activeTab === 'board' && <ProjectBoard projectId={projectId} />}
            {activeTab === 'files' && (
                <FilesView
                    files={projectFiles}
                    onFileClick={handleFileClick}
                />
            )}
        </Layout>
    );
};

export default ProjectDetails;