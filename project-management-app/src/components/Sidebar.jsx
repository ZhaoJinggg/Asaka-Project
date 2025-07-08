import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import HomeIcon from '../assets/home-smile-angle-svgrepo-com.svg';
import InboxIcon from '../assets/notification-svgrepo-com.svg';
import ProjectsIcon from '../assets/folders-svgrepo-com.svg';
import TeamIcon from '../assets/team-svgrepo-com.svg';
import TasksIcon from '../assets/to-do-svgrepo-com.svg';
import LogoutIcon from '../assets/logout-svgrepo-com.svg';
import { inboxMessages } from '../data/inbox';

const Sidebar = ({ onLogout, projects = [] }) => {
    // Initialize state from localStorage, default to false if not found
    const [projectsOpen, setProjectsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarProjectsOpen');
        return saved ? JSON.parse(saved) : false;
    });

    const unreadCount = inboxMessages.filter(m => !m.isRead).length;

    // Filter projects so that archived ones are not shown in the sidebar
    const filteredProjects = projects.filter(p => {
        const status = (p.status || '').toLowerCase();
        return status !== 'archived' && !p.archived;
    });

    // Save to localStorage whenever projectsOpen changes
    useEffect(() => {
        localStorage.setItem('sidebarProjectsOpen', JSON.stringify(projectsOpen));
    }, [projectsOpen]);

    // Function to get NavLink classes with active state
    const getLinkClasses = ({ isActive }) => {
        return `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 ${isActive
            ? 'bg-cyan-50 text-cyan-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`;
    };

    return (
        <div className="h-full flex flex-col">
            <nav className="flex-1 p-4 flex flex-col">
                <ul className="space-y-1 flex-1">
                    <li>
                        <NavLink to="/home" className={getLinkClasses}>
                            <img src={HomeIcon} alt="Home" className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Home</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/tasks" className={getLinkClasses}>
                            <img src={TasksIcon} alt="Tasks" className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">My Tasks</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/inbox" className={getLinkClasses}>
                            <img src={InboxIcon} alt="Inbox" className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Inbox</span>
                            {unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </NavLink>
                    </li>
                    <li>
                        <div>
                            <button
                                onClick={() => setProjectsOpen(!projectsOpen)}
                                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={ProjectsIcon} alt="Projects" className="w-5 h-5 flex-shrink-0" />
                                    <span className="truncate">Projects</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${projectsOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {/* Project list */}
                            {projectsOpen && filteredProjects.length > 0 && (
                                <ul className="mt-1 pl-2 space-y-0.5">
                                    {filteredProjects.map((project) => (
                                        <li key={project.id}>
                                            <NavLink
                                                to={`/projects/${project.id}`}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors duration-200 ${isActive
                                                        ? 'bg-cyan-50 text-cyan-700'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded-sm flex-shrink-0 ${project?.color?.startsWith('#') ? '' : project?.color}`}
                                                    style={project?.color?.startsWith('#') ? { backgroundColor: project?.color } : {}}
                                                />
                                                <span className="truncate">{project.title}</span>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </li>
                    <li>
                        <NavLink to="/teams" className={getLinkClasses}>
                            <img src={TeamIcon} alt="Team" className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">Team</span>
                        </NavLink>
                    </li>
                </ul>

                <div className="mt-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 w-full text-left font-medium transition-colors duration-200"
                    >
                        <img src={LogoutIcon} alt="Logout" className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;