"use client";

import { useState, useEffect } from "react";
import { addTask, updateTask, deleteTask } from "@/lib/task";
import { useTasks } from "@/app/context/taskProvider";
import { useUser } from "@/app/context/userProvider";
import ManageCategories from "../category/manageCategories";

export default function ManageTask({
  onClose,
  taskId,
  initialDate,
  onTaskSaved,
}) {
  const { tasks, setTasks, categories } = useTasks();
  const { currentUser } = useUser();

  const [mounted, setMounted] = useState(false);
  const [task, setTask] = useState(null);
  const [isSetting, setSetting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !currentUser) return;

    if (taskId) {
      const found = tasks.find((t) => t._id === taskId);
      if (found) {
        setTask({
          ...found,
          startDate: new Date(found.startDate),
          dueDate: new Date(found.dueDate),
        });
      }
    } else {
      const dateToSet = initialDate || new Date();
      setTask({
        _id: "",
        title: "",
        startDate: dateToSet,
        dueDate: dateToSet,
        note: "",
        category: categories[0]?._id || "default",
        status: "pending",
        userId: currentUser._id,
      });
    }
  }, [taskId, tasks, categories, initialDate, mounted, currentUser]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate" || name === "dueDate") {
      setTask({ ...task, [name]: new Date(value) });
    } else {
      setTask({ ...task, [name]: value });
    }
    if (error) setError(null);
  };

  const handleStatusToggle = () => {
    setTask((prev) =>
      prev
        ? {
            ...prev,
            status: prev.status === "completed" ? "pending" : "completed",
          }
        : null
    );
  };

  const handleSaveTask = async () => {
    if (!task || !currentUser) return;

    if (!task.title.trim()) {
      setError("Title is required");
      return;
    }

    if (new Date(task.startDate) > new Date(task.dueDate)) {
      setError("Start date cannot be after due date");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let savedTask;
      let notificationMessage;

      if (taskId) {
        const { _id, ...updateData } = task;
        savedTask = await updateTask(_id, updateData);
        setTasks(tasks.map((t) => (t._id === task._id ? savedTask : t)));
        notificationMessage = "Task updated successfully!";
      } else {
        const { _id, ...newTaskData } = task;
        savedTask = await addTask(newTaskData);
        setTasks([...tasks, savedTask]);
        notificationMessage = "Task added successfully!";
      }

      setSuccess(notificationMessage);

      // Delay closing to show the success message
      setTimeout(() => {
        if (onTaskSaved) onTaskSaved();
        onClose();
      }, 1000); // 1-second delay
    } catch (err) {
      console.error("Failed to save task:", err);
      setError(err?.message || "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      setIsLoading(true);
      setError(null);

      await deleteTask(task._id);
      setTasks(tasks.filter((t) => t._id !== task._id));

      setSuccess("Task deleted successfully!");

      // Delay closing to show the success message
      setTimeout(() => {
        if (onTaskSaved) onTaskSaved();
        onClose();
      }, 1000); // 1-second delay
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError(err?.message || "Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoriesSetting = () => setSetting(true);
  const handleBackToTask = () => setSetting(false);

  const formatToLocalDatetime = (date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  if (!mounted) return null;
  if (!currentUser)
    return (
      <p className="p-6 text-center text-red-500">
        Please login to manage tasks.
      </p>
    );
  if (isSetting) return <ManageCategories onBack={handleBackToTask} />;

  return (
    <div className="p-6 h-full flex flex-col bg-white rounded-lg shadow-xl">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-b-lg shadow">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mr-2"></div>
          <p className="font-medium">Processing...</p>
        </div>
      )}

      {success && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-b-lg shadow">
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          {taskId ? "Edit Task" : "New Task"}
        </h1>
        <button
          onClick={onClose}
          className="text-green-500 hover:text-green-700 transition-colors"
          disabled={isLoading}
        >
          <span className="material-icons text-3xl">close</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4 flex-grow overflow-y-auto">
        <input
          type="text"
          name="title"
          className="w-full text-xl font-bold p-2 border-none focus:outline-none focus:ring-0 placeholder:text-gray-400"
          placeholder="New Task Title"
          value={task?.title || ""}
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-green-500">schedule</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-green-800 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startDate"
                className="w-full p-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={task ? formatToLocalDatetime(task.startDate) : ""}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="material-icons text-green-500">event</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-green-800 mb-1">
                Due Time
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                className="w-full p-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={task ? formatToLocalDatetime(task.dueDate) : ""}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-green-800">Category</h3>
            <button
              className="text-green-500 hover:text-green-700 transition-colors"
              onClick={handleCategoriesSetting}
              disabled={isLoading}
            >
              <span className="material-icons">settings</span>
            </button>
          </div>
          <select
            name="category"
            className="w-full p-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={task?.category || ""}
            onChange={handleChange}
            disabled={isLoading}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-base font-semibold text-green-800 mb-2">Note</h3>
          <textarea
            name="note"
            rows={4}
            placeholder="Add a note..."
            className="w-full p-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={task?.note || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={task?.status === "completed"}
                onChange={handleStatusToggle}
                disabled={isLoading}
              />
              <div
                className={`block w-14 h-8 rounded-full transition-all ${
                  task?.status === "completed" ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 w-6 h-6 rounded-full transition-all transform ${
                  task?.status === "completed"
                    ? "translate-x-full bg-white"
                    : "bg-white"
                }`}
              ></div>
            </div>
          </label>
          <span className="font-medium text-green-700 text-base">
            {task?.status === "completed" ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        {taskId && (
          <button
            className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            onClick={handleDeleteTask}
            disabled={isLoading}
          >
            <span className="material-icons text-base">delete</span>
            <span>{isLoading ? "Deleting..." : "Delete"}</span>
          </button>
        )}
        <button
          className={`flex-1 flex items-center justify-center space-x-2 font-semibold py-2 px-4 rounded-md shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm ${
            taskId
              ? "bg-green-600 text-white hover:bg-green-700 ml-4"
              : "bg-green-500 text-white hover:bg-green-600 ml-auto"
          }`}
          onClick={handleSaveTask}
          disabled={isLoading}
        >
          <span className="material-icons text-base">
            {taskId ? "save" : "add"}
          </span>
          <span>
            {isLoading ? "Saving..." : taskId ? "Save Changes" : "Add Task"}
          </span>
        </button>
      </div>
    </div>
  );
}
