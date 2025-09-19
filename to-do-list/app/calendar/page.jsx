"use client";

import { useState, useEffect } from "react";
import { useTasks } from "../context/taskProvider";
import { useUser } from "../context/userProvider";
import TaskMore from "../component/calendar/taskMore";
import DayView from "../component/calendar/dayView";
import WeekView from "../component/calendar/weekView";
import MonthView from "../component/calendar/monthView";
import ManageTask from "../component/task/manageTask";
import { fetchTasks, updateTask } from "@/lib/task";

export default function CalendarPage() {
  const { tasks, setTasks } = useTasks();
  const { currentUser } = useUser();
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [modal, setModal] = useState({
    visible: false,
    taskId: null,
    initialDate: null,
  });
  const [showMoreModal, setShowMoreModal] = useState({
    visible: false,
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fixed: handle overdue→pending as well as pending→overdue
  const updateOverdueTasks = (tasks) => {
    const now = new Date();
    return tasks.map((task) => {
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);

      // If task was overdue but date is now valid, revert to pending
      if (task.status === "overdue" && dueDate >= now) {
        return { ...task, status: "pending" };
      }
      // If pending but past due, mark overdue
      if (task.status === "pending" && dueDate < now) {
        return { ...task, status: "overdue" };
      }
      return task;
    });
  };

  const refreshTasks = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const updatedTasks = await fetchTasks();
      const userTasks = updatedTasks.filter(
        (task) => task.userId === currentUser._id
      );
      const recalculated = updateOverdueTasks(userTasks);
      setTasks(recalculated);
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => updateOverdueTasks(prev));
    }, 60000);
    return () => clearInterval(interval);
  }, [setTasks]);

  useEffect(() => {
    refreshTasks();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-green-700 font-medium">
        Please log in to view your calendar.
      </div>
    );
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    startDate:
      task.startDate instanceof Date
        ? task.startDate
        : new Date(task.startDate),
    dueDate:
      task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate),
  }));

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropMonth = async (e, newDay) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const taskToUpdate = normalizedTasks.find((t) => t._id === taskId);
    if (!taskToUpdate) return;

    try {
      const newStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        newDay,
        taskToUpdate.startDate.getHours(),
        taskToUpdate.startDate.getMinutes()
      );
      const duration =
        taskToUpdate.dueDate.getTime() - taskToUpdate.startDate.getTime();
      const newDueDate = new Date(newStartDate.getTime() + duration);

      // Explicitly reset status if moving into future
      const newStatus =
        newDueDate >= new Date() ? "pending" : taskToUpdate.status;

      await updateTask(taskId, {
        startDate: newStartDate,
        dueDate: newDueDate,
        status: newStatus,
      });
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
    setDraggedTaskId(null);
  };

  const handleDropWeek = async (e, date, hour) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    const taskToUpdate = normalizedTasks.find((t) => t._id === taskId);
    if (!taskToUpdate) return;

    try {
      const newStartDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        0
      );
      const duration =
        taskToUpdate.dueDate.getTime() - taskToUpdate.startDate.getTime();
      const newDueDate = new Date(newStartDate.getTime() + duration);
      const newStatus =
        newDueDate >= new Date() ? "pending" : taskToUpdate.status;

      await updateTask(taskId, {
        startDate: newStartDate,
        dueDate: newDueDate,
        status: newStatus,
      });
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
    setDraggedTaskId(null);
  };

  const handleDropDaily = handleDropWeek;

  const openAddModal = (day) =>
    setModal({
      visible: true,
      taskId: null,
      initialDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ),
    });

  const openAddModalWeek = (date, hour) =>
    setModal({
      visible: true,
      taskId: null,
      initialDate: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        0
      ),
    });

  const openAddModalDaily = openAddModalWeek;

  const openEditModal = (taskId) => {
    setModal({ visible: true, taskId, initialDate: null });
    setShowMoreModal({ visible: false, tasks: [] });
  };

  const closeModal = () => {
    setModal({ visible: false, taskId: null, initialDate: null });
    refreshTasks();
  };

  const openMoreTasksModal = (tasks) =>
    setShowMoreModal({ visible: true, tasks });
  const closeMoreTasksModal = () =>
    setShowMoreModal({ visible: false, tasks: [] });

  const goToPrevious = () => {
    if (view === "month")
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    else if (view === "week")
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 7)));
    else if (view === "day")
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 1)));
  };

  const goToNext = () => {
    if (view === "month")
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    else if (view === "week")
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 7)));
    else if (view === "day")
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 1)));
  };

  const monthName = months[currentDate.getMonth()];
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const weekRange = `${
    months[startOfWeek.getMonth()]
  } ${startOfWeek.getDate()} - ${
    months[endOfWeek.getMonth()]
  } ${endOfWeek.getDate()}`;
  const dayString = `${currentDate.toLocaleString("en-US", {
    weekday: "short",
  })}, ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;

  return (
    <div className="min-h-screen p-4 font-sans flex items-center justify-center bg-white">
      <div className="bg-white p-6 max-w-6xl w-full">
        {isLoading && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading tasks...
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full bg-green-200 hover:bg-green-300 text-green-800 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-lg font-bold text-green-900">
              {view === "month"
                ? `${monthName} ${currentDate.getFullYear()}`
                : view === "week"
                ? weekRange
                : dayString}
            </span>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-green-200 hover:bg-green-300 text-green-800 transition-colors"
            >
              {">"}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={refreshTasks}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Refresh tasks"
            >
              ↻
            </button>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="p-2 rounded-lg bg-white border border-green-300 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>

        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            tasks={normalizedTasks}
            onDayClick={openAddModal}
            onDropMonth={handleDropMonth}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            openEditModal={openEditModal}
            openMoreTasksModal={openMoreTasksModal}
            refreshTasks={refreshTasks}
          />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            tasks={normalizedTasks}
            onTimeSlotClick={openAddModalWeek}
            onDropWeek={handleDropWeek}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            openEditModal={openEditModal}
            openMoreTasksModal={openMoreTasksModal}
            refreshTasks={refreshTasks}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            tasks={normalizedTasks}
            onTimeSlotClick={openAddModalDaily}
            onDropDaily={handleDropDaily}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            openEditModal={openEditModal}
            openMoreTasksModal={openMoreTasksModal}
            refreshTasks={refreshTasks}
          />
        )}
      </div>

      {modal.visible && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg p-6 max-w-md w-full">
            <ManageTask
              onClose={closeModal}
              taskId={modal.taskId}
              initialDate={modal.initialDate}
              onTaskSaved={refreshTasks}
            />
          </div>
        </div>
      )}

      {showMoreModal.visible && (
        <TaskMore
          tasks={showMoreModal.tasks}
          onClose={closeMoreTasksModal}
          onEditTask={openEditModal}
          refreshTasks={refreshTasks}
        />
      )}
    </div>
  );
}
