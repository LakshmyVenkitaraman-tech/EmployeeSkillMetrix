import { useEffect, useMemo, useState } from "react";
import { api } from "../api/userApi";
import { FiTrendingUp, FiStar, FiBriefcase } from "react-icons/fi";
import DashboardCard from "../DashboardCard/Dashboardcard";
//import SkillsTable from "./SkillsTable";

const USER_ID = 60041175820; 
localStorage.setItem('user_id', USER_ID);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [employment, setEmployment] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        setLoading(true);
        const [profile, skillsList, employmentList] = await Promise.all([
          api.getUserProfile(USER_ID),
          api.getUserSkills(USER_ID),
          api.getUserEmploymentHistory(USER_ID),
        ]);
        if (!cancelled) {
          setUser(profile);
          setSkills(Array.isArray(skillsList) ? skillsList : []);
          setEmployment(Array.isArray(employmentList) ? employmentList : []);
        }
      } catch (e) {
        if (!cancelled)
          setError(
            (e && e.response && e.response.data && e.response.data.message) ||e.message ||"Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

   const { totalSkills, avgRating, years, remainingMonths } = useMemo(() => {
    const total = skills.length;
const avgRatingCalc =total > 0? skills.reduce((sum, skill) => sum + (Number(skill.rating) || 0), 0) /total: 0;
    const totalMonths = skills.reduce((sum, skill) => sum + (Number(skill.experienceMonths) || 0), 0);
    const yearsCalc = Math.floor(totalMonths / 12);
    const monthsLeft = totalMonths % 12;

    return {
      totalSkills: total,
      avgRating: Number(avgRatingCalc.toFixed(1)),
      years: yearsCalc,
      remainingMonths: monthsLeft,
    };
  }, [skills]);

  if (loading) return <div className="text-gray-600">Loading...</div>;

  if (error)
    return (
      <div className="text-red-600 font-medium text-center">{error}</div>
    );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Skills"
          value={totalSkills}
          gradientClass="bg-gradient-to-br from-orange-500 to-orange-600"
          icon={<FiTrendingUp className="h-6 w-6" />}
        />
        <DashboardCard
          title="Average Rating"
          value={avgRating}
          gradientClass="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={<FiStar className="h-6 w-6" />}
        />
        <DashboardCard
          title="Experience"
          value={`${years}.${remainingMonths}y`}
          gradientClass="bg-gradient-to-br from-teal-500 to-teal-600"
          icon={<FiBriefcase className="h-6 w-6" />}
        />
      </div>
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h2>
        
      </div>
    </div>
  );
}
