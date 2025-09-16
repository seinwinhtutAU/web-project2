"use client";

import { useEffect, useState, useMemo } from "react";
import { useTasks } from "../task-provider";
import { Task, Category, deleteTask } from "../lib/data";
import ManageTask from "./manage-task";
import { useUser } from "../user-provider";

export default function Completed() {
  const { tasks, categories, refreshTasks } = useTasks();
  const { currentUser } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAllCompleted, setShowAllCompleted] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeStartDate, setDateRangeStartDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [isManageTaskOpen, setManageTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Generate 7-day date range
  useEffect(() => {
    const dates: Date[] = [];
    const startDate = new Date(dateRangeStartDate);
    startDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    setDateRange(dates);
  }, [dateRangeStartDate]);

  // Compute user completed tasks
  const userCompletedTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(
      (task) => task.status === "completed" && task.userId === currentUser._id
    );
  }, [tasks, currentUser]);

  // Filter tasks based on category/date
  useEffect(() => {
    if (!currentUser) return;

    if (showAllCompleted) {
      const filtered = userCompletedTasks.filter(
        (task) =>
          selectedCategory === "All" || task.category === selectedCategory
      );
      filtered.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );
      setFilteredTasks(filtered);
    } else {
      const filtered = userCompletedTasks.filter((task) => {
        const categoryMatch =
          selectedCategory === "All" || task.category === selectedCategory;

        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        const selectedDateWithoutTime = new Date(selectedDate);
        selectedDateWithoutTime.setHours(0, 0, 0, 0);

        return (
          categoryMatch &&
          taskDate.toDateString() === selectedDateWithoutTime.toDateString()
        );
      });
      setFilteredTasks(filtered);
    }
  }, [userCompletedTasks, selectedCategory, selectedDate, showAllCompleted]);

  // Group completed tasks by date
  const completedTasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    userCompletedTasks.forEach((task) => {
      const dateKey = new Date(task.dueDate).toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [userCompletedTasks]);

  // Helpers
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const isToday = (date: Date) =>
    date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) =>
    date.toDateString() === selectedDate.toDateString();
  const getTasksForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    return completedTasksByDate[dateKey] || [];
  };

  const handleDateSelect = (date: Date) => setSelectedDate(date);
  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    setManageTaskOpen(true);
  };
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      refreshTasks();
    } catch (e) {
      console.error(e);
    }
  };
  const handleCloseManageTask = () => {
    setSelectedTaskId(null);
    setManageTaskOpen(false);
    refreshTasks();
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!currentUser)
    return (
      <div className="text-center py-20 text-gray-500">
        Please log in to view completed tasks.
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Completed Tasks
        </h1>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-green-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="All">All Categories</option>
            {categories.map((category: Category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => setShowAllCompleted(!showAllCompleted)}
            className="px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            style={{
              backgroundColor: showAllCompleted ? "#10B981" : "#D1FAE5",
              color: showAllCompleted ? "white" : "#065F46",
            }}
          >
            {showAllCompleted ? "View by Date" : "View All Completed"}
          </button>
        </div>

        {/* 7-day Date View */}
        {!showAllCompleted && (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dateRange.map((date, idx) => (
              <button
                key={idx}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${
                  isSelected(date)
                    ? "bg-green-500 text-white shadow-md"
                    : isToday(date)
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="text-sm font-medium">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-lg font-bold">{date.getDate()}</div>
                <div className="text-xs opacity-75">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
                {getTasksForDate(date).length > 0 && (
                  <div className="mt-1 text-xs">
                    {getTasksForDate(date).length} task
                    {getTasksForDate(date).length !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task List */}
      <div>
        {filteredTasks.length > 0 ? (
          <ul className="space-y-4">
            {filteredTasks.map((task) => {
              const category = categories.find((c) => c._id === task.category);
              const dueDate = new Date(task.dueDate);
              return (
                <li
                  key={task._id}
                  className="relative bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  style={{ borderLeftColor: category?.color || "#10B981" }}
                  onClick={() => handleEditTask(task._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg line-through">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task._id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="material-icons text-sm mr-1">
                        done_all
                      </span>
                      {dueDate.toDateString()} at {formatTime(dueDate)}
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
                        {task.note}
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
              task_alt
            </div>
            <p className="text-gray-500 text-lg mb-2">No tasks completed</p>
            <p className="text-gray-400 text-sm">
              {showAllCompleted
                ? "No completed tasks found for this category."
                : `No tasks completed on ${formatDate(selectedDate)}`}
            </p>
          </div>
        )}
      </div>

      {/* Manage Task Modal */}
      {isManageTaskOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out z-50">
          <ManageTask
            onClose={handleCloseManageTask}
            taskId={selectedTaskId}
            onTaskSaved={refreshTasks}
          />
        </div>
      )}
    </div>
  );
}
