import React from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  let modalSizeClass = "max-w-md"; 
  if (size === "sm") {
    modalSizeClass = "max-w-sm";
  } else if (size === "lg") {
    modalSizeClass = "max-w-4xl";
  } else if (size === "xl") {
    modalSizeClass = "max-w-6xl";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className={`relative w-full rounded-lg bg-white p-6 shadow-xl transform transition-all duration-300 scale-100 ${modalSizeClass}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <button onClick={onClose} className="rounded-full p-1 text-gray-400 ">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}