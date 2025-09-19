"use client";

import React from "react";
import { updateTask, deleteTask } from "@/lib/task";
import { getTaskColorClass } from "@/lib/calendar";

export default function MonthView({
  currentDate,
  tasks,
  onDayClick,
  onDropMonth,
  onDragStart,
  onDragOver,
  openEditModal,
  openMoreTasksModal,
  refreshTasks,
}) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells = daysInMonth + firstDayOfMonth;
  const numRows = Math.ceil(totalCells / 7);

  const isTaskOnDay = (task, day, month, year) => {
    const start = new Date(task.startDate);
    const current = new Date(year, month, day);
    return (
      current.toDateString() ===
      new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      ).toDateString()
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

  const handleDateUpdate = async (taskId, newDay) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const newStartDate = new Date(
        currentYear,
        currentMonth,
        newDay,
        new Date(task.startDate).getHours(),
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
      console.error("Failed to update task date:", error);
    }
  };

  const handleDropWithAPI = async (e, day) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      await handleDateUpdate(taskId, day);
    }
    onDropMonth(e, day);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const calendarRows = [];
  let dayCounter = 1;

  for (let i = 0; i < numRows; i++) {
    const cells = [];
    for (let j = 0; j < 7; j++) {
      const cellIndex = i * 7 + j;
      if (cellIndex < firstDayOfMonth || dayCounter > daysInMonth) {
        cells.push(
          <td
            key={`empty-${cellIndex}`}
            className="p-2 align-top bg-green-50 border border-green-200"
          >
            <div className="h-32"></div>
          </td>
        );
      } else {
        const day = dayCounter;
        const tasksForDay = tasks.filter((task) =>
          isTaskOnDay(task, day, currentMonth, currentYear)
        );
        cells.push(
          <td
            key={day}
            className="relative p-3 align-top bg-white border border-green-200 cursor-pointer transition-all duration-200 hover:bg-green-50"
            onDragOver={onDragOver}
            onDrop={(e) => handleDropWithAPI(e, day)}
            onClick={() => onDayClick(day)}
          >
            <span
              className={`text-sm font-semibold p-2 rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200 ${
                isToday(day) ? "bg-green-600 text-white" : "text-green-800"
              }`}
            >
              {day}
            </span>
            <div className="mt-2 space-y-1">
              {tasksForDay.slice(0, 2).map((task) => (
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
                  )}`}
                >
                  <span className="flex-grow truncate text-white">
                    {task.title}
                  </span>
                  <div className="absolute right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
              {tasksForDay.length > 2 && (
                <button
                  className="absolute bottom-2 right-3 text-green-700 hover:text-green-900 text-sm w-6 h-6 flex items-center justify-center rounded-full bg-green-200 hover:bg-green-300 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMoreTasksModal(tasksForDay);
                  }}
                  title="View more tasks"
                >
                  <span className="text-xs">+</span>
                </button>
              )}
            </div>
          </td>
        );
        dayCounter++;
      }
    }
    calendarRows.push(
      <tr key={`row-${i}`} className="h-40">
        {cells}
      </tr>
    );
  }

  return (
    <div className="p-4 overflow-x-auto">
      <table className="w-full table-fixed border-collapse border border-green-300">
        <thead>
          <tr className="bg-green-100">
            {daysOfWeek.map((day) => (
              <th
                key={`header-${day}`}
                className="py-2 text-center text-green-700 text-sm font-medium border border-green-200"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{calendarRows}</tbody>
      </table>
    </div>
  );
}
