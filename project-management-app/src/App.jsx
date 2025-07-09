import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/Signup';
import ProjectDetails from './pages/ProjectDetails';
import Inbox from './pages/Inbox';
import Team from './pages/Team';
import './App.css';
import { loginAsync, signupAsync, isTokenValid, refreshTokens, getUserId } from './API/AuthAPI';
import * as ProjectAPI from './API/ProjectAPI';
import { getAllUsers } from './API/UserAPI';
import * as ProjectTaskAPI from './API/ProjectTaskAPI';
import { getAllComments } from './API/CommentAPI';
import CreateProjectModal from './components/CreateProjectModal';
import * as signalR from "@microsoft/signalr"
import { getNotificationsByUserId } from './API/NotificationAPI';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [notifications, setNotifications] = useState({});
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  // Create signalR connection to listen to notification from server
  let connection;

  const buildSignalRConection = async (accessToken) => {
    return new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5179/notificationHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect()
      .build();
  }

  useEffect(() => {
    async function runApp() {
      var result = isTokenValid();
      if (result === null) return;
      if (!result.isValid) {
        try {
          await refreshTokens(result.userId, result.refreshToken);
          console.log("Successfully refreshed token.");
        } catch (e) {
          setIsAuthenticated(false);
          console.log("Error in refreshing tokens.", e);
          return;
        }
      }

      // If valid, begin fetching data
      await fetchDataAndSetUp();
    }
    runApp();
  }, [])

  // Global listener for opening the Create Project modal from anywhere
  useEffect(() => {
    const openCreateProjectModal = () => setShowCreateProjectModal(true);
    window.addEventListener('openCreateProject', openCreateProjectModal);
    return () => {
      window.removeEventListener('openCreateProject', openCreateProjectModal);
    };
  }, []);

  const fetchDataAndSetUp = async () => {
    var result = isTokenValid();
    if (!result.isValid) return null;
    setUserInfo({
      userId: result.userId,
      username: result.username,
      email: result.email,
      role: result.role,
    });
    setIsAuthenticated(true);
    await fetchProjects();
    await fetchUsers();
    await fetchProjectTasks();
    await fetchNotifications();

    // Start signalR connection
    try {
      connection = await buildSignalRConection(result.accessToken);
      await connection.start();
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
    }

    // Listen for messages from the server
    connection.on('ReceiveNotification', (notifications) => {
      setNotifications(prev => [...prev, notifications]);
      console.log('Notifications from server:', notifications);
      // Handle the message (e.g., update state)
    });
  }

  const fetchNotifications = async () => {
    try {
      const response = await getNotificationsByUserId();
      const data = response.data;
      console.log("Retrieved notifications: ", data);
      setNotifications(Array.isArray(data) ? data : (data.notifications || []));
    } catch (error) {
      setNotifications([]);
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const data = response.data;
      console.log("Retrieved users: ", data);
      setUsers(Array.isArray(data) ? data : (data.users || []));
    } catch (error) {
      setUsers([]);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await ProjectAPI.getAllProjectsByUserId();
      const data = response.data;
      console.log("Retrieved assigned projects: ", data);
      setProjects(Array.isArray(data) ? data : (data.projects || []));
    } catch (error) {
      console.error('Error fetching assigned projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await ProjectTaskAPI.getAllTasksByUserId();
      const data = response.data;
      console.log("Retrieved assigned project tasks: ", data);
      setProjectTasks(Array.isArray(data) ? data : (data.projectTasks || []));
    } catch (error) {
      console.error('Error fetching assigned project tasks:', error);
    }
  };

  const handleLogin = async (formData) => {
    try {
      const response = await loginAsync({ ...formData });
      localStorage.setItem("tokens", JSON.stringify(response.data));
      console.log("Successful login:", response.data);
      await fetchDataAndSetUp();
    } catch (error) {
      // Do something here like show a login fail message to user
      console.error("Error logging user in: ", error);
    }
  }

  const handleSignup = async ({ username, email, password, role }) => {
    try {
      const response = await signupAsync({ username, email, password, role });
      // Redirect user to login page after successful signup
      navigate('/login');
    } catch (error) {
      console.error("Error registering user: ", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("tokens");
    setIsAuthenticated(false);
  };

  const handleUpdateProject = (projectId, updates) => {
    setProjects(
      projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
  };

  // Handle creation of a new project from the modal
  const handleProjectCreate = async (projectData) => {
    try {
      const response = await ProjectAPI.addProject(projectData);
      // response is AxiosResponse; use its data property
      const newProject = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? null);

      if (newProject) {
        setProjects((prev) => [...prev, newProject]);
      } else {
        // Fallback: refetch all projects if format unexpected
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
    setShowCreateProjectModal(false);
  };

  // Protected Route Wrapper Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ?
              <Navigate to="/home" replace /> :
              <Login onLogin={handleLogin} />
          }
        />
        {/* Protected Routes */}
        <Route
          path="/signup"
          element={<Signup onSignup={handleSignup} />}
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home onLogout={handleLogout} projects={projects} projectTasks={projectTasks} userInfo={userInfo} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks
                onLogout={handleLogout}
                projects={projects}
                projectTasks={projectTasks}
                userInfo={userInfo}
              />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectDetails onLogout={handleLogout}
              userInfo={userInfo}
               />
            </ProtectedRoute>
          }
        /> */}
        {/* Project Details */}
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetails onLogout={handleLogout} projects={projects} projectTasks={projectTasks} onUpdateProject={handleUpdateProject} users={users} userInfo={userInfo} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox onLogout={handleLogout} projects={projects} notifications={notifications} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Team onLogout={handleLogout} projects={projects} teamMembers={users} />
            </ProtectedRoute>
          }
        />
        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />
      </Routes>
      {/* Global Create Project Modal */}
      {showCreateProjectModal && (
        <CreateProjectModal
          onClose={() => setShowCreateProjectModal(false)}
          onCreate={handleProjectCreate}
          projectsCount={projects.length}
        />
      )}
    </div>
  );
}
export default App;
