"use client";

import { useEffect, useState, useMemo } from "react";
import ManageTask from "./manage-task";
import { useTasks } from "../task-provider";
import { useUser } from "../user-provider";
import { Task, Category } from "../lib/data";
import { fetchTasks, updateTask, deleteTask } from "../lib/data";

export default function Today() {
  const { tasks, setTasks, categories } = useTasks();
  const { currentUser } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);

  // Task management modal
  const [isManageTaskOpen, setManageTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date>(new Date());

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch tasks from API
  const refreshTasks = async () => {
    try {
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  // Filter today's tasks for current user, mark overdue dynamically
  const getTodayTasks = (tasksList: Task[]): Task[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasksList
      .filter((task) => task.userId === currentUser?._id)
      .map((task) => {
        const t = { ...task };
        const start = new Date(t.startDate);
        const due = new Date(t.dueDate);
        start.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        if (t.status === "pending" && new Date(t.dueDate) < new Date()) {
          t.status = "overdue";
        }

        return today >= start && today <= due ? t : null;
      })
      .filter(Boolean) as Task[];
  };

  // Update todayTasks whenever tasks or category changes
  useEffect(() => {
    if (!currentUser) return;
    setTodayTasks(getTodayTasks(tasks));

    const interval = setInterval(() => {
      setTodayTasks(getTodayTasks(tasks));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, currentUser]);

  // Handlers
  const handleAddTask = () => {
    setSelectedTaskId(null);
    setInitialDate(new Date());
    setManageTaskOpen(true);
  };

  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    setManageTaskOpen(true);
  };

  const handleCloseManageTask = () => {
    setSelectedTaskId(null);
    setManageTaskOpen(false);
    refreshTasks();
  };

  const handleDeleteTask = async (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteTask(id);
      refreshTasks();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "pending" | "completed" | "overdue"
  ) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await updateTask(id, { status });
      refreshTasks();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredTasks = todayTasks.filter(
    (task) => selectedCategory === "All" || task.category === selectedCategory
  );

  const isAnyTaskLoading = Object.values(loadingStates).some(Boolean);

  // Helpers
  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Today Tasks</h1>

        {/* Quick Stats */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Today Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTasks.length}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {filteredTasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredTasks.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {filteredTasks.filter((t) => t.status === "overdue").length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isAnyTaskLoading}
          >
            <option value="All">All Categories</option>
            {categories.map((cat: Category) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Task */}
        <button
          className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 mb-6 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          onClick={handleAddTask}
          disabled={isAnyTaskLoading}
        >
          + Add new task
        </button>
      </div>

      {/* Task List */}
      <div>
        {filteredTasks.length > 0 ? (
          <ul className="space-y-4">
            {filteredTasks.map((task) => {
              const category = categories.find((c) => c._id === task.category);
              const isTaskLoading = loadingStates[task._id] || false;
              return (
                <li
                  key={task._id}
                  className={`relative bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                    task.status === "completed" ? "opacity-60" : ""
                  } ${isTaskLoading ? "opacity-50 pointer-events-none" : ""}`}
                  style={{ borderLeftColor: category?.color || "#3B82F6" }}
                  onClick={() => !isTaskLoading && handleEditTask(task._id)}
                >
                  {isTaskLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={`font-semibold text-gray-800 text-lg ${
                        task.status === "completed" ? "line-through" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task._id);
                        }}
                        className="text-red-500 hover:text-red-700"
                        disabled={isTaskLoading}
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="material-icons text-sm mr-1">
                        schedule
                      </span>
                      {formatTime(task.startDate)} - {formatTime(task.dueDate)}
                    </span>
                    {category && (
                      <span
                        className="px-2 py-1 rounded-full text-white text-xs"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                    {task.note && (
                      <span className="flex items-center text-gray-500">
                        <span className="material-icons text-sm mr-1">
                          notes
                        </span>
                        {task.note.length > 50
                          ? `${task.note.substring(0, 50)}...`
                          : task.note}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="material-icons text-gray-400 text-4xl mb-4">
              event_busy
            </div>
            <p className="text-gray-500 text-lg mb-2">No tasks scheduled</p>
            <p className="text-gray-400 text-sm">
              {selectedCategory !== "All"
                ? `No tasks found for this category today.`
                : `No tasks scheduled for today.`}
            </p>
          </div>
        )}
      </div>

      {isManageTaskOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out z-50">
          <ManageTask
            onClose={handleCloseManageTask}
            taskId={selectedTaskId}
            initialDate={initialDate}
            onTaskSaved={refreshTasks}
          />
        </div>
      )}
    </div>
  );
}
