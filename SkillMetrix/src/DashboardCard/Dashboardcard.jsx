import React from "react";

export default function DashboardCard({ title, value, icon = null, gradientClass }) {
  return (
    <div  className={`relative overflow-hidden rounded-xl p-6 text-white ${gradientClass}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="mt-1 text-3xl font-bold leading-none">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center ">
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 opacity-10">
        {icon}
      </div>
    </div>
  );
}