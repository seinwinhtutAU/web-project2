"use client";

import { useEffect, useState, useMemo } from "react";
import { useTasks } from "@/app/context/taskProvider";
import ManageTask from "./manageTask";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useUser } from "@/app/context/userProvider";
import { deleteTask } from "@/lib/task";

export default function Upcoming() {
  const { tasks, categories, refreshTasks } = useTasks();
  const { currentUser } = useUser();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRangeStartDate, setDateRangeStartDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isManageTaskOpen, setManageTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [initialDate, setInitialDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});

  const userTasks = useMemo(
    () => tasks.filter((t) => t.userId === (currentUser && currentUser._id)),
    [tasks, currentUser]
  );

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
        return (
          categoryMatch &&
          taskDate.toDateString() === selectedDateWithoutTime.toDateString()
        );
      });
    setFilteredTasks(filtered);
  }, [userTasks, selectedCategory, selectedDate]);

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
    }, {});
  }, [userTasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTasks();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) =>
    date.toDateString() === selectedDate.toDateString();
  const getTasksForDate = (date) =>
    tasksByDate[date.toISOString().split("T")[0]] || [];

  const handleDateSelect = (date) => setSelectedDate(date);
  const handleDatePickerChange = (date) => {
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

  const handleEditTask = (id) => {
    setSelectedTaskId(id);
    setManageTaskOpen(true);
  };

  const handleCloseManageTask = () => {
    setSelectedTaskId(null);
    setManageTaskOpen(false);
    refreshTasks();
  };

  const handleDeleteTask = async (id) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteTask(id);
      refreshTasks();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Upcoming Tasks</h1>

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

      {/* Add Task */}
      <button
        className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 mb-6 transition-colors"
        onClick={handleAddTask}
      >
        + Add new task
      </button>

      {/* 7-Day View */}
      <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 mb-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-800">Next 7 Days</h2>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-green-600 hover:text-green-800 flex items-center"
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
            />
          </div>
        )}

        <div className="grid grid-cols-7 gap-2">
          {dateRange.map((date, i) => (
            <button
              key={i}
              onClick={() => handleDateSelect(date)}
              className={`p-3 rounded-lg text-center ${
                isSelected(date)
                  ? "bg-green-500 text-white"
                  : isToday(date)
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
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
                <div className="mt-1 text-xs text-green-700">
                  {getTasksForDate(date).length} task
                  {getTasksForDate(date).length !== 1 ? "s" : ""}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks for Selected Date */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const category = categories.find((c) => c._id === task.category);
            const startTime = new Date(task.startDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTime = new Date(task.dueDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isTaskLoading = loadingStates[task._id] || false;

            return (
              <div
                key={task._id}
                className={`relative bg-white p-4 rounded-lg shadow-sm border-l-4 cursor-pointer hover:shadow-md ${
                  isTaskLoading ? "opacity-50 pointer-events-none" : ""
                }`}
                style={{ borderLeftColor: category?.color || "#16A34A" }}
                onClick={() => !isTaskLoading && handleEditTask(task._id)}
              >
                {isTaskLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-green-800 text-lg">
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
                <div className="flex flex-wrap gap-2 text-sm text-green-700">
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-dashed border-green-300">
          <div className="material-icons text-green-400 text-4xl mb-4">
            event_busy
          </div>
          <p className="text-green-700 text-lg mb-2">No tasks scheduled</p>
          <p className="text-green-500 text-sm">
            {selectedCategory !== "All"
              ? `No tasks for this category on ${formatDate(selectedDate)}`
              : `No tasks scheduled for ${formatDate(selectedDate)}`}
          </p>
        </div>
      )}

      {/* Manage Task Sidebar */}
      {isManageTaskOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50">
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
