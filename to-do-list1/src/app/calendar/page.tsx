"use client";

import { useState, useEffect } from "react";
import { useTasks } from "../task-provider";
import { useUser } from "../user-provider"; // Add user context
import TaskMore from "../ui/calendar/tasks-more";
import DayView from "../ui/calendar/day-view";
import WeekView from "../ui/calendar/week-view";
import MonthView from "../ui/calendar/month-view";
import ManageTask from "../ui/manage-task";
import { Task } from "../lib/data";
import { fetchTasks, updateTask } from "../lib/data";

interface ModalState {
  visible: boolean;
  taskId: string | null;
  initialDate: Date | null;
}

export default function CalendarPage() {
  const { tasks, setTasks } = useTasks();
  const { currentUser } = useUser(); // Get logged-in user
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    taskId: null,
    initialDate: null,
  });
  const [showMoreModal, setShowMoreModal] = useState({
    visible: false,
    tasks: [] as Task[],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Function to update overdue tasks on the client
  const updateOverdueTasks = (tasks: Task[]): Task[] => {
    const now = new Date();
    return tasks.map((task) => {
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      if (task.status === "pending" && dueDate < now) {
        return { ...task, status: "overdue" };
      }
      return task;
    });
  };

  // Function to refresh tasks from API
  const refreshTasks = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const updatedTasks = await fetchTasks();
      // Filter tasks for the current user
      const userTasks = updatedTasks.filter(
        (task: Task) => task.userId === currentUser._id
      );
      const recalculated = updateOverdueTasks(userTasks);
      setTasks(recalculated);
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Periodically check for overdue tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => updateOverdueTasks(prev));
    }, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, [setTasks]);

  // Load tasks on initial render
  useEffect(() => {
    refreshTasks();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-20 text-gray-500">
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

  // Normalize task dates
  const normalizedTasks = tasks.map((task) => ({
    ...task,
    startDate:
      task.startDate instanceof Date
        ? task.startDate
        : new Date(task.startDate),
    dueDate:
      task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate),
  }));

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropMonth = async (e: React.DragEvent, newDay: number) => {
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

      await updateTask(taskId, {
        startDate: newStartDate,
        dueDate: newDueDate,
      });
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
    setDraggedTaskId(null);
  };

  const handleDropWeek = async (
    e: React.DragEvent,
    date: Date,
    hour: number
  ) => {
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

      await updateTask(taskId, {
        startDate: newStartDate,
        dueDate: newDueDate,
      });
      await refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
    setDraggedTaskId(null);
  };

  const handleDropDaily = handleDropWeek;

  // Modal Openers
  const openAddModal = (day: number) =>
    setModal({
      visible: true,
      taskId: null,
      initialDate: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ),
    });

  const openAddModalWeek = (date: Date, hour: number) =>
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

  const openEditModal = (taskId: string) => {
    setModal({ visible: true, taskId, initialDate: null });
    setShowMoreModal({ visible: false, tasks: [] });
  };

  const closeModal = () => {
    setModal({ visible: false, taskId: null, initialDate: null });
    refreshTasks();
  };

  const openMoreTasksModal = (tasks: Task[]) =>
    setShowMoreModal({ visible: true, tasks });
  const closeMoreTasksModal = () =>
    setShowMoreModal({ visible: false, tasks: [] });

  // Navigation
  const goToPrevious = () => {
    if (view === "month")
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    else if (view === "week")
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      });
    else if (view === "day")
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 1);
        return d;
      });
  };

  const goToNext = () => {
    if (view === "month")
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    else if (view === "week")
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    else if (view === "day")
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 1);
        return d;
      });
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
    <div className="min-h-screen p-4 font-sans flex items-center justify-center">
      <div className="bg-white p-6 max-w-6xl w-full">
        {/* Loading */}
        {isLoading && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading tasks...
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              {"<"}
            </button>
            <span className="text-lg font-bold text-gray-800">
              {view === "month"
                ? `${monthName} ${currentDate.getFullYear()}`
                : view === "week"
                ? weekRange
                : dayString}
            </span>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              {">"}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={refreshTasks}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Refresh tasks"
            >
              ↻
            </button>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>

        {/* Calendar Views */}
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

      {/* Manage Task Modal */}
      {modal.visible && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <ManageTask
              onClose={closeModal}
              taskId={modal.taskId}
              initialDate={modal.initialDate}
              onTaskSaved={refreshTasks}
            />
          </div>
        </div>
      )}

      {/* TaskMore Modal */}
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
