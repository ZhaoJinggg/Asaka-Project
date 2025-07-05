import { createContext, useContext, useState } from 'react';
import { initialTasks } from '../data/task';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState(initialTasks);

    const addTask = (task) => {
        setTasks((prev) => [...prev, task]);
    };

    const updateTask = (taskId, updates) => {
        setTasks((prev) => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext); 