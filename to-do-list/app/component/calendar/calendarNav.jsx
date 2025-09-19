"use client";

export default function CalendarNav({
  view,
  setView,
  currentDate,
  setCurrentDate,
}) {
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

  // Navigation
  const goToPrevious = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
    }
  };

  const goToNext = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (view === "week") {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Header labels
  const monthName = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekRange = `${
    months[startOfWeek.getMonth()]
  } ${startOfWeek.getDate()} - ${
    months[endOfWeek.getMonth()]
  } ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
  const dayString = `${currentDate.toLocaleString("en-US", {
    weekday: "short",
  })}, ${monthName} ${currentDate.getDate()}, ${currentYear}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      {/* Left: Navigation and title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold text-sm shadow hover:bg-green-600 transition"
          >
            Today
          </button>
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <span className="material-icons text-base">chevron_left</span>
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <span className="material-icons text-base">chevron_right</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 sm:mt-0">
          {view === "month"
            ? `${monthName} ${currentYear}`
            : view === "week"
            ? weekRange
            : dayString}
        </h2>
      </div>

      {/* Right: View selector */}
      <div className="flex gap-2 sm:gap-3">
        {["day", "week", "month"].map((option) => (
          <button
            key={option}
            onClick={() => setView(option)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              view === option
                ? "bg-green-100 text-green-700 border border-green-200 shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-700"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden w-full mt-3">
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow"
        >
          <option value="day">Day View</option>
          <option value="week">Week View</option>
          <option value="month">Month View</option>
        </select>
      </div>
    </div>
  );
}
