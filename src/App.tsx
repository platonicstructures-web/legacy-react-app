Here is the comprehensive re-architecture of the legacy C++ Task Manager into a modern React 18+ Single Page Application.

### Project Analysis & Consolidation Strategy

1.  **Logic Mapping (`TaskManager.h/cpp` $\rightarrow$ `useTaskManager` Hook)**:
    *   The `TaskManager` class state (`std::vector<Task>`, `nextId`) is converted into React State (`useState`).
    *   Member functions (`addTask`, `completeTask`) are converted into exported functions within a custom hook.
    *   The `std::cout` operations are intercepted and redirected to a specific "System Log" state array to mimic the legacy console output alongside the modern UI.

2.  **Resource Mapping (`resource.rc` $\rightarrow$ `MenuBar` Component)**:
    *   The `IDR_MAIN_MENU` structure is converted into a top-level Navigation Bar.
    *   `ID_HELP_ABOUT` triggers a React Modal (Dialog).
    *   `ID_FILE_EXIT` triggers a session reset.

3.  **Entry Point (`main.cpp` $\rightarrow$ `App.tsx`)**:
    *   The `main()` function initialization is converted into a `useEffect` that loads initial sample data, preserving the original logic: "Refactor Legacy Code" and "Upload Multiple Files".

---

### The React Application

You can copy this code directly into a file named `App.tsx` in a Vite/CRA project setup with Tailwind CSS.

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Check, Plus, X, Menu, Info, FileText, Command } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * TYPE DEFINITIONS (Mapped from TaskManager.h)
 * ------------------------------------------------------------------
 */

interface Task {
  id: number;
  description: string; // std::string description
  completed: boolean;  // bool completed
}

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
}

/**
 * ------------------------------------------------------------------
 * CUSTOM HOOK (Logic Layer)
 * Maps C++ class TaskManager to a React Hook.
 * ------------------------------------------------------------------
 */
const useTaskManager = () => {
  // State analogous to private members in TaskManager.h
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  
  // "Console" buffer to mimic std::cout behavior
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Helper to mimic std::cout << ... << std::endl
  const logOutput = (msg: string) => {
    const entry: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message: msg
    };
    setLogs(prev => [...prev, entry]);
  };

  // Maps: void TaskManager::addTask(const std::string& desc)
  const addTask = (description: string) => {
    const newTask: Task = { id: nextId, description, completed: false };
    setTasks(prev => [...prev, newTask]);
    setNextId(prev => prev + 1);
    logOutput(`Task added: ${description}`);
  };

  // Maps: void TaskManager::completeTask(int id)
  const completeTask = (id: number) => {
    let found = false;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        found = true;
        return { ...t, completed: true };
      }
      return t;
    }));

    if (found) {
      logOutput(`Task ${id} done.`);
    } else {
      logOutput("ID not found.");
    }
  };

  // Reset logic (mimicking File > Exit behavior)
  const resetSystem = () => {
    setTasks([]);
    setNextId(1);
    setLogs([]);
    logOutput("System reset.");
  };

  return { tasks, addTask, completeTask, logs, resetSystem, logOutput };
};

/**
 * ------------------------------------------------------------------
 * UI COMPONENTS
 * ------------------------------------------------------------------
 */

// Modal for ID_HELP_ABOUT
const AboutDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-600 p-6 rounded-lg shadow-2xl w-96">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Info size={20} /> About
        </h2>
        <p className="text-slate-300 mb-4">
          Legacy C++ Task Manager<br />
          Ported to React 18 + TypeScript.<br />
          Version 2.0.0 (Modernized)
        </p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Top Menu Bar (Mapped from resource.rc)
