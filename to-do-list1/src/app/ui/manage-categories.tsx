"use client";

import { useState, useEffect } from "react";
import { useTasks } from "../task-provider";
import { useUser } from "../user-provider";
import { Category } from "../lib/data";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../lib/data";

export default function ManageCategories({ onBack }: { onBack: () => void }) {
  const { tasks, categories, setCategories } = useTasks();
  const { currentUser } = useUser();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories for the current user
  useEffect(() => {
    const loadCategories = async () => {
      if (!currentUser) return;
      try {
        setIsLoading(true);
        const categoriesFromApi = await fetchCategories();
        const userCats = categoriesFromApi.filter(
          (cat) => cat.userId === currentUser._id
        );
        setLocalCategories(userCats);
        setCategories(userCats);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [currentUser, setCategories]);

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
      setCategoryColor("#3b82f6");
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryName = async (name: string, id: string) => {
    const trimmedName = name.trim();
    if (!trimmedName || !currentUser) return;

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
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryColor = async (color: string, id: string) => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      setError("");

      const updatedCategory = await updateCategory(id, { color });

      setLocalCategories((prev) =>
        prev.map((cat) => (cat._id === id ? updatedCategory : cat))
      );
    } catch (err) {
      console.error("Failed to update category color:", err);
      setError("Failed to update category color");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategoryHandler = async (id: string) => {
    const categoryToDelete = localCategories.find((cat) => cat._id === id);
    if (!categoryToDelete || !currentUser) return;

    const hasTasks = tasks.some(
      (task) => task.category === categoryToDelete._id
    );
    if (hasTasks) {
      setWarning(
        `Cannot delete category "${categoryToDelete.name}" because it contains tasks.`
      );
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setWarning("");

      await deleteCategory(id);

      setLocalCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = () => {
    setCategories(localCategories);
    onBack();
  };

  if (isLoading && localCategories.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col bg-white items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2 bg-blue-100 text-blue-800 rounded-b-lg shadow">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
          <p className="font-medium">Processing...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-800"
          disabled={isLoading}
        >
          <span className="material-icons text-2xl">close</span>
        </button>
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
              onChange={(e) => updateCategoryName(e.target.value, category._id)}
              disabled={isLoading}
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
              onClick={() => deleteCategoryHandler(category._id)}
              disabled={isLoading}
              className="text-red-500 hover:text-red-700 disabled:text-gray-400"
            >
              <span className="material-icons">delete</span>
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
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400"
        >
          Save
        </button>
      </div>
    </div>
  );
}
