// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import AsanaLogo from "../assets/asana-logo.svg";
import ProjectsIcon from "../assets/folders-svgrepo-com.svg";
import TasksIcon from "../assets/to-do-svgrepo-com.svg";
import TeamIcon from "../assets/team-svgrepo-com.svg";
import MessageIcon from "../assets/message-square-svgrepo-com.svg";
import InviteIcon from "../assets/add-user-svgrepo-com.svg";
import UserProfileIcon from "../assets/profile-circle-svgrepo-com.svg";
import LogoutIcon from "../assets/logout-svgrepo-com.svg";
import ArchiveIcon from "../assets/archive-svgrepo-com.svg";
import { updateProject } from "../API/ProjectAPI";
import { useNavigate } from "react-router-dom";

import { authenticatedOnlyAsync, isTokenValid } from "../API/AuthAPI.js";

const Header = ({ onToggleSidebar, onLogout, projects = [] }) => {
  const navigate = useNavigate();
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const createDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  // Local copy of archived projects so UI updates immediately after restore
  const [archivedList, setArchivedList] = useState([]);

  // Whenever projects prop changes, update archived list
  useEffect(() => {
    const archived = (projects || []).filter(
      (p) => (p.status || "").toLowerCase() === "archived" || p.archived
    );
    setArchivedList(archived);
  }, [projects]);

  // Handle restoring / changing status of an archived project
  const handleRestore = async (project, newStatus = "Active") => {
    try {
      const payload = {
        title: project.title,
        description: project.description,
        goal: project.goal,
        color: project.color,
        priority: project.priority,
        status: newStatus,
        startDate: project.startDate,
        endDate: project.endDate,
      };
      await updateProject(project.id, payload);
      // Remove from local list so UI updates
      setArchivedList((prev) => prev.filter((p) => p.id !== project.id));
      // Navigate to the appropriate page
      if (newStatus.toLowerCase() === 'archived') {
        navigate('/home');
      } else {
        navigate(`/projects/${project.id}`);
      }
      // Force reload to ensure global state refreshes
      window.location.reload();
    } catch (err) {
      console.error("Failed to change project status", err);
    }
  };

  const handleLogoClick = async () => {
    var message = await authenticatedOnlyAsync();
    console.log(message);
  };

  // Fetch user info from token once on mount
  useEffect(() => {
    const result = isTokenValid();
    if (result && result.isValid) {
      setUsername(result.username || "");
      setEmail(result.email || "");
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) {
        setShowCreateDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateProject = () => {
    setShowCreateDropdown(false);
    // Dispatch an event that pages/components can listen for to show the Create Project modal
    window.dispatchEvent(new CustomEvent("openCreateProject"));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center">
      {/* Left Section - Logo, Asaka, Hamburger Menu, Create Button */}
      <div className="flex items-center gap-4">
        {/* Logo and Asaka branding */}
        <div className="flex items-center gap-3" onClick={handleLogoClick}>
          <img src={AsanaLogo} alt="Asaka Logo" className="w-8 h-8" />
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">
            Asaka
          </h2>
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Create Button with Dropdown */}
        <div className="relative" ref={createDropdownRef}>
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="bg-white hover:bg-gray-100 text-gray-700 px-2 py-1.5 rounded-full flex items-center gap-3 transition-colors duration-200 font-medium text-sm border border-gray-200"
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            Create
          </button>

          {/* Dropdown Menu */}
          {showCreateDropdown && (
            <div className="absolute top-full left-0 mt-2 w-42 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {<button
                onClick={() => setShowCreateDropdown(false)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={TasksIcon}
                  alt="Tasks"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Task</span>
              </button>}

              <button
                onClick={handleCreateProject}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={ProjectsIcon}
                  alt="Projects"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Project</span>
              </button>

              {<button
                onClick={() => setShowCreateDropdown(false)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={MessageIcon}
                  alt="Message"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Message</span>
              </button>}

              {<button
                onClick={() => setShowCreateDropdown(false)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={TeamIcon}
                  alt="Team"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Team</span>
              </button>}

              {<div className="border-t border-gray-200 my-2"></div>}

              {<button
                onClick={() => setShowCreateDropdown(false)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={InviteIcon}
                  alt="Invite"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Invite</span>
              </button>}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search"
          />
        </div>

        {/* Search Bar dropdown prototype */}
        {/* {showProfileDropdown && (
          <div className="absolute top-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {username ? username.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{username || "User"}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  // navigate to profile page
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={UserProfileIcon}
                  alt="Profile"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Profile</span>
              </button>
            </div>
            <div className="border-t border-gray-200 my-0"></div>
            <div className="py-2">
              <button
                onClick={() => {
                  onLogout();
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={LogoutIcon}
                  alt="Logout"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Log out</span>
              </button>
            </div>
          </div>
        )} */}
      </div>

      {/* Right Section - User Profile */}
      <div className="flex items-center relative" ref={profileDropdownRef}>
        <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {username ? username.charAt(0).toUpperCase() : "?"}
        </button>

        {showProfileDropdown && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {username ? username.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{username || "User"}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  // navigate to profile page
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={UserProfileIcon}
                  alt="Profile"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowArchiveModal(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={ArchiveIcon}
                  alt="Archive"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Archive</span>
              </button>
            </div>
            <div className="border-t border-gray-200 my-0"></div>
            <div className="py-2">
              <button
                onClick={() => {
                  onLogout();
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <img
                  src={LogoutIcon}
                  alt="Logout"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-gray-700">Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Archived Projects</h2>
            {archivedList.length === 0 ? (
              <p className="text-gray-500">No archived projects.</p>
            ) : (
              <ul className="space-y-5 max-h-80 overflow-auto">
                {archivedList.map((proj) => {
                  const ownerName =
                    proj.owner?.username ||
                    proj.ownerName ||
                    proj.createdBy ||
                    proj.createdByName ||
                    "No owner";
                  return (
                    <li
                      key={proj.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold">{proj.title}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({ownerName})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(proj, "Active")}
                          className="text-xs bg-cyan-500 text-white px-3 py-2 rounded hover:bg-cyan-600"
                        >
                          Restore
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
