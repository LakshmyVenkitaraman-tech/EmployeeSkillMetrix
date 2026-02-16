import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { MdEdit } from "react-icons/md";
import { FaTimes } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-8 bg-white w-96 rounded-lg shadow-xl">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>{message}</p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReusableTable({
  data,
  columns,
  renderCell,
  editTitle,
  deleteTitle,
  emptyMessage,
  deleteFunction,
  getItemId,
  getItemName,
  onEditClick,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const itemName = getItemName(itemToDelete);
    setShowConfirmModal(false);
    setLoading(true);
    setError(null);
    try {
      await deleteFunction(getItemId(itemToDelete));
    } catch (err) {
      setError(`Failed to delete "${itemName}".`);
      console.error(err);
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index}>
                {renderCell(item)}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => onEditClick(item)}
                    title={editTitle}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <MdEdit className="inline-block h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    title={deleteTitle}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    <FaTrash className="inline-block h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${itemToDelete ? getItemName(itemToDelete) : ''}"? This action cannot be undone.`}
      />
    </>
  );
}
