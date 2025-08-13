
import React from "react";


export default function Header({ title = "Dashboard", userProfile }) {
  const user = userProfile || {
    name: "John Doe",
    role: "Employee",
  };

  return (
    <header className="bg-gray-100 w-full h-20 px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center h-full">
        <h1 className="text-2xl font-semibold text-gray-100 ">{title}</h1>
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          </div>
        </div>
        </header>
  );
}
/*import React from 'react';

const Header = ({ user }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <img className="w-12 h-12 object-cover mr-3" src="./src/assets/download.png" alt=" Logo"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Skill Metrics</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{user.name || 'John Doe'}</p>
              <p className="text-xs text-gray-500">{user.role || 'Employee'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;*/
