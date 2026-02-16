import React from "react";

export default function Header({ title = " .", userProfile }) {
  const user = userProfile || {
    name: "John Doe",
    role: "Employee",
  };

   return (
    <header className="bg-white w-full h-20 px-8 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center h-full">
        <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
             <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}