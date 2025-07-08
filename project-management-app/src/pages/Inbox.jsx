import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import * as Utils from "../Utils/Utils";
import { deleteNotificationById, markRead } from '../API/NotificationAPI';

const Inbox = ({ onLogout, projects = [], notifications = [] }) => {
    const [messages, setMessages] = useState(notifications);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const getTitle = (type) => {
      switch(type){
        case "AssignedTask":
          return "New Task";
        case "MentionedInComment":
          return "Mentioned In Comment";
        default:
          return "New Notification";
      }
    }

    // Filter messages based on selected filter and search query
    const filteredMessages = useMemo(() => {
        let filtered = messages;

        // Apply filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(message => {
                if (selectedFilter === 'unread') return !message.isRead;
                return message.type === selectedFilter;
            });
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(message =>
                message.type.toLowerCase().includes(query) ||
                message.message.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [messages, selectedFilter, searchQuery]);

    // Get unread count
    const unreadCount = messages.filter(m => !m.isRead).length;

    // Mark message as read
    const markAsRead = async (messageId) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
        ));
        
        // Update in the database
        await markRead(messageId);
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));

        // Update in the database
        messages.forEach(async (message) => { await markRead(message.id)});
    };

    // Delete message
    const deleteMessage = async (messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
        }
        // Delete from database
        await deleteNotificationById(messageId);
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const filters = [
        { id: 'all', label: 'All', count: messages.length },
        { id: 'unread', label: 'Unread', count: unreadCount },
    ];

    return (
        <Layout onLogout={onLogout} projects={projects} >
            <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
                <div className="flex-1 flex flex-col items-center justify-start px-4 py-8">
                    {/* Header */}
                    <div className="w-full max-w-6xl mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                                {filters.map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedFilter(filter.id)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors duration-200 ${selectedFilter === filter.id
                                            ? 'bg-cyan-100 text-cyan-700'
                                            : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {filter.label}
                                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                                            {filter.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="w-full max-w-6xl flex gap-6">
                        {/* Message List */}
                        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Messages ({filteredMessages.length})
                                </h2>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto">
                                {filteredMessages.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">No messages found</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredMessages.map(message => (
                                            <div
                                                key={message.id}
                                                onClick={() => {
                                                    setSelectedMessage(message);
                                                    if (!message.isRead) {
                                                        markAsRead(message.id);
                                                    }
                                                }}
                                                className={`p-6 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${selectedMessage?.id === message.id ? 'bg-cyan-50 border-r-4 border-cyan-500' : ''
                                                    } ${!message.isRead ? 'bg-blue-50' : ''}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-sm text-gray-500">
                                                                        {formatTimestamp(message.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <h3 className={`text-base font-medium mb-1 ${!message.isRead ? 'text-gray-900' : 'text-gray-700'
                                                                    }`}>
                                                                    {getTitle(message.type)}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                                    {message.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteMessage(message.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message Detail */}
                        {selectedMessage && (
                            <div className="w-96 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                                        <button
                                            onClick={() => setSelectedMessage(null)}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{getTitle(selectedMessage.type)}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-lg font-medium text-gray-900 mb-2">{selectedMessage.title}</h5>
                                            <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                                <p className="text-sm text-gray-500">{formatTimestamp(selectedMessage.createdAt)}</p>
                                            </span>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex gap-3">
                                                <button className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200 font-medium">
                                                    Reply
                                                </button>
                                                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                                                    Mark as Read
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Inbox; 