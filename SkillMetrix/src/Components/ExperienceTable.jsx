import { useState, useEffect, useCallback } from 'react';
import { getResolvedUserId } from '../Utils/envConfig';
import ReusableTable from '../Components/ReusableTable';
import ExperienceForm from '../Components/ExperienceForm';
import { api } from '../API/userApi';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
          <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="h-5 w-5" />
            </button>
           </div>
           {children}
         </div>
        </div>
  );
};

export default function ExperienceTable({ refreshTrigger }) {
  const [allExperiences, setAllExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const userId = getResolvedUserId();


  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const experiences = await api.getUserEmploymentHistory(userId);
      setAllExperiences(experiences);
    } catch (err) {
      setError('Failed to fetch employment history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences, refreshTrigger]);


  const handleAddClick = () => {
    setSelectedExperience(null);
    setShowForm(true);
  };

  const handleEditClick = (experience) => {
    setSelectedExperience(experience);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    fetchExperiences();
  };


  const handleDelete = async (experienceId) => {
    await api.deleteEmploymentHistory(userId, experienceId);
    fetchExperiences();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Employment History</h2>
<button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          +Add Experience
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
  <ReusableTable data={allExperiences}
          columns={["Company", "Designation", "Start Date", "End Date"]}
          renderCell={(item) => (
            <>
              <td className="px-6 py-4 text-sm">{item.company_name}</td>
              <td className="px-6 py-4 text-sm">{item.designation}</td>
              <td className="px-6 py-4 text-sm">{item.start_date?.split("T")[0]}</td>
              <td className="px-6 py-4 text-sm">
                {item.end_date ? item.end_date.split("T")[0] : "Present"}
              </td>
            </>
          )}
editTitle="Edit Experience" deleteTitle="Delete Experience"
          emptyMessage="No experiences found." deleteFunction={(id) => handleDelete(id)}
          getItemId={(item) => item.employment_history_id} getItemName={(item) => item.company_name}
          onEditClick={handleEditClick}/>
      )}

<Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={selectedExperience ? "Edit Experience" : "Add Experience"}>
<ExperienceForm selectedExperience={selectedExperience}  onSaved={handleFormSaved}
          onCancel={() => setShowForm(false)}/>
      </Modal>
    </div>
  );
}
