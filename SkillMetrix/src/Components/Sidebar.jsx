import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiTrendingUp, FiBriefcase, FiUser } from "react-icons/fi";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <FiGrid />, path: "/" },
    { name: "Skills Profile", icon: <FiTrendingUp />, path: "/skills-profile" },
    { name: "My Experience", icon: <FiBriefcase />, path: "/experience" },
    { name: "My Profile", icon: <FiUser />, path: "/profile" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white text-black flex flex-col">
      <div className="flex items-center px-6 py-5 border-b border-gray-200">
        <div className="flex items-center mr-3">
          <img className="w-8 h-8 object-cover" src="./src/assets/download.png" alt="Logo"/>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Skill Matrix</h2>
      </div>
      <nav className="flex flex-col px-4 py-6 flex-1">
        {menuItems.map(({ name, icon, path }) => (
          <NavLink key={name} to={path} end={path === "/"} 
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 mb-1 ${
                isActive ? "bg-orange-500 text-white shadow-sm" : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}