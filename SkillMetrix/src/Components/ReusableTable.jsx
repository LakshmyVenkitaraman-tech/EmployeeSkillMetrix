import { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5"
import { CiFilter } from "react-icons/ci"
import { MdModeEdit } from "react-icons/md"
import { MdDelete } from "react-icons/md"
import { FiEye } from "react-icons/fi"
import Modal from './Modal'
import DeleteModal from './DeleteModal'

export default function ReusableTable({
refreshTrigger,
showTopRatedOnly=false,
apiFunction,
userId,
columns,
renderCell,
FormComponent,
editTitle="Edit Item",
deleteTitle="Delete Item",
emptyMessage="No data found",
topRatedMessage="No top-rated items found",
loadingMessage="Loading...",
updateFunction,
deleteFunction,
getItemId,
getItemName,
showActions=true,
showViewButton=false,
filterFunction=null
}) {
const[loading,setLoading]=useState(true)
const[error,setError]=useState('')
const[data,setData]=useState([])
const[filteredData,setFilteredData]=useState([])
const[showEditForm,setShowEditForm]=useState(false)
const[selectedItemToEdit,setSelectedItemToEdit]=useState(null)
const[showDeleteModal,setShowDeleteModal]=useState(false)
const[itemToDelete,setItemToDelete]=useState(null)
const[deleteLoading,setDeleteLoading]=useState(false)

const refresh=async()=>{setLoading(true);
setError('');
try{const result=await apiFunction(userId);
const dataArray=Array.isArray(result)?result:[];
setData(dataArray);
if(showTopRatedOnly&&filterFunction){
const filteredItems=filterFunction(dataArray);
setFilteredData(filteredItems)}
else{setFilteredData(dataArray)}}
catch(e){let errorMessage='Failed to load data';
if(e&&e.response&&e.response.data&&e.response.data.message)
{errorMessage=e.response.data.message}
else if(e&&e.message){errorMessage=e.message}
setError(errorMessage)}
finally{setLoading(false)}}

useEffect(function(){refresh()},[userId])
useEffect(function(){if(refreshTrigger)refresh()},[refreshTrigger])

const handleDeleteClick=(item)=>{setItemToDelete(item);setShowDeleteModal(true)}
const handleDeleteConfirm=async()=>
{if(!itemToDelete)return;
setDeleteLoading(true);
try{await deleteFunction(userId,getItemId(itemToDelete));
setShowDeleteModal(false);
setItemToDelete(null);
refresh()}
catch(e)
{let errorMessage='Failed to delete item';
if(e&&e.response&&e.response.data&&e.response.data.message)
{errorMessage=e.response.data.message}
else if(e&&e.message){errorMessage=e.message}
alert(errorMessage)}
finally{setDeleteLoading(false)}}

const handleDeleteCancel=()=>{setShowDeleteModal(false);setItemToDelete(null)}
const handleEditClick=(item)=>{console.log('Edit clicked for item:',item);
setSelectedItemToEdit(item);
setShowEditForm(true);
setError('')}
const handleEditClose=()=>{setShowEditForm(false);setSelectedItemToEdit(null)}
const handleEditSaved=()=>{setShowEditForm(false);setSelectedItemToEdit(null);refresh()}

if(loading)return<div className="p-4">{loadingMessage}</div>
if(error&&!showEditForm)return<div className="text-red-600 p-4">{error}</div>

return(
<>
<div className="w-full">
{error&&!showEditForm&&(<div className="text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">{error}</div>)}
<div className="flex justify-end gap-4 mb-4 text-gray-600 text-xl"><IoSearch className="cursor-pointer"/><CiFilter className="cursor-pointer"/></div>
{filteredData.length===0?(<div className="text-gray-500 p-4">{showTopRatedOnly?topRatedMessage:emptyMessage}</div>):(
<div className="overflow-x-auto">
<table className="min-w-full text-sm border border-gray-200">
<thead className="bg-gray-100 text-left text-gray-600 border-b">
<tr>
{columns.map(function(column,index){return(
<th key={index} className="py-2 px-4 text-center">{column}</th>)})}
{showActions&&<th className="py-2 px-4 text-center">Actions</th>}
</tr>
</thead>
<tbody>
{filteredData.map(function(item,index){return(
<tr key={getItemId(item)} className="border-b last:border-0 hover:bg-gray-50">
{renderCell(item)}
{showActions&&(
<td className="py-2 px-4 text-center flex justify-center gap-2">
{showViewButton&&<button className="bg-gray-400 text-white p-2 rounded cursor-not-allowed" disabled><FiEye/></button>}
<button onClick={()=>handleEditClick(item)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"><MdModeEdit/></button>
<button onClick={()=>handleDeleteClick(item)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600"><MdDelete/></button>
</td>
)}
</tr>)})}
</tbody>
</table>
</div>)}
</div>
{selectedItemToEdit&&FormComponent&&(<Modal isOpen={showEditForm} onClose={handleEditClose} title={editTitle} size="lg"><FormComponent selectedSkill={selectedItemToEdit} selectedExperience={selectedItemToEdit} onSaved={handleEditSaved} onCancel={handleEditClose}/></Modal>)}
{showDeleteModal&&(<DeleteModal isOpen={showDeleteModal} onClose={handleDeleteCancel} onConfirm={handleDeleteConfirm} title={deleteTitle} skillName={itemToDelete&&getItemName(itemToDelete)} isLoading={deleteLoading}/>)}
</>)
}