const MenuBar = ({ 
  onOpenTask, 
  onExit, 
  onAbout 
}: { 
  onOpenTask: () => void, 
  onExit: () => void, 
  onAbout: () => void 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Click outside handler would go here in a full production app
  
  return (
    <div className="bg-slate-900 border-b border-slate-700 flex items-center px-2 h-10 text-sm select-none">
      <div className="relative">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          className={`px-3 py-1 hover:bg-slate-700 rounded ${activeMenu === 'file' ? 'bg-slate-700' : ''} text-slate-200`}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 shadow-xl rounded z-20 flex flex-col py-1">
            <button 
              onClick={() => { onOpenTask(); setActiveMenu(null); }}
              className="text-left px-4 py-2 hover:bg-blue-600 text-slate-200 flex justify-between"
            >
              <span>Open Task...</span> <span className="text-slate-500 text-xs mt-1">ID_FILE_OPEN</span>
            </button>
            <div className="h-px bg-slate-700 my-1 mx-2"></div>
            <button 
              onClick={() => { onExit(); setActiveMenu(null); }}
              className="text-left px-4 py-2 hover:bg-blue-600 text-slate-200 flex justify-between"
            >
              <span>Exit</span> <span className="text-slate-500 text-xs mt-1">ID_FILE_EXIT</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative ml-1">
        <button 
          onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
          className={`px-3 py-1 hover:bg-slate-700 rounded ${activeMenu === 'help' ? 'bg-slate-700' : ''} text-slate-200`}
        >
          Help
        </button>
        {activeMenu === 'help' && (
          <div className="absolute left-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 shadow-xl rounded z-20 flex flex-col py-1">
            <button 
              onClick={() => { onAbout(); setActiveMenu(null); }}
              className="text-left px-4 py-2 hover:bg-blue-600 text-slate-200 flex justify-between"
            >
              <span>About...</span> <span className="text-slate-500 text-xs mt-1">ID_HELP_ABOUT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Console Output Component (Mimics std::cout)
const SystemConsole = ({ logs }: { logs: LogEntry[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black border border-slate-700 rounded-md font-mono text-xs md:text-sm h-48 md:h-64 flex flex-col shadow-inner">
      <div className="bg-slate-800 text-slate-400 px-3 py-1 text-xs flex items-center gap-2 border-b border-slate-700">
        <Terminal size={12} /> SYSTEM OUTPUT (stdout)
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-green-400 space-y-1">
        {logs.length === 0 && <span className="text-slate-600 italic">Waiting for input...</span>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

/**
 * ------------------------------------------------------------------
 * MAIN APPLICATION CONTAINER
 * ------------------------------------------------------------------
 */
const App = () => {
  const { tasks, addTask, completeTask, logs, resetSystem, logOutput } = useTaskManager();
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Equivalent to main() initialization
  useEffect(() => {
    // Load initial data as per main.cpp
    // Using timeout to simulate application startup sequence
    setTimeout(() => {
        logOutput("Initializing TaskManager...");
        addTask("Refactor Legacy Code");
        addTask("Upload Multiple Files");
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTask(newTaskInput);
    setNewTaskInput("");
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      
      {/* Resource.rc Menu */}
      <MenuBar 
        onOpenTask={focusInput} 
        onExit={resetSystem} 
        onAbout={() => setShowAbout(true)} 
      />

      {/* Main Workspace */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Task Manager UI */}
        <div className="flex flex-col gap-6">
          {/* Add Task Form */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Command className="text-blue-500" /> Task Manager
            </h1>
            
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Enter task description..."
                className="flex-1 bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded focus:outline-none focus:border-blue-500 transition"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 transition font-medium"
              >
                <Plus size={18} /> Add
              </button>
            </form>
          </div>

          {/* Task List (Visualizing listTasks()) */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden flex-1">
            <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 font-semibold text-slate-300 flex items-center gap-2">
              <FileText size={16} /> Active Tasks
            </div>
            <div className="p-4 space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No tasks available.</div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-3 rounded border transition-all ${
                      task.completed 
                        ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                        : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-mono font-bold ${task.completed ? 'bg-slate-700 text-slate-400' : 'bg-blue-900 text-blue-200'}`}>
                        {task.id}
                      </div>
                      <span className={task.completed ? 'line-through text-slate-500' : 'text-white'}>
                        {task.description}
                      </span>
                    </div>
                    
                    {!task.completed && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="text-green-400 hover:bg-green-900/30 p-2 rounded-full transition"
                        title="Mark Complete"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {task.completed && <span className="text-green-600 text-xs px-3 font-bold">DONE</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Console Emulation */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
            <h3 className="text-slate-300 font-semibold mb-2 text-sm uppercase tracking-wider">Logic Trace</h3>
            <p className="text-slate-400 text-sm mb-4">
              This panel visualizes the `std::cout` outputs defined in the legacy `main.cpp` and `TaskManager.cpp`.
            </p>
            <SystemConsole logs={logs} />
          </div>
          
          {/* Stats Widget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-xs uppercase">Total Tasks</div>
              <div className="text-2xl font-bold text-white">{tasks.length}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-xs uppercase">Completed</div>
              <div className="text-2xl font-bold text-green-400">
                {tasks.filter(t => t.completed).length}
              </div>
            </div>
          </div>
        </div>

      </main>

      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default App;
```