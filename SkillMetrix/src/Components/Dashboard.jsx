import { useEffect, useMemo, useState } from "react";
import { api } from "../API/userApi";
import { getResolvedUserId } from "../Utils/envConfig";
import { FiTrendingUp, FiStar, FiBriefcase } from "react-icons/fi";
import DashboardCard from "../DashboardCard/Dashboardcard";
import SkillsTable from "../Components/SkillsTable"; 

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const userId = getResolvedUserId();

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
      const profile = await api.getUserProfile(userId);
       let skillsList = [];
        try {
          skillsList = await api.getUserSkills(userId);
        } catch (e) {
          console.warn("Skills API failed:", e);
        }
        let employmentList = [];
        try {
          employmentList = await api.getUserEmploymentHistory(userId);
        } catch (e) {
          console.warn("Employment API unavailable, skipping", e);
        }
        if (!cancelled) {
         // setUser(profile);
          setSkills(Array.isArray(skillsList) ? skillsList : []);
          setEmployment(Array.isArray(employmentList) ? employmentList : []);
        }
      } catch (e) {
        if (!cancelled) {
          if (e.response && e.response.data && e.response.data.message) setError(e.response.data.message);
          else if (e.message) setError(e.message);
          else setError("Failed to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, userId]); 

  const { totalSkills, avgRating, totalExperience } = useMemo(() => {
    let total = skills.length;
    let ratingSum = 0;
    let experienceSum = 0;

    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      ratingSum += s.proficiency ? Number(s.proficiency) : 0;
      experienceSum += s.years_experience ? Number(s.years_experience) : 0;
    }

    return {
      totalSkills: total,
      avgRating: total > 0 ? (ratingSum / total).toFixed(2) : 0,
      totalExperience: experienceSum
    };
  }, [skills]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);};

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<DashboardCard title="Total Skills" value={totalSkills} gradientClass="bg-gradient-to-br from-orange-500 to-orange-600"icon={<FiTrendingUp className="h-6 w-6" />} />
<DashboardCard title="Average Rating" value={avgRating} gradientClass="bg-gradient-to-br from-purple-500 to-purple-600"  icon={<FiStar className="h-6 w-6" />} />
<DashboardCard title="Experience" value={`${totalExperience} years`} gradientClass="bg-gradient-to-br from-teal-500 to-teal-600" icon={<FiBriefcase className="h-6 w-6" />} />
      </div>
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Rated Skills</h2>
        </div>
<SkillsTable  refreshTrigger={refreshKey} showTopRatedOnly={true} enableSearch={false} />
        {skills.length === 0 && (
          <div className="text-gray-500 text-center py-4">No skills added yet.         
          </div>
        )}
      </div>
    </div>
  );
}