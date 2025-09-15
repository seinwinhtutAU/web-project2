"use client";

import { Task } from "@/app/lib/data";
import { getTaskColorClass } from "@/app/lib/calendar";
import React from "react";
import { updateTask, deleteTask } from "@/app/lib/data";

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
}: {
  currentDate: Date;
  tasks: Task[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onDropWeek: (e: React.DragEvent, date: Date, hour: number) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  openEditModal: (taskId: string) => void;
  openMoreTasksModal: (tasks: Task[]) => void;
  refreshTasks: () => void;
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

  const isTaskOnTime = (task: Task, date: Date, hour: number) => {
    const start = new Date(task.startDate);
    return (
      start.getFullYear() === date.getFullYear() &&
      start.getMonth() === date.getMonth() &&
      start.getDate() === date.getDate() &&
      start.getHours() === hour
    );
  };

  const handleStatusUpdate = async (
    e: React.MouseEvent,
    taskId: string,
    newStatus: Task["status"]
  ) => {
    e.stopPropagation();
    try {
      await updateTask(taskId, { status: newStatus });
      refreshTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
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

  const handleTimeUpdate = async (
    taskId: string,
    newDate: Date,
    newHour: number
  ) => {
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

  const handleDropWithAPI = async (
    e: React.DragEvent,
    date: Date,
    hour: number
  ) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      await handleTimeUpdate(taskId, date, hour);
    }
    onDropWeek(e, date, hour);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full table-fixed border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-20"></th>
            {weekDates.map((date, index) => (
              <th
                key={`header-${index}`}
                className="py-2 text-center text-gray-500 text-sm font-medium border border-gray-200"
              >
                {daysOfWeek[date.getDay()]}
                <br />
                <span
                  className={`font-semibold p-2 rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200 mx-auto
                    ${
                      isToday(date) ? "bg-blue-600 text-white" : "text-gray-800"
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
              <td className="py-2 text-center text-gray-500 text-xs font-medium border border-gray-200">
                {String(hour).padStart(2, "0")}:00
              </td>
              {weekDates.map((date, dayIndex) => {
                const tasksForSlot = tasks.filter((task) =>
                  isTaskOnTime(task, date, hour)
                );
                return (
                  <td
                    key={`${hour}-${dayIndex}`}
                    className="relative p-3 align-top bg-white border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-100"
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
                          className="absolute bottom-2 right-3 text-gray-500 hover:text-gray-800 text-sm w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
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
