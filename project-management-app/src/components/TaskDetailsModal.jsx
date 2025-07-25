import { useState, useEffect, useRef } from 'react';
import { FiPaperclip, FiX, FiDownload, FiFile } from 'react-icons/fi';
import * as ProjectTaskAPI from '../API/ProjectTaskAPI';
import * as CommentAPI from '../API/CommentAPI';
import * as ProjectAPI from '../API/ProjectAPI';
import { getUserId } from '../API/AuthAPI';
import CalendarIcon from '../assets/calendar-days-svgrepo-com.svg';
import { people } from '../data/people';
import { getAllUsers } from '../API/UserAPI';

const statusColors = {
  completed: 'bg-green-700 text-white',
  in_progress: 'bg-yellow-600 text-white',
  todo: 'bg-gray-600 text-white',
};

const priorityColors = {
  low: 'bg-green-400 text-gray-900',
  medium: 'bg-yellow-400 text-gray-900',
  high: 'bg-orange-400 text-white',
};

function TaskDetailsModal({ task, onClose, onSave, projects, onAddComment, userInfo }) {
  const [editTask, setEditTask] = useState({ ...task, attachments: task.attachments || [] });
  const [loading, setLoading] = useState(false);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(null); // subtask object or null
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'todo',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const modalRef = useRef(null);
  const assigneeInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [taskComments, setTaskComments] = useState([]);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskError, setSubtaskError] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [subtasks, setSubtasks] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(undefined);

  // Debug logs
  console.log('TaskDetailsModal taskComments state:', taskComments);

  useEffect(() => {
    // Trap focus
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current.querySelectorAll('input,button,select,textarea');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {

    const fetchTaskandComment = async () => {
      if (!task?.id) return;
      setLoading(true);
      setLoadingTasks(true);
      try {
        const response = await ProjectTaskAPI.getTaskById(task.id);
        const data = response?.data || response;
        const responseComment = await CommentAPI.getCommentsByProjectTaskId(task.id);
        const dataComment = responseComment?.data || responseComment;
        const responseAllTasks = await ProjectTaskAPI.getAllTasks();
        const dataAllTasks = responseAllTasks?.data || responseAllTasks;

        console.log('Fetched task data:', data);
        setEditTask({ ...data, attachments: data.attachments || [] });
        setTaskComments(Array.isArray(dataComment) ? dataComment : (dataComment.comments || []));
        setAllTasks(Array.isArray(dataAllTasks) ? dataAllTasks : []);
        setSubtasks(dataAllTasks.filter(t => t.nestedLevel === 1 && t.parentId === task.id));

        // Fetch project members for assignee dropdown
        const projId = data.projectId || task.projectId || data.project?.id;
        if (projId) {
          try {
            const projResp = await ProjectAPI.getProjectById(projId);
            const projData = projResp?.data || projResp;
            const collected = [];

            const getInitials = (name) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase();
            const colorClasses = ['bg-cyan-500', 'bg-purple-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500'];

            const ownerApi = projData?.owner || projData?.projectOwner;
            if (ownerApi) {
              collected.push({
                id: ownerApi.id ?? 'owner',
                name: ownerApi.username || ownerApi.name || (ownerApi.email ? ownerApi.email.split('@')[0] : 'Owner'),
                email: ownerApi.email || '',
                initials: getInitials(ownerApi.username || ownerApi.name || ownerApi.email),
                role: 'Owner',
                color: colorClasses[0],
              });
            }

            const membersApi =
              (Array.isArray(projData?.members) && projData.members) ||
              (Array.isArray(projData?.assignees) && projData.assignees) ||
              (Array.isArray(projData?.assignedUsers) && projData.assignedUsers) ||
              [];

            membersApi.forEach((u, idx) => {
              if (collected.some((m) => (u.id && m.id === u.id) || (u.email && m.email === u.email))) return;
              collected.push({
                id: u.id ?? `member-${idx}`,
                name: u.username || u.name || (u.email ? u.email.split('@')[0] : 'User'),
                email: u.email || '',
                initials: getInitials(u.username || u.name || u.email),
                role: u.role || 'Member',
                color: colorClasses[(idx + 1) % colorClasses.length],
              });
            });

            setPeople(collected);
          } catch (err) {
            console.error('Failed to fetch project members', err);
          }
        }
      } catch (error) {
        // Optionally handle error
      } finally {
        setLoading(false);
        setLoadingTasks(false);
      }
    };
    fetchTaskandComment();
    // return () => { isMounted = false; };
  }, [task?.id]);

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

  // Filter people by query
  const filteredPeople = assigneeQuery
    ? people.filter(p =>
      p.name.toLowerCase().includes(assigneeQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(assigneeQuery.toLowerCase())
    )
    : people;

  const handleSave = async () => {
    // Assign user if changed
    if (editTask.assignee && editTask.assignee.id !== task.assignee?.id) {
      try {
        await ProjectTaskAPI.assignTaskToUser(task.id, editTask.assignee.id);
      } catch (err) {
        console.error('Failed to assign task', err);
      }
    }

    // Persist other task field changes
    try {
      const payload = {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        endDate: editTask.endDate,
      };
      await ProjectTaskAPI.updateTask(task.id, payload);
    } catch (err) {
      console.error('Failed to update task fields', err);
    }

    onSave(editTask);
    onClose();
  };

  // Subtask logic
  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim()) return;
    setAddingSubtask(true);
    setSubtaskError('');
    try {
      console.log('About to call addSubtask', task.id, newSubtask);
      const userId = await getUserId();
      const response = await ProjectTaskAPI.addSubtask(task.id, userId, { ...newSubtask });
      console.log('addSubtask response:', response);
      const createdSubtask = response.data || response;
      // setEditTask(t => ({
      //   ...t,
      //   subtasks: [
      //     ...t.subtasks,
      //     createdSubtask,
      //   ],
      // }));
      setNewSubtask({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'todo',
      });
      setShowSubtaskForm(false);
    } catch (error) {
      console.log('Subtask creation error:', error);
      setSubtaskError('Failed to add subtask. Please try again.');
    } finally {
      setAddingSubtask(false);
    }
  };

  // const handleToggleSubtask = (subId) => {
  //   setEditTask(t => ({
  //     ...t,
  //     subtasks: t.subtasks.map(st =>
  //       st.id === subId ? { ...st, completed: !st.completed } : st
  //     ),
  //   }));
  // };

  // const handleUpdateSubtask = (subId, updated) => {
  //   setEditTask(t => ({
  //     ...t,
  //     subtasks: t.subtasks.map(st =>
  //       st.id === subId ? { ...st, ...updated } : st
  //     ),
  //   }));
  // };

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file) // In a real app, this would be uploaded to a server
    }));

    setEditTask(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));

    // Reset file input
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId) => {
    setEditTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    return '📎';
  };

  // Add comment handler
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    try {
      await onAddComment(task.id, { content: newComment });
      setNewComment('');
    } catch (error) {
      // Optionally show error
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-full z-50 w-full max-w-xl bg-white text-black rounded-l-2xl shadow-2xl flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading task details...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 h-full z-50 w-full max-w-xl bg-white text-black rounded-l-2xl shadow-2xl transition-transform duration-300 ease-in-out animate-slide-in flex flex-col" style={{ minWidth: 380 }} ref={modalRef} tabIndex={-1}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {/* Main scrollable content */}
        <div className="flex-1 overflow-y-auto pr-2" style={{ paddingTop: 8, paddingBottom: 24 }}>
          <div className="px-6 py-4">
            {/* Status badge */}
            <div className="mb-2 mt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-green-700 text-white text-xs font-semibold">
                {editTask.completed ? 'Completed' :
                  (editTask.status === 'in_progress' ? 'In progress' :
                    editTask.status === 'todo' ? 'To do' :
                      editTask.status === 'completed' ? 'Completed' :
                        editTask.status || 'To do')}
              </span>
            </div>
            {/* Title */}
            <h2 className="text-2xl font-bold mb-6">{editTask.title}</h2>
            {/* Vertical Fields */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Assignee */}
              <div>
                <div className="text-sm text-gray-500 mb-1">Assignee</div>
                {editTask.assignee ? (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base ${editTask.assignee.color?.startsWith('#') ? '' : editTask.assignee.color} text-white`} style={editTask.assignee.color?.startsWith('#') ? { backgroundColor: editTask.assignee.color } : {}}>
                      {editTask.assignee.initials}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{editTask.assignee.name}</span>
                      <span className="text-xs text-gray-500">{editTask.assignee.email}</span>
                    </div>
                    <button
                      className="ml-2 text-gray-400 hover:text-red-500 text-lg font-bold"
                      onClick={() => setEditTask(t => ({ ...t, assignee: null }))}
                      aria-label="Remove assignee"
                      disabled={currentUserRole === 'contributor'}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={assigneeInputRef}
                      type="text"
                      className="w-full bg-gray-100 rounded-lg px-3 py-2 text-black focus:outline-none"
                      placeholder="Name or email"
                      value={assigneeQuery}
                      onChange={e => {
                        setAssigneeQuery(e.target.value);
                        setShowAssigneeDropdown(true);
                      }}
                      onFocus={() => setShowAssigneeDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 150)}
                      autoComplete="off"
                      disabled={currentUserRole === 'contributor'}
                    />
                    {showAssigneeDropdown && filteredPeople.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                        {filteredPeople.map(person => (
                          <button
                            key={person.id}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                            onMouseDown={e => {
                              e.preventDefault();
                              setEditTask(t => ({ ...t, assignee: person }));
                              setAssigneeQuery('');
                              setShowAssigneeDropdown(false);
                            }}
                            disabled={currentUserRole === 'contributor'}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base ${person.color?.startsWith('#') ? '' : person.color} text-white`} style={person.color?.startsWith('#') ? { backgroundColor: person.color } : {}}>
                              {person.initials}
                            </span>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{person.name}</span>
                              <span className="text-xs text-gray-500">{person.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Due date */}
              <div>
                <div className="text-sm text-gray-500 mb-1">Due date</div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <img src={CalendarIcon} alt="Calendar" className="w-5 h-5" />
                  <input
                    type="date"
                    className="bg-transparent text-black focus:outline-none"
                    value={editTask.endDate ? editTask.endDate.slice(0, 10) : ''}
                    onChange={e => setEditTask(t => ({ ...t, endDate: e.target.value }))}
                    disabled={currentUserRole === 'contributor'}
                  />
                </div>
              </div>

              {/* Project (read-only) */}
              {editTask.projectName && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Project</div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                    <span>{editTask.projectName}</span>
                    <span className="ml-2 text-xs text-gray-500">To do</span>
                  </div>
                </div>
              )}
            </div>
            {/* Fields: Priority, Status */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Fields</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-col divide-y divide-gray-200">
                  <div className="flex items-center px-4 py-2">
                    <span className="mr-2">Priority</span>
                    <select
                      className={`rounded px-2 py-1 text-xs font-semibold ml-auto ${priorityColors[editTask.priority?.value || editTask.priority || 'medium']}`}
                      value={editTask.priority?.value || editTask.priority || 'medium'}
                      onChange={e => setEditTask(t => ({ ...t, priority: e.target.value }))}
                      disabled={currentUserRole === 'contributor'}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex items-center px-4 py-2">
                    <span className="mr-2">Status</span>
                    <select
                      className={`rounded px-2 py-1 text-xs font-semibold ml-auto ${statusColors[editTask.status || 'todo']}`}
                      value={editTask.status}
                      onChange={e => setEditTask(t => ({ ...t, status: e.target.value }))}
                      disabled={false}
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <textarea
                className="w-full bg-gray-100 rounded-lg p-3 text-black focus:outline-none"
                rows={3}
                placeholder="What is this task about?"
                value={editTask.description || ''}
                onChange={e => setEditTask(t => ({ ...t, description: e.target.value }))}
                disabled={currentUserRole === 'contributor'}
              />
            </div>
            {/* Attachments */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Attachments</div>
              {editTask.attachments && editTask.attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {editTask.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-3 bg-gray-100 rounded-lg p-3">
                      <span className="text-xl">{getFileIcon(attachment.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{attachment.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove attachment"
                        disabled={currentUserRole === 'contributor'}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                  disabled={currentUserRole === 'contributor'}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100"
                  disabled={currentUserRole === 'contributor'}
                >
                  <FiPaperclip size={16} />
                  Add files
                </button>
              </div>
            </div>
            {/* Subtasks */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Subtasks</div>
              <div className="divide-y divide-gray-200">
                {loadingTasks ? (
                  <div className="text-gray-400 py-2">Loading subtasks...</div>
                ) : (
                  subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 py-2">
                      <span className={`flex-1 ${subtask.status === 'completed' ? 'line-through text-gray-400' : 'text-black'}`}>{subtask.title}</span>
                    </div>
                  ))
                )}
              </div>
              {/* Add Subtask Button and Form BELOW the list (if you want to keep it) */}
              {!showSubtaskForm && (
                <button
                  className="mt-2 px-3 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => setShowSubtaskForm(true)}
                  disabled={currentUserRole === 'contributor'}
                >
                  <span className="text-lg">+</span> Add Subtask
                </button>
              )}
              {showSubtaskForm && (
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1"
                      placeholder="Subtask title"
                      value={newSubtask.title}
                      onChange={e => setNewSubtask(s => ({ ...s, title: e.target.value }))}
                      disabled={currentUserRole === 'contributor'}
                    />
                    <textarea
                      className="border rounded px-2 py-1"
                      placeholder="Description"
                      value={newSubtask.description}
                      onChange={e => setNewSubtask(s => ({ ...s, description: e.target.value }))}
                      disabled={currentUserRole === 'contributor'}
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="border rounded px-2 py-1 flex-1"
                        value={newSubtask.startDate}
                        onChange={e => setNewSubtask(s => ({ ...s, startDate: e.target.value }))}
                        disabled={currentUserRole === 'contributor'}
                      />
                      <input
                        type="date"
                        className="border rounded px-2 py-1 flex-1"
                        value={newSubtask.endDate}
                        onChange={e => setNewSubtask(s => ({ ...s, endDate: e.target.value }))}
                        disabled={currentUserRole === 'contributor'}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="border rounded px-2 py-1 flex-1"
                        value={newSubtask.priority}
                        onChange={e => setNewSubtask(s => ({ ...s, priority: e.target.value }))}
                        disabled={currentUserRole === 'contributor'}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <select
                        className="border rounded px-2 py-1 flex-1"
                        value={newSubtask.status}
                        onChange={e => setNewSubtask(s => ({ ...s, status: e.target.value }))}
                        disabled={currentUserRole === 'contributor'}
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {subtaskError && <div className="text-red-500 text-sm">{subtaskError}</div>}
                    <div className="flex gap-2 mt-2">
                      <button
                        className="bg-cyan-600 text-white px-3 py-1 rounded"
                        onClick={handleAddSubtask}
                        disabled={!newSubtask.title.trim() || addingSubtask || currentUserRole === 'contributor'}
                      >
                        {addingSubtask ? 'Adding...' : 'Add Subtask'}
                      </button>
                      <button
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded"
                        onClick={() => { setShowSubtaskForm(false); setNewSubtask({ title: '', description: '', startDate: '', endDate: '', priority: 'medium', status: 'todo' }); setSubtaskError(''); }}
                        disabled={addingSubtask || currentUserRole === 'contributor'}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* --- COMMENT SECTION --- */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Comments</h3>
              <div className="space-y-2">
                {taskComments.length === 0 && <div className="text-gray-500">No comments yet.</div>}
                {taskComments.map(comment => (
                  <div key={comment.id} className="bg-gray-100 rounded p-2">
                    <div className="text-sm text-gray-800">{comment.content}</div>
                    <div className="text-xs text-gray-500">
                      {comment.owner?.username || 'Unknown'} • {new Date(comment.postDate).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded px-2 py-1"
                  disabled={addingComment}
                />
                <button
                  onClick={handleAddComment}
                  className="bg-cyan-600 text-white px-3 py-1 rounded"
                  disabled={addingComment || !newComment.trim()}
                >
                  {addingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Save/Cancel */}
      <div className="flex justify-end gap-2 mt-8 p-4 bg-white border-t border-gray-100 sticky bottom-0 left-0 right-0 z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg font-semibold bg-cyan-500 text-white hover:bg-cyan-600"
        >
          Save
        </button>
      </div>
      <style jsx>{`
        .animate-slide-in {
          transform: translateX(100%);
          animation: slideInDrawer 0.3s forwards;
        }
        @keyframes slideInDrawer {
          to {
            transform: translateX(0);
          }
        }
      `}</style>
      {/* Subtask detail modal */}
      {
        showSubtaskModal && (
          <TaskDetailsModal
            task={showSubtaskModal}
            onClose={() => setShowSubtaskModal(null)}
            onSave={updated => {
              // handleUpdateSubtask(showSubtaskModal.id, updated);
              setShowSubtaskModal(null);
            }}
            projects={projects}
            onAddComment={onAddComment}
          />
        )
      }
    </>
  );
}

export default TaskDetailsModal; 