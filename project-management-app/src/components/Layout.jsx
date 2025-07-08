import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 256; // 16rem (w-64)
const HEADER_HEIGHT = 56; // 3.5rem (py-3 in Header)

const Layout = ({ children, onLogout, projects = [], showSidebar: externalShowSidebar = null }) => {
    // Internal state for sidebar visibility (only used if not controlled externally)
    const [internalShowSidebar, setInternalShowSidebar] = useState(true);

    // Use external state if provided, otherwise use internal state
    const showSidebar = externalShowSidebar !== null ? externalShowSidebar : internalShowSidebar;
    const setShowSidebar = externalShowSidebar !== null ? () => { } : setInternalShowSidebar;

    const toggleSidebar = () => {
        setShowSidebar((prev) => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 w-full z-40" style={{ height: HEADER_HEIGHT }}>
                <Header onToggleSidebar={toggleSidebar} onLogout={onLogout} />
            </div>
            <div className="flex-1 flex relative" style={{ paddingTop: HEADER_HEIGHT }}>
                {/* Fixed Sidebar, height fills below header only */}
                {showSidebar && (
                    <div
                        className="fixed left-0 w-64 bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out"
                        style={{ top: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
                    >
                        <Sidebar onLogout={onLogout} projects={projects} notifications={notifications} />
                    </div>
                )}
                {/* Main content with left padding for sidebar and top padding for header */}
                <main
                    className="flex-1 flex flex-col overflow-auto transition-all duration-300 ease-in-out"
                    style={{ paddingLeft: showSidebar ? SIDEBAR_WIDTH : 0 }}
                >
                    <div className="flex-1 p-6">
                        <div className="max-w-7xl mx-auto transition-all duration-300 ease-in-out">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout; 