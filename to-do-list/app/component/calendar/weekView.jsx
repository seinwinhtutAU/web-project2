"use client";

import { updateTask, deleteTask } from "@/lib/task";
import { getTaskColorClass } from "@/lib/calendar";
import React from "react";

export default function WeekView({
  currentDate,
  tasks,
  onTimeSlotClick,
  onDropWeek,
  onDragStart,
  onDragOver,
  openEditModal,
  openMoreTasksModal,
  refreshTasks,
}) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isTaskOnTime = (task, date, hour) => {
    const start = new Date(task.startDate);
    return (
      start.getFullYear() === date.getFullYear() &&
      start.getMonth() === date.getMonth() &&
      start.getDate() === date.getDate() &&
      start.getHours() === hour
    );
  };

  const handleStatusUpdate = async (e, taskId, newStatus) => {
    e.stopPropagation();
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

      const newStartDate = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        newHour,
        new Date(task.startDate).getMinutes()
      );

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
    onDropWeek(e, date, hour);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full table-fixed border-collapse border border-green-300">
        <thead>
          <tr className="bg-green-100">
            <th className="w-20"></th>
            {weekDates.map((date, index) => (
              <th
                key={`header-${index}`}
                className="py-2 text-center text-green-700 text-sm font-medium border border-green-200"
              >
                {daysOfWeek[date.getDay()]}
                <br />
                <span
                  className={`font-semibold p-2 rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200 mx-auto ${
                    isToday(date) ? "bg-blue-600 text-white" : "text-green-800"
                  }`}
                >
                  {date.getDate()}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((hour) => (
            <tr key={hour} className="h-20">
              {/* Time column */}
              <td className="py-2 text-center text-green-700 text-xs font-medium border border-green-200 bg-white">
                {String(hour).padStart(2, "0")}:00
              </td>
              {weekDates.map((date, dayIndex) => {
                const tasksForSlot = tasks.filter((task) =>
                  isTaskOnTime(task, date, hour)
                );
                return (
                  <td
                    key={`${hour}-${dayIndex}`}
                    className="relative p-3 align-top bg-white border border-green-200 cursor-pointer transition-all duration-200 hover:bg-green-50"
                    onDragOver={onDragOver}
                    onDrop={(e) => handleDropWithAPI(e, date, hour)}
                    onClick={() => onTimeSlotClick(date, hour)}
                  >
                    <div className="space-y-1">
                      {tasksForSlot.slice(0, 1).map((task) => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => onDragStart(e, task._id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(task._id);
                          }}
                          className={`group flex items-center justify-between rounded-lg p-1 text-xs font-medium cursor-move transition-all duration-200 shadow-sm border-l-4 ${getTaskColorClass(
                            task
                          )}`}
                        >
                          <span className="flex-grow truncate text-white">
                            {task.title}
                          </span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) =>
                                handleStatusUpdate(e, task._id, "completed")
                              }
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
                      {tasksForSlot.length > 1 && (
                        <button
                          className="absolute bottom-2 right-3 text-green-700 hover:text-green-900 text-sm w-6 h-6 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMoreTasksModal(tasksForSlot);
                          }}
                          title="View more tasks"
                        >
                          <span className="text-xs">+</span>
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
