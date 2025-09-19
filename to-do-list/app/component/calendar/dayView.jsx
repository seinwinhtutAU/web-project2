"use client";

import React from "react";
import { updateTask, deleteTask } from "@/lib/task";
import { getTaskColorClass } from "@/lib/calendar";

export default function DayView({
  currentDate,
  tasks,
  onTimeSlotClick,
  onDropDaily,
  onDragStart,
  onDragOver,
  openEditModal,
  openMoreTasksModal,
  refreshTasks,
}) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const isTaskOnDate = (task, date) => {
    const start = new Date(task.startDate);
    return (
      start.getFullYear() === date.getFullYear() &&
      start.getMonth() === date.getMonth() &&
      start.getDate() === date.getDate()
    );
  };

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

  const handleTimeUpdate = async (taskId, newDate, newHour) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const newStartDate = new Date(newDate);
      newStartDate.setHours(newHour, 0, 0, 0);

      const originalDuration =
        new Date(task.dueDate).getTime() - new Date(task.startDate).getTime();
      const newDueDate = new Date(newStartDate.getTime() + originalDuration);

      await updateTask(taskId, {
        startDate: newStartDate,
        dueDate: newDueDate,
      });

      refreshTasks();
    } catch (error) {
      console.error("Failed to update task time:", error);
    }
  };

  const handleDropWithAPI = async (e, date, hour) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      await handleTimeUpdate(taskId, date, hour);
    }
    onDropDaily(e, date, hour);
  };

  const tasksForCurrentDay = tasks.filter((task) =>
    isTaskOnDate(task, currentDate)
  );

  return (
    <div className="p-4 overflow-x-auto">
      <table className="w-full table-fixed border-collapse border border-green-300">
        <thead>
          <tr className="bg-green-100">
            <th className="w-20 py-2 text-center text-green-700 text-sm font-medium border border-green-200">
              Time
            </th>
            <th className="py-2 text-center text-green-700 text-sm font-medium border border-green-200">
              {daysOfWeek[currentDate.getDay()]} {currentDate.getDate()}
            </th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((hour) => {
            const tasksInSlot = tasksForCurrentDay.filter((task) => {
              const start = new Date(task.startDate);
              return start.getHours() === hour;
            });

            return (
              <tr key={hour} className="h-20">
                {/* Time column */}
                <td className="p-2 align-top bg-white border border-green-200 text-sm font-semibold text-green-700">
                  <div className="flex items-center justify-end pr-4">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                </td>

                {/* Tasks column */}
                <td
                  className="relative p-2 align-top bg-white border border-green-200 cursor-pointer transition-all duration-200 hover:bg-green-50"
                  onDragOver={onDragOver}
                  onDrop={(e) => handleDropWithAPI(e, currentDate, hour)}
                  onClick={() => onTimeSlotClick(currentDate, hour)}
                >
                  <div className="space-y-1">
                    {tasksInSlot.slice(0, 2).map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task._id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(task._id);
                        }}
                        className={`group relative flex items-center rounded-lg p-2 text-xs font-medium cursor-move transition-all duration-200 shadow-sm ${getTaskColorClass(
                          task
                        )} w-3/4 mx-auto`}
                      >
                        <span className="flex-grow truncate text-white">
                          {task.title}
                        </span>
                        <div className="absolute right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(task._id, "completed");
                            }}
                            className="text-white bg-green-500 hover:bg-green-600 rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200"
                            title="Mark as completed"
                          >
                            <svg
                              className="w-3 h-3"
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
                          <button
                            onClick={(e) => handleDeleteTask(task._id, e)}
                            className="text-white bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200"
                            title="Delete task"
                          >
                            <svg
                              className="w-3 h-3"
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
                    ))}
                    {tasksInSlot.length > 2 && (
                      <button
                        className="absolute bottom-2 right-3 text-green-700 hover:text-green-900 text-sm w-6 h-6 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMoreTasksModal(tasksInSlot);
                        }}
                        title="View more tasks"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
