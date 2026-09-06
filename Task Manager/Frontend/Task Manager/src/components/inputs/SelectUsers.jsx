import { useEffect, useState } from 'react'
import Axiosinstance from '../../utils/Axiosinstance';
import { API_PATHS } from '../../utils/ApiPath';
import { LuUser } from 'react-icons/lu';
import Modal from '../Modal';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {

    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const openUserSelector = () => {
        setTempSelectedUsers(selectedUsers);
        setIsModalOpen(true);
    };

    const getAllUsers = async () => {
        try {
            
            const response = await Axiosinstance.get(API_PATHS.USER.GET_ALL_USERS);
            if(response.data ?. length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.log("error fetching users:", error);
        }
    };

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers((prev) => 
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers)
        setIsModalOpen(false);
    };

    const selectedUserAvatars = allUsers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

    useEffect(() => {
        // Fetching users populates the selector after the request completes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getAllUsers();
    },[]);
  return (
    <div className='space-y-4 mt-2'>
      {selectedUserAvatars.length === 0 && (
                <button type="button" className='card-btn'onClick={openUserSelector}>
            <LuUser className='text-sm'/>Add Members
            </button>
      )}

            {selectedUserAvatars.length > 0 && (
                <button type="button" className="flex items-center gap-2" onClick={openUserSelector}>
                    <div className="flex -space-x-2">
                        {selectedUserAvatars.map((avatar, index) => avatar ? (
                            <img key={`${avatar}-${index}`} src={avatar} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                        ) : <span key={index} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />)}
                    </div>
                    <span className="text-xs font-medium text-primary">Edit members</span>
                </button>
            )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select Users">
                <div className='space-y-4 h-[60vh] overflow-y-auto'>
                    {allUsers.map((user) => (
                        <label key={user._id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                            <input type="checkbox" checked={tempSelectedUsers.includes(user._id)} onChange={() => toggleUserSelection(user._id)} />
                            {user.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-slate-200" />}
                            <span className="text-sm text-slate-700">{user.name}</span>
                        </label>
                    ))}
                    <button type="button" className="btn-primary" onClick={handleAssign}>Assign members</button>
        </div>
      </Modal>
    </div>
  )
}

export default SelectUsers
