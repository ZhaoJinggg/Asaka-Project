export const inboxMessages = [
    {
        id: 1,
        type: 'task_assigned',
        title: 'New task assigned: Review API documentation',
        content: 'You have been assigned a new task to review the API documentation for the v3 release.',
        sender: 'Sarah Chen',
        senderAvatar: 'SC',
        project: 'API Development',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        priority: 'high',
        actionRequired: true
    },
    {
        id: 2,
        type: 'project_update',
        title: 'Project status updated: Website Redesign',
        content: 'The Website Redesign project has moved to the Development phase. All design assets have been approved.',
        sender: 'Mike Johnson',
        senderAvatar: 'MJ',
        project: 'Website Redesign',
        timestamp: '2024-01-15T09:15:00Z',
        isRead: false,
        priority: 'medium',
        actionRequired: false
    },
    {
        id: 3,
        type: 'comment',
        title: 'Comment on task: Draft project brief',
        content: 'Great work on the initial draft! Could you add more details about the technical requirements?',
        sender: 'Alex Rodriguez',
        senderAvatar: 'AR',
        project: 'Main Project',
        timestamp: '2024-01-15T08:45:00Z',
        isRead: true,
        priority: 'medium',
        actionRequired: true
    },
    {
        id: 4,
        type: 'deadline_reminder',
        title: 'Deadline reminder: Submit report',
        content: 'Your report for the Main Project is due tomorrow. Please ensure all sections are complete.',
        sender: 'System',
        senderAvatar: 'S',
        project: 'Main Project',
        timestamp: '2024-01-15T08:00:00Z',
        isRead: true,
        priority: 'high',
        actionRequired: true
    },
    {
        id: 5,
        type: 'team_invite',
        title: 'You\'ve been invited to join: Mobile App team',
        content: 'You have been invited to join the Mobile App development team as a Frontend Developer.',
        sender: 'Lisa Wang',
        senderAvatar: 'LW',
        project: 'Mobile App',
        timestamp: '2024-01-14T16:30:00Z',
        isRead: false,
        priority: 'high',
        actionRequired: true
    },
    {
        id: 6,
        type: 'project_update',
        title: 'Project completed: API Development',
        content: 'Congratulations! The API Development project has been successfully completed and deployed to production.',
        sender: 'David Kim',
        senderAvatar: 'DK',
        project: 'API Development',
        timestamp: '2024-01-14T14:20:00Z',
        isRead: true,
        priority: 'low',
        actionRequired: false
    },
    {
        id: 7,
        type: 'comment',
        title: 'Comment on task: Schedule kickoff meeting',
        content: 'I\'ve reviewed the agenda. Looks good to me! Should we invite the marketing team as well?',
        sender: 'Emma Thompson',
        senderAvatar: 'ET',
        project: 'Website Redesign',
        timestamp: '2024-01-14T11:15:00Z',
        isRead: true,
        priority: 'low',
        actionRequired: false
    },
    {
        id: 8,
        type: 'task_assigned',
        title: 'New task assigned: Create wireframes',
        content: 'You have been assigned to create wireframes for the new user dashboard feature.',
        sender: 'Chris Lee',
        senderAvatar: 'CL',
        project: 'Website Redesign',
        timestamp: '2024-01-14T10:00:00Z',
        isRead: true,
        priority: 'medium',
        actionRequired: true
    },
    {
        id: 9,
        type: 'project_update',
        title: 'Project paused: My second project',
        content: 'The My second project has been temporarily paused due to resource constraints. We\'ll resume in 2 weeks.',
        sender: 'Jennifer Smith',
        senderAvatar: 'JS',
        project: 'My second project',
        timestamp: '2024-01-13T17:45:00Z',
        isRead: true,
        priority: 'medium',
        actionRequired: false
    },
    {
        id: 10,
        type: 'deadline_reminder',
        title: 'Deadline reminder: Review requirements',
        content: 'The requirements review for the Mobile App project is due in 3 days. Please complete your review.',
        sender: 'System',
        senderAvatar: 'S',
        project: 'Mobile App',
        timestamp: '2024-01-13T15:30:00Z',
        isRead: true,
        priority: 'high',
        actionRequired: true
    }
];

export const messageTypes = {
    task_assigned: {
        label: 'Task Assigned',
        icon: '📋',
        color: 'bg-blue-100 text-blue-700'
    },
    project_update: {
        label: 'Project Update',
        icon: '📊',
        color: 'bg-green-100 text-green-700'
    },
    comment: {
        label: 'Comment',
        icon: '💬',
        color: 'bg-purple-100 text-purple-700'
    },
    deadline_reminder: {
        label: 'Deadline Reminder',
        icon: '⏰',
        color: 'bg-red-100 text-red-700'
    },
    team_invite: {
        label: 'Team Invite',
        icon: '👥',
        color: 'bg-orange-100 text-orange-700'
    }
};

export const priorityColors = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-400 text-gray-900',
    low: 'bg-green-400 text-gray-900'
}; 