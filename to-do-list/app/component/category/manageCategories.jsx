"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/app/context/taskProvider";
import { useUser } from "@/app/context/userProvider";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/category";

export default function ManageCategories({ onBack }) {
  const { tasks, categories, setCategories, refreshTasks } = useTasks();
  const { currentUser } = useUser();
  const [localCategories, setLocalCategories] = useState(categories);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#10b981"); // default green
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const addNewCategory = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName || !currentUser) return;

    if (localCategories.some((cat) => cat.name === trimmedName)) {
      setWarning("This category already exists.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setWarning("");

      const newCategory = await addCategory({
        name: trimmedName,
        color: categoryColor,
        userId: currentUser._id,
      });

      setLocalCategories((prev) => [...prev, newCategory]);
      setCategoryName("");
      setCategoryColor("#10b981");
      setSuccess("Category added successfully!");
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryName = async (name, id) => {
    const trimmedName = name.trim();
    if (!trimmedName || !currentUser) return;

    const originalCategory = localCategories.find((cat) => cat._id === id);
    if (originalCategory.name === trimmedName) return;

    if (
      localCategories.some((cat) => cat.name === trimmedName && cat._id !== id)
    ) {
      setWarning("This category name already exists.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setWarning("");

      const updatedCategory = await updateCategory(id, { name: trimmedName });
      setLocalCategories((prev) =>
        prev.map((cat) => (cat._id === id ? updatedCategory : cat))
      );
      setSuccess("Category name updated successfully!");
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryColor = async (color, id) => {
    if (!currentUser) return;
    const originalCategory = localCategories.find((cat) => cat._id === id);
    if (originalCategory.color === color) return;

    try {
      setIsLoading(true);
      setError("");

      const updatedCategory = await updateCategory(id, { color });
      setLocalCategories((prev) =>
        prev.map((cat) => (cat._id === id ? updatedCategory : cat))
      );
      setSuccess("Category color updated successfully!");
    } catch (err) {
      console.error("Failed to update category color:", err);
      setError("Failed to update category color");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExistingCategory = async (id) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError("");
      setWarning("");

      await deleteCategory(id);
      setLocalCategories((prev) => prev.filter((cat) => cat._id !== id));
      setSuccess("Category deleted successfully!");
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError("");
      await refreshTasks();
      setLocalCategories(categories);
      setSuccess("Categories refreshed!");
    } catch (err) {
      console.error("Failed to refresh categories:", err);
      setError("Failed to refresh categories");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = () => {
    setCategories(localCategories);
    setTimeout(() => onBack(), 500);
  };

  if (isLoading && localCategories.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col bg-white items-center justify-center relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="mt-4 text-green-700">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col bg-white relative">
      {isLoading && (
        <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-b-lg shadow">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mr-2"></div>
          <p className="font-medium">Processing...</p>
        </div>
      )}

      {success && (
        <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-b-lg shadow">
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-green-900">Manage Categories</h1>
        <div className="flex items-center space-x-2">
          {/* Material refresh icon */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-green-500 hover:text-green-700 material-icons"
            title="Refresh Categories"
          >
            <span className={isLoading ? "animate-spin" : ""}>refresh</span>
          </button>
          <button
            onClick={onBack}
            className="text-green-500 hover:text-green-700"
            disabled={isLoading}
          >
            <span className="material-icons text-2xl">close</span>
          </button>
        </div>
      </div>

      {warning && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
          {warning}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <ul className="flex-grow space-y-4 overflow-y-auto pr-2">
        {localCategories.map((category) => (
          <li key={category._id} className="flex items-center space-x-2">
            <input
              type="text"
              value={category.name}
              onBlur={(e) => updateCategoryName(e.target.value, category._id)}
              onChange={(e) =>
                setLocalCategories((prev) =>
                  prev.map((cat) =>
                    cat._id === category._id
                      ? { ...cat, name: e.target.value }
                      : cat
                  )
                )
              }
              disabled={isLoading}
              className="flex-grow p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
            />
            <input
              type="color"
              value={category.color}
              onChange={(e) =>
                updateCategoryColor(e.target.value, category._id)
              }
              disabled={isLoading}
              className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              onClick={() => deleteExistingCategory(category._id)}
              disabled={isLoading}
              className="text-red-500 hover:text-red-700 material-icons"
            >
              delete
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center space-x-2">
        <input
          type="text"
          placeholder="New category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
          disabled={isLoading}
          className="flex-grow p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        />
        <input
          type="color"
          value={categoryColor}
          onChange={(e) => setCategoryColor(e.target.value)}
          disabled={isLoading}
          className="w-10 h-10 p-0 border-0 rounded-md cursor-pointer disabled:cursor-not-allowed"
        />
        <button
          onClick={addNewCategory}
          disabled={isLoading || !categoryName.trim()}
          className="bg-green-500 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={saveCategories}
          disabled={isLoading}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:bg-gray-400"
        >
          Save
        </button>
      </div>
    </div>
  );
}
