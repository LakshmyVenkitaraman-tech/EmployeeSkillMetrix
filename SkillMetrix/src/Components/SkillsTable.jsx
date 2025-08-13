


import { useEffect, useMemo, useState } from 'react'
import { api, calculateSkillLevel, getResolvedUserId } from '../api/userApi'

const USER_ID = 60041175820; 
localStorage.setItem('user_id', USER_ID);
export default function SkillsTable() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState([])

  async function refresh() {
    try {
      setLoading(true)
      const data = await api.getUserSkills(USER_ID)
      setSkills(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function onDelete(id) {
    await api.deleteUserSkill(USER_ID, id)
    await refresh()
  }

  if (loading) return <div className="text-gray-600">Loading...</div>
  if (error) return <div className="text-gray-500">No skills found</div>

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">My Skills</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2 pr-4">Skills</th>
              <th className="py-2 pr-4">Rating</th>
              <th className="py-2 pr-4">Years of Experience</th>
              <th className="py-2 pr-4">Skill Level</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => {
              const level = calculateSkillLevel(Number(s.rating) || 0)
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{s.name || s.skill_name}</td>
                  <td className="py-2 pr-4">{s.rating}</td>
                  <td className="py-2 pr-4">{s.years || Math.floor((s.months || 0) / 12)}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${level.color}`}>{level.label}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <button onClick={() => onDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}