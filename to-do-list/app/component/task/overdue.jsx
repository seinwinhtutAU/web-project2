"use client";

import { useEffect, useState, useMemo } from "react";
import { useTasks } from "@/app/context/taskProvider";
import { deleteTask } from "@/lib/task";
import ManageTask from "./manageTask";
import { useUser } from "@/app/context/userProvider";

export default function Overdue() {
  const { tasks, categories, refreshTasks } = useTasks();
  const { currentUser } = useUser();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAllOverdue, setShowAllOverdue] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangeStartDate, setDateRangeStartDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [isManageTaskOpen, setManageTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Generate 7-day date range
  useEffect(() => {
    const dates = [];
    const startDate = new Date(dateRangeStartDate);
    startDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    setDateRange(dates);
  }, [dateRangeStartDate]);

  // Compute overdue tasks
  const userOverdueTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks
      .filter((task) => task.userId === currentUser._id)
      .map((task) => {
        const t = { ...task };
        if (t.status !== "completed" && new Date(t.dueDate) < new Date()) {
          t.status = "overdue";
        }
        return t;
      })
      .filter((task) => task.status === "overdue");
  }, [tasks, currentUser]);

  // Filter tasks for current view
  useEffect(() => {
    if (!currentUser) return;

    if (showAllOverdue) {
      const filtered = userOverdueTasks.filter(
        (task) =>
          selectedCategory === "All" || task.category === selectedCategory
      );
      filtered.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      setFilteredTasks(filtered);
    } else {
      const filtered = userOverdueTasks.filter((task) => {
        const categoryMatch =
          selectedCategory === "All" || task.category === selectedCategory;

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);

        const selectedDateWithoutTime = new Date(selectedDate);
        selectedDateWithoutTime.setHours(0, 0, 0, 0);

        return (
          categoryMatch &&
          taskDueDate.toDateString() === selectedDateWithoutTime.toDateString()
        );
      });
      setFilteredTasks(filtered);
    }
  }, [userOverdueTasks, selectedCategory, selectedDate, showAllOverdue]);

  // Group overdue tasks by date
  const overdueTasksByDate = useMemo(() => {
    const grouped = {};
    userOverdueTasks.forEach((task) => {
      const dateKey = new Date(task.dueDate).toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [userOverdueTasks]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) =>
    date.toDateString() === selectedDate.toDateString();
  const getTasksForDate = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    return overdueTasksByDate[dateKey] || [];
  };

  const handleDateSelect = (date) => setSelectedDate(date);
  const handleEditTask = (id) => {
    setSelectedTaskId(id);
    setManageTaskOpen(true);
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      refreshTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCloseManageTask = () => {
    setSelectedTaskId(null);
    setManageTaskOpen(false);
    refreshTasks();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Overdue Tasks
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
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => setShowAllOverdue(!showAllOverdue)}
            className="px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
            style={{
              backgroundColor: showAllOverdue ? "#16A34A" : "#DCFCE7",
              color: showAllOverdue ? "white" : "#166534",
            }}
          >
            {showAllOverdue ? "View by Date" : "View All Overdue"}
          </button>
        </div>

        {/* Date Picker (only in View by Date) */}
        {!showAllOverdue && (
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dateRange.map((date, index) => (
              <button
                key={index}
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
              return (
                <li
                  key={task._id}
                  className="relative bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  style={{ borderLeftColor: category?.color || "#DC2626" }}
                  onClick={() => handleEditTask(task._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Overdue
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
                        schedule
                      </span>
                      Due: {new Date(task.dueDate).toDateString()} at{" "}
                      {formatTime(task.dueDate)}
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
              warning
            </div>
            <p className="text-gray-500 text-lg mb-2">No overdue tasks</p>
            <p className="text-gray-400 text-sm">
              {selectedCategory !== "All"
                ? "No overdue tasks found for this category."
                : "No overdue tasks found."}
            </p>
          </div>
        )}
      </div>

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
