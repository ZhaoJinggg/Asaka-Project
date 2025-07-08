import { useState } from 'react';
import Layout from '../components/Layout';
import { removeHyphen, capitalizeEachWord } from '../Utils/Utils';

const Team = ({ onLogout, projects = [], teamMembers = [] }) => {
    const [members] = useState(teamMembers);
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Show all members since we removed filtering
    const filteredMembers = members;

    return (
        <Layout onLogout={onLogout} projects={projects} >
            <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
                <div className="flex-1 flex flex-col items-center justify-start px-4 py-8">
                    {/* Header */}
                    <div className="w-full max-w-6xl mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Team</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Team Members Container */}
                    <div className="w-full max-w-6xl flex gap-6">
                        {/* Members Grid/List */}
                        <div className="flex-1">
                            {filteredMembers.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No team members found</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => setSelectedMember(member)}
                                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
                                                        {String(member.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{member.username}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {capitalizeEachWord(removeHyphen(member.role))}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                    <span className="truncate">{member.email}</span>
                                                </div>

                                                {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="truncate">{member.location}</span>
                                                </div> */}

                                                {/* <div className="flex flex-wrap gap-1">
                                                    {member.skills.slice(0, 3).map((skill, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {member.skills.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            +{member.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="divide-y divide-gray-100">
                                        {filteredMembers.map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => setSelectedMember(member)}
                                                className="p-6 cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
                                                        {String(member.username).charAt(0).toUpperCase()}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">{member.username}</h3>
                                                                <p className="text-sm text-gray-600">{capitalizeEachWord(removeHyphen(member.role))}</p>
                                                            </div>
                                                            {/* <div className="text-right">
                                                                <p className="text-sm text-gray-600">{member.department}</p>
                                                                <p className="text-xs text-gray-500">{member.location}</p>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Member Details */}
                        {selectedMember && (
                            <div className="w-96 h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Member Details</h3>
                                        <button
                                            onClick={() => setSelectedMember(null)}
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
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-medium text-gray-700">
                                            {String(selectedMember.username).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">{selectedMember.username}</h4>
                                            <p className="text-gray-600">{capitalizeEachWord(removeHyphen(selectedMember.role))}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h5>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                    </svg>
                                                    <span className="text-gray-700">{selectedMember.email}</span>
                                                </div>
                                                {/* <div className="flex items-center gap-3 text-sm">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-gray-700">{selectedMember.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-gray-700">{selectedMember.location}</span>
                                                </div> */}
                                            </div>
                                        </div>

                                        {/* <div>
                                            <h5 className="text-sm font-medium text-gray-900 mb-3">Projects</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMember.projects.map((project, index) => (
                                                    <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                                                        {project}
                                                    </span>
                                                ))}
                                            </div>
                                        </div> */}



                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex gap-3">
                                                <button className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200 font-medium">
                                                    Message
                                                </button>
                                                <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                                                    View Profile
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

export default Team; 