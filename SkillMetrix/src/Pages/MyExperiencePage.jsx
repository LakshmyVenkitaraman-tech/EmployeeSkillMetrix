import { useEffect, useState } from "react";
import { api, getResolvedUserId } from "../API/userApi";
import ExperienceForm from "../Components/ExperienceForm";
import ExperienceTable from "../Components/ExperienceTable";

export default function MyExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);


  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const userId = getResolvedUserId();
      const res = await api.getUserEmploymentHistory(userId);
      setExperiences(res || []);
    } catch (err) {
      console.error("Error fetching experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

 
  const handleSave = async () => {
    await fetchExperiences();
    setShowForm(false);
    setSelectedExperience(null);
  };


  const handleDelete = async (id) => {
    try {
      const userId = getResolvedUserId();
      await api.deleteEmployment(userId, id);
      setExperiences(experiences.filter((exp) => exp.id !== id));
    } catch (err) {
      console.error("Error deleting experience:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Experiences</h2>

<ExperienceTable data={experiences}
        onEdit={(exp) => {
          setSelectedExperience(exp);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />    

      {showForm && (
    <ExperienceForm selectedExperience={selectedExperience} onSaved={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedExperience(null);
          }}
        />
      )}
    </div>
  );
}
