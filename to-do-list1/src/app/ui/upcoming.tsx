"use client";

import { useEffect, useState, useMemo } from "react";
import { useTasks } from "../task-provider";
import { Task, Category } from "../lib/data";
import ManageTask from "./manage-task";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUser } from "../user-provider";

export default function Upcoming() {
  const { tasks, categories, refreshTasks } = useTasks();
  const { currentUser } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeStartDate, setDateRangeStartDate] = useState<Date>(
    new Date()
  );
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Task management modal state
  const [isManageTaskOpen, setManageTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Memoize user tasks
  const userTasks = useMemo(() => {
    return tasks.filter((t) => t.userId === currentUser?._id);
  }, [tasks, currentUser?._id]);

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

  // Filter tasks by selected category and date, mark overdue dynamically
  useEffect(() => {
    const now = new Date();

    const filtered = userTasks
      .map((task) => {
        const t = { ...task };
        if (t.status === "pending" && new Date(t.dueDate) < now) {
          t.status = "overdue";
        }
        return t;
      })
      .filter((task) => {
        const categoryMatch =
          selectedCategory === "All" || task.category === selectedCategory;

        const taskDate = new Date(task.startDate);
        taskDate.setHours(0, 0, 0, 0);

        const selectedDateWithoutTime = new Date(selectedDate);
        selectedDateWithoutTime.setHours(0, 0, 0, 0);

        const dateMatch =
          taskDate.toDateString() === selectedDateWithoutTime.toDateString();

        return categoryMatch && dateMatch;
      });

    setFilteredTasks(filtered);
  }, [userTasks, selectedCategory, selectedDate]);

  // Group tasks by date for 7-day view
  const tasksByDate = useMemo(() => {
    const now = new Date();
    return userTasks.reduce((acc, task) => {
      const t = { ...task };
      if (t.status === "pending" && new Date(t.dueDate) < now) {
        t.status = "overdue";
      }

      const taskDate = new Date(t.startDate);
      taskDate.setHours(0, 0, 0, 0);
      const key = taskDate.toISOString().split("T")[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [userTasks]);

  // Automatically refresh every minute to update overdue tasks
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTasks();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshTasks]);

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
  const getTasksForDate = (date: Date) =>
    tasksByDate[date.toISOString().split("T")[0]] || [];

  // Handlers
  const handleDateSelect = (date: Date) => setSelectedDate(date);
  const handleDatePickerChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setDateRangeStartDate(date);
    setShowDatePicker(false);
  };
  const handleAddTask = () => {
    setSelectedTaskId(null);
    setInitialDate(selectedDate);
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Upcoming Tasks
        </h1>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            {categories.map((category: Category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Task */}
        <button
          className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 mb-6 transition-colors"
          onClick={handleAddTask}
        >
          + Add new task
        </button>

        {/* 7-Day View + Date Picker */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Next 7 Days</h2>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-gray-500 hover:text-blue-500 transition-colors flex items-center"
            >
              <span className="material-icons mr-1">calendar_today</span> View
              Calendar
            </button>
          </div>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 z-10">
              <DatePicker
                selected={selectedDate}
                onChange={handleDatePickerChange}
                inline
                className="w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-7 gap-2">
            {dateRange.map((date, i) => (
              <button
                key={i}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${
                  isSelected(date)
                    ? "bg-blue-500 text-white shadow-md"
                    : isToday(date)
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
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
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Tasks for {formatDate(selectedDate)}
          {isToday(selectedDate) && (
            <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Today
            </span>
          )}
        </h2>

        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const category = categories.find((c) => c._id === task.category);
              const startTime = new Date(task.startDate).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              );
              const endTime = new Date(task.dueDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  style={{ borderLeftColor: category?.color || "#3B82F6" }}
                  onClick={() => handleEditTask(task._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {task.title}
                    </h3>
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
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="material-icons text-sm mr-1">
                        schedule
                      </span>
                      {startTime} - {endTime}
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="material-icons text-gray-400 text-4xl mb-4">
              event_busy
            </div>
            <p className="text-gray-500 text-lg mb-2">No tasks scheduled</p>
            <p className="text-gray-400 text-sm">
              {selectedCategory !== "All"
                ? `No tasks found for this category on ${formatDate(
                    selectedDate
                  )}`
                : `No tasks scheduled for ${formatDate(selectedDate)}`}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Upcoming Summary
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
