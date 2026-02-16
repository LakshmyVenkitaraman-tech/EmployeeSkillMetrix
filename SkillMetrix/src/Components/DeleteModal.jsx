import React from "react";
import Modal from "../Components/Modal";

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  itemName = null 
}) {
  const displayMessage = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : message;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">{displayMessage}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}