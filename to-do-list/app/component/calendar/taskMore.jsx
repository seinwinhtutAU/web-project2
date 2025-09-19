"use client";
import { useEffect, useState } from "react";
import { updateTask, deleteTask } from "@/lib/task";
import { getTaskColorClass } from "@/lib/calendar";

export default function TaskMore({ tasks, onClose, onEditTask, refreshTasks }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      refreshTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        refreshTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleCompleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await updateTask(taskId, { status: "completed" });
      refreshTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-green-50/20">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full relative border border-green-300">
        <div className="flex justify-between items-center mb-4 border-b border-green-200 pb-2">
          <h2 className="text-xl font-bold text-green-800">
            Tasks ({tasks.length})
          </h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const start = new Date(task.startDate);
              const due = new Date(task.dueDate);

              return (
                <div
                  key={task._id}
                  className={`group relative flex flex-col p-3 rounded-lg shadow-sm transition-colors cursor-pointer text-white ${getTaskColorClass(
                    task
                  )} hover:bg-opacity-90`}
                  onClick={() => {
                    onEditTask(task._id);
                    onClose();
                  }}
                >
                  <div className="font-semibold text-sm truncate">
                    {task.title}
                  </div>
                  <div className="text-xs opacity-90">
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {due.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div
                    className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.status !== "completed" && (
                      <button
                        onClick={(e) => handleCompleteTask(task._id, e)}
                        className="bg-green-500 hover:bg-green-600 rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200"
                        title="Mark as completed"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteTask(task._id, e)}
                      className="bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200"
                      title="Delete task"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-green-700 text-center">
              No tasks found for this slot.
            </p>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-green-700">
                {tasks.filter((t) => t.status === "completed").length} of{" "}
                {tasks.length} tasks completed
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (window.confirm("Mark all tasks as completed?")) {
                      Promise.all(
                        tasks.map((task) =>
                          updateTask(task._id, { status: "completed" })
                        )
                      ).then(() => refreshTasks());
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Complete All
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete all tasks?")) {
                      Promise.all(
                        tasks.map((task) => deleteTask(task._id))
                      ).then(() => refreshTasks());
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
