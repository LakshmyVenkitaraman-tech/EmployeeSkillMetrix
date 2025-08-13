
 import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiTrendingUp, FiBriefcase, FiUser } from "react-icons/fi";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <FiGrid />, path: "/" },
   { name: "Skill Profile", icon: <FiTrendingUp />, path: "/skills-profile" },
    { name: "My Experience", icon: <FiBriefcase />, path: "/experience" },
    { name: "My Profile", icon: <FiUser />, path: "/profile" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white text-black shadow-lg flex flex-col">
      <div className="flex items-center p-4 text-lg font-bold border-b text-black">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
         <img className="w-12 h-12 object-cover mr-3" src="./src/assets/download.png" alt=" Logo"/>
        </div>
        <p className="font-medium">Skill Metrics</p>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-2 flex-1">
        {menuItems.map(({ name, icon, path }) => (
  <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) =>`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-orange-500 text-white": "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`
            }>
            {icon}
            <span>{name}</span>
          </NavLink>
           ))}
      </nav>

    </aside>
  );
} 
/* import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiTrendingUp, FiBriefcase, FiUser, FiSettings } from "react-icons/fi";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <FiGrid />, path: "/" },
    { name: "Skill Profile", icon: <FiTrendingUp />, path: "/skill-profile" },
    { name: "My Experience", icon: <FiBriefcase />, path: "/experience" },
    { name: "My Profile", icon: <FiUser />, path: "/profile" },
  ];

  return (
    <aside className="w-64 h-screen bg-white text-black shadow-lg flex flex-col">
      <div className="flex items-center p-4 text-lg font-bold border-b text-black">
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
         <img className="w-12 h-12 object-cover mr-3" src="./src/assets/download.png" alt=" Logo"/>
        </div>
        <p className="font-medium">Skill Metrics</p>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-2 flex-1">
        {menuItems.map(({ name, icon, path }) => (
  <NavLink key={name} to={path} end={path === "/"} className={({ isActive }) =>`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-orange-500 text-white": "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`
            }>
            {icon}
            <span>{name}</span>
          </NavLink>
        ))} 
      </nav>

    </aside>
  );
} */
