import React from "react";
import Dashboard from "../Components/Dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Dashboard />
    </div>
  );
}

/*import { useEffect, useMemo, useState } from 'react'
import { api, calculateSkillLevel } from '../api/userApi'

const USER_ID = 1

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [employment, setEmployment] = useState([])

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      try {
        setLoading(true)
        const [profile, skillsList, employmentList] = await Promise.all([
          api.getUserProfile(USER_ID),
          api.getUserSkills(USER_ID),
          api.getUserEmploymentHistory(USER_ID)
        ])
        if (!cancelled) {
          setUser(profile)
          setSkills(Array.isArray(skillsList) ? skillsList : [])
          setEmployment(Array.isArray(employmentList) ? employmentList : [])
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => {
      cancelled = true
    }
  }, [])

  const totalSkills = skills.length
  const averageRating = useMemo(() => {
    if (skills.length === 0) return 0
    const sum = skills.reduce((acc, s) => acc + (Number(s.rating) || 0), 0)
    return Number((sum / skills.length).toFixed(1))
  }, [skills])

  const totalYearsExperience = useMemo(() => {
    
    if (user?.years_of_experience != null) {
      return Number(user.years_of_experience)
    }
    
    if (skills.length > 0) {
      const maxMonths = skills.reduce((max, s) => Math.max(max, Number(s.months) || 0), 0)
      return Math.floor(maxMonths / 12)
    }
   
    const years = employment.reduce((acc, job) => acc + (Number(job.years) || 0), 0)
    return years
  }, [employment, skills, user])

  if (loading) return <div className="text-gray-600">Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Skills" value={totalSkills} color="bg-orange-500" />
        <StatCard title="Average Rating" value={averageRating} color="bg-purple-500" />
        <StatCard title="Years of Experience" value={totalYearsExperience} color="bg-teal-500" />
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Skills</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2 pr-4">Skills</th>
                <th className="py-2 pr-4">Rating</th>
                <th className="py-2 pr-4">Years of Experience</th>
                <th className="py-2 pr-4">Skill Level</th>
              </tr>
            </thead>
            <tbody>
              {skills.slice(0, 8).map((s) => {
                const level = calculateSkillLevel(Number(s.rating) || 0)
                return (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{s.name || s.skill_name}</td>
                    <td className="py-2 pr-4">{s.rating}</td>
                    <td className="py-2 pr-4">{s.years || Math.floor((s.months || 0) / 12)}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${level.color}`}>{level.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-lg text-white p-6 shadow ${color}`}>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  )
}
*/
