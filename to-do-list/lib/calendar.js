export function getTaskColorClass(task) {
  switch (task.status) {
    case "completed":
      return "bg-green-500";
    case "overdue":
      return "bg-red-500";
    default:
      return "bg-blue-500";
  }
}

// Helper function to get tasks for a specific date
export function getTasksForDate(tasks, date) {
  return tasks.filter((task) => {
    const taskDate = new Date(task.startDate);
    return (
      taskDate.getFullYear() === date.getFullYear() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getDate() === date.getDate()
    );
  });
}

// Helper function to format date range for display
export function formatDateRange(start, end) {
  const options = {
    month: "short",
    day: "numeric",
  };

  return `${start.toLocaleDateString(
    "en-US",
    options
  )} - ${end.toLocaleDateString("en-US", options)}`;
}
