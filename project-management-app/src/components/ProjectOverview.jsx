import { useState, useEffect } from 'react';
import { projectColors } from '../data/colors';
import { updateProject, addProjectMember, getProjectById } from '../API/ProjectAPI';

const ProjectOverview = ({ project, onUpdateProject, users = [] }) => {
    const [description, setDescription] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [goal, setGoal] = useState('');
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    // Project members list – fetched from backend (owner plus others)
    const [members, setMembers] = useState([]);

    // Trigger to re-fetch members after changes
    const [memberRefreshFlag, setMemberRefreshFlag] = useState(0);

    // Fetch members list from backend whenever project changes or refresh flag increments
    useEffect(() => {
        const fetchMembers = async () => {
            if (!project?.id) return;
            try {
                const resp = await getProjectById(project.id);
                const data = resp?.data;
                const collected = [];

                const ownerApi = data?.owner || data?.projectOwner;
                if (ownerApi) {
                    collected.push({
                        id: ownerApi.id ?? 'owner',
                        name: ownerApi.username || ownerApi.name || (ownerApi.email ? ownerApi.email.split('@')[0] : 'Owner'),
                        email: ownerApi.email || '',
                        initials: getInitials(ownerApi.username || ownerApi.name || ownerApi.email),
                        role: 'Owner',
                        color: projectColors[collected.length % projectColors.length],
                        isOwner: true,
                    });
                }

                const assigneesApi =
                    (Array.isArray(data?.assignees) && data.assignees) ||
                    (Array.isArray(data?.assignedUsers) && data.assignedUsers) ||
                    (Array.isArray(data?.projectAssignees) && data.projectAssignees) ||
                    (Array.isArray(data?.members) && data.members) ||
                    (Array.isArray(data) ? data : []); // legacy flat array

                assigneesApi.forEach((u, idx) => {
                    // Prevent duplicate entry if assignee is also the owner (match via id or email)
                    if (collected.some((m) => (u.id && m.id === u.id) || (u.email && m.email === u.email))) {
                        return;
                    }

                    collected.push({
                        id: u.id ?? `member-${idx}`,
                        name: u.username || u.name || (u.email ? u.email.split('@')[0] : 'User'),
                        email: u.email || '',
                        initials: getInitials(u.username || u.name || u.email),
                        role: u.role || 'Member',
                        color: projectColors[collected.length % projectColors.length],
                        isOwner: false,
                    });
                });

                if (collected.length > 0) {
                    setMembers(collected);
                    return;
                }
            } catch (err) {
                console.error('Failed to fetch project members', err);
            }

            // Fallback: show owner only if no members received
            const ownerName =
                project.owner?.username ||
                project.ownerName ||
                project.createdBy ||
                project.createdByName ||
                'Project Owner';

            const ownerEmail =
                project.owner?.email ||
                project.ownerEmail ||
                '';

            setMembers([
                {
                    id: 1,
                    name: ownerName,
                    email: ownerEmail,
                    initials: getInitials(ownerName),
                    role: 'Owner',
                    color: projectColors[0],
                    isOwner: true,
                },
            ]);
        };

        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, memberRefreshFlag]);

    useEffect(() => {
        if (project) {
            setDescription(project.description || 'Click to add a description.');
            setGoal(project.goal || 'Click to add a project goal.');
        }
    }, [project]);

    // Helper to build full project payload for PUT
    const buildPayload = (overrides = {}) => ({
        title: project.title,
        description: overrides.description ?? project.description,
        goal: overrides.goal ?? project.goal,
        color: project.color,
        priority: overrides.priority ?? project.priority,
        status: overrides.status ?? project.status,
        startDate: overrides.startDate ?? project.startDate,
        endDate: overrides.endDate ?? project.endDate,
    });

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMember, setNewMember] = useState({ identifier: '', role: 'Member' });
    const [suggestions, setSuggestions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Editable fields state
    const [detailsEditMode, setDetailsEditMode] = useState(false);
    const [editValues, setEditValues] = useState({
        priority: project.priority,
        status: project.status,
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
    });

    useEffect(() => {
        setEditValues({
            priority: project.priority,
            status: project.status,
            startDate: project.startDate ? project.startDate.slice(0, 10) : '',
            endDate: project.endDate ? project.endDate.slice(0, 10) : '',
        });
    }, [project]);

    const handleSaveGoal = async () => {
        try {
            const payload = buildPayload({ goal });
            await updateProject(project.id, payload);
            onUpdateProject?.(project.id, { goal });
            setIsEditingGoal(false);
        } catch (error) {
            console.error('Failed to update goal', error);
        }
    };

    const handleSaveDescription = async () => {
        try {
            const payload = buildPayload({ description });
            await updateProject(project.id, payload);
            onUpdateProject?.(project.id, { description });
            setIsEditingDescription(false);
        } catch (error) {
            console.error('Failed to update description', error);
        }
    };

    const handleSaveDetails = async () => {
        const payload = buildPayload({
            priority: editValues.priority,
            status: editValues.status,
            startDate: editValues.startDate,
            endDate: editValues.endDate,
        });
        try {
            await updateProject(project.id, payload);
            onUpdateProject?.(project.id, payload);
            setDetailsEditMode(false);
        } catch (error) {
            console.error('Failed to update project details', error);
        }
    };

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        switch (s) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
            case 'active':
                return 'bg-yellow-100 text-yellow-800';
            case 'paused':
                return 'bg-orange-100 text-orange-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        const p = (priority || '').toLowerCase();
        switch (p) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleIdentifierChange = (e) => {
        const value = e.target.value;
        setNewMember({ ...newMember, identifier: value });

        if (!value) {
            setSuggestions([]);
            setSelectedUser(null);
            return;
        }

        // Filter users who are not already members
        const filtered = users
            .filter(
                (u) =>
                    !members.some((m) => m.email === u.email || m.name === u.username) &&
                    ((u.username && u.username.toLowerCase().includes(value.toLowerCase())) ||
                        (u.email && u.email.toLowerCase().includes(value.toLowerCase())))
            )
            .slice(0, 5);
        setSuggestions(filtered);
    };

    const handleSelectSuggestion = (user) => {
        setSelectedUser(user);
        setNewMember({ identifier: user.email || user.username, role: 'Member' });
        setSuggestions([]);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();

        // We must have either selectedUser or a typed identifier
        if (!newMember.identifier) return;

        let memberToAdd = null;

        if (selectedUser) {
            memberToAdd = selectedUser;
        } else {
            // Try to match the identifier to an existing user
            const matched = users.find(
                (u) => u.email === newMember.identifier || u.username === newMember.identifier
            );
            if (matched) {
                memberToAdd = matched;
            }
        }

        // If matched to a real user, call backend to add them to the project
        if (memberToAdd) {
            try {
                await addProjectMember(project.id, memberToAdd.id);
            } catch (error) {
                console.error('Failed to add project member via API', error);
            }
        }

        // Update local UI regardless (optimistic), fallback to typed name/email
        const extractedName = memberToAdd?.username || memberToAdd?.name || newMember.identifier.split('@')[0].replace(/\./g, ' ');
        const memberObj = {
            id: members.length + 1,
            name: extractedName.charAt(0).toUpperCase() + extractedName.slice(1),
            email: memberToAdd?.email || (newMember.identifier.includes('@') ? newMember.identifier : ''),
            initials: getInitials(extractedName),
            role: newMember.role,
            color: projectColors[members.length % projectColors.length],
            isOwner: newMember.role === 'Admin',
        };

        setMembers([...members, memberObj]);
        // Trigger a re-fetch next time so data stays in sync on reload
        setMemberRefreshFlag((f) => f + 1);
        setNewMember({ identifier: '', role: 'Member' });
        setSelectedUser(null);
        setSuggestions([]);
        setShowAddMemberModal(false);
    };

    const getInitials = (name) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Project Description */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
                    {isEditingDescription ? (
                        <div className="space-y-3">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                rows="4"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveDescription}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setDescription(project.description || 'Click to add a description.');
                                        setIsEditingDescription(false);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsEditingDescription(true)}
                            className="text-gray-600 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                        >
                            {description}
                        </div>
                    )}
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                        {detailsEditMode ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveDetails}
                                    className="px-3 py-1 rounded-lg bg-cyan-500 text-white text-sm hover:bg-cyan-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setDetailsEditMode(false);
                                        setEditValues({
                                            priority: project.priority,
                                            status: project.status,
                                            startDate: project.startDate ? project.startDate.slice(0, 10) : '',
                                            endDate: project.endDate ? project.endDate.slice(0, 10) : '',
                                        });
                                    }}
                                    className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setDetailsEditMode(true)}
                                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {detailsEditMode ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Priority */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Priority</label>
                                <select
                                    value={editValues.priority}
                                    onChange={(e) => setEditValues(v => ({ ...v, priority: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                            {/* Status */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Status</label>
                                <select
                                    value={editValues.status}
                                    onChange={(e) => setEditValues(v => ({ ...v, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option>Active</option>
                                    <option>Paused</option>
                                    <option>Completed</option>
                                    <option>Archived</option>
                                </select>
                            </div>
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={editValues.startDate}
                                    onChange={(e) => setEditValues(v => ({ ...v, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            {/* End Date */}
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={editValues.endDate}
                                    onChange={(e) => setEditValues(v => ({ ...v, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 grid-cols-2 gap-6">
                            <div>
                                <p className="text-m text-gray-500">Priority</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                            </div>
                            <div>
                                <p className="text-m text-gray-500">Status</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>{project.status}</span>
                            </div>
                            <div>
                                <p className="text-m text-gray-500">Start Date</p>
                                <p className="font-medium text-gray-700">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-m text-gray-500">End Date</p>
                                <p className="font-medium text-gray-700">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Project Goal */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Goal</h3>
                    {isEditingGoal ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveGoal}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingGoal(false);
                                        setGoal(project.goal || 'Click to add a project goal.');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsEditingGoal(true)}
                            className="text-gray-600 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                        >
                            {goal}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Project Members */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
                        <span className="text-sm text-gray-500">{members.length} members</span>
                    </div>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${member.color.startsWith('#') ? '' : member.color}`} style={member.color.startsWith('#') ? { backgroundColor: member.color } : {}}>
                                        {member.initials}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.role}</p>
                                    </div>
                                </div>
                                {member.isOwner && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Owner</span>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="w-full flex items-center gap-3 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
                        >
                            <div className="w-10 h-10 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-gray-600 font-medium">Add member</span>
                        </button>
                    </div>
                </div>

                {/* Project Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Team Members</span>
                            <span className="font-semibold text-gray-900">{members.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Team Member</h2>
                        <form onSubmit={handleAddMember}>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name or Email</label>
                                    <input
                                        type="text"
                                        value={newMember.identifier}
                                        onChange={handleIdentifierChange}
                                        placeholder="e.g., jacob or jacob@gmail.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        required
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="border border-gray-200 rounded mt-1 max-h-40 overflow-auto bg-white shadow z-10 absolute w-full">
                                            {suggestions.map((u) => (
                                                <li
                                                    key={u.id}
                                                    onClick={() => handleSelectSuggestion(u)}
                                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                                >
                                                    {u.username || u.name} <span className="text-gray-500 text-xs">{u.email}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="submit" className="flex-1 bg-cyan-500 text-white py-2 rounded-lg hover:bg-cyan-600">Add</button>
                                <button type="button" onClick={() => setShowAddMemberModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectOverview;