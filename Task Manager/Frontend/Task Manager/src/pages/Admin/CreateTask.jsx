import { useEffect, useState } from "react";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import toast from "react-hot-toast";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import { PRIORITY_DATA } from "../../utils/data";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsers from "../../components/inputs/SelectUsers";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import uploadImage from "../../utils/uploadImage";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};

  const navigate = useNavigate();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "low",
    dueDate: "",
    assignedTo: [],
    todoCheckList: [],
    attachment: [],
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDeleteAlter, setOpenDeleteAlter] = useState(false);
  const [checklistItem, setChecklistItem] = useState("");
  

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
    setFieldErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
  };

  // reset the task
  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "low",
      dueDate: "",
      assignedTo: [],
      todoCheckList: [],
      attachment: [],
    });
  };

  const addChecklistItem = () => {
    const text = checklistItem.trim();
    if (!text) return;
    handleValueChange("todoCheckList", [...taskData.todoCheckList, { text, completed: false }]);
    setChecklistItem("");
  };

  const removeChecklistItem = (index) => {
    handleValueChange("todoCheckList", taskData.todoCheckList.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleAttachmentChange = async ({ target }) => {
    if (!target.files?.length) return;
    try {
      setLoading(true);
      const uploads = await Promise.all(Array.from(target.files).map((file) => uploadImage(file)));
      handleValueChange("attachment", [...taskData.attachment, ...uploads.map(({ imageUrl }) => imageUrl)]);
    } catch (uploadError) {
      toast.error(uploadError.response?.data?.message || "Unable to upload attachment");
    } finally {
      setLoading(false);
      target.value = "";
    }
  };

  const createTask = async () => {
    await Axiosinstance.post(API_PATHS.TASK.CREATE_TASK, taskData);
    toast.success("Task created successfully");
    clearData();
    navigate("/admin/tasks");
  };

  //Update tasks
  const updateTask = async () => {
    await Axiosinstance.put(API_PATHS.TASK.UPDATE_TASK(taskId), taskData);
    toast.success("Task updated successfully");
    navigate("/admin/tasks");
  };

  const validateForm = () => {
    const validationErrors = {};
    const today = moment().startOf("day");

    if (!taskData.title.trim()) validationErrors.title = "Task title is required.";
    if (taskData.title.trim().length > 120) validationErrors.title = "Task title must be 120 characters or fewer.";
    if (!taskData.description.trim()) validationErrors.description = "Description is required.";
    if (!taskData.dueDate) validationErrors.dueDate = "Due date is required.";
    else if (moment(taskData.dueDate).isBefore(today, "day")) validationErrors.dueDate = "Due date cannot be in the past.";
    if (!taskData.assignedTo.length) validationErrors.assignedTo = "Assign at least one team member.";

    setFieldErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (taskId) await updateTask();
      else await createTask();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //get task info by  id
  const taskDetailsById = async () => {
    try {
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_TASK_BY_ID(taskId));
      const task = response.data;
      setTaskData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "low",
        dueDate: task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "",
        assignedTo: (task.assignedTo || []).map((user) => user._id || user),
        todoCheckList: task.todoCheckList || [],
        attachment: task.attachment || [],
      });
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to load task");
      navigate("/admin/tasks");
    }
  };

  //delete Task
  const deleteTask = async () => {
    try {
      await Axiosinstance.delete(API_PATHS.TASK.DELETE_TASK(taskId));
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to delete task");
    } finally {
      setOpenDeleteAlter(false);
    }
  };

  useEffect(() => {
    // The request updates form state after the edit record is fetched.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (taskId) taskDetailsById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  return (
    <Dashboardlayout activeMenu="Create Task">
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskId ? "Update Task" : "Create Task"}
                </h2>

              {taskId && (
                <button type="button" className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1  border border-rose-100 hover:border-rose-300 cursor-pointer" 
                  onClick={() => setOpenDeleteAlter(true)}>
                  <LuTrash2 className="text-base" />
                  Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">Task title</label>

              <input
                placeholder="Create App UI"
                className="form-input"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title",target.value)
                }
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-rose-500">{fieldErrors.title}</p>}
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Description</label>

              <textarea 
              placeholder="Description task" 
              className="form-input" 
              rows={4} 
              value={taskData.description} 
              onChange={({ target }) =>
                handleValueChange("description",target.value)
              }
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-rose-500">{fieldErrors.description}</p>}
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropdown
                option={PRIORITY_DATA}
                value={taskData.priority}
                onChange={(value) => handleValueChange("priority", value)}
                placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                  </label>

                  <input 
                  placeholder="Create App UI" 
                  className="form-input"
                  value={taskData.dueDate} 
                  onChange={({ target }) =>
                   handleValueChange("dueDate", target.value)
                   }
                   type="date"
                   min={moment().format("YYYY-MM-DD")}
                   />
                   {fieldErrors.dueDate && <p className="mt-1 text-xs text-rose-500">{fieldErrors.dueDate}</p>}
              </div>

              <div className="col-span-12 md:col-snap-12">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>

                   <SelectUsers
                   selectedUsers={taskData.assignedTo}
                   setSelectedUsers={(value) => {
                    handleValueChange("assignedTo", value)
                   }}
                   />
                   {fieldErrors.assignedTo && <p className="mt-1 text-xs text-rose-500">{fieldErrors.assignedTo}</p>}
              </div>

              <div className="col-span-12 md:col-span-6 mt-2">
                <label className="text-xs font-medium text-slate-600">Checklist</label>
                <div className="mt-2 flex gap-2">
                  <input className="form-input mt-0" placeholder="Add a checklist item" value={checklistItem} onChange={({ target }) => setChecklistItem(target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addChecklistItem())} />
                  <button type="button" className="card-btn shrink-0" onClick={addChecklistItem}>Add</button>
                </div>
                <div className="mt-2 space-y-2">
                  {taskData.todoCheckList.map((item, index) => (
                    <div key={`${item.text}-${index}`} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 text-sm text-slate-600">
                      <span>{item.text}</span>
                      <button type="button" className="text-rose-500" onClick={() => removeChecklistItem(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6 mt-2">
                <label className="text-xs font-medium text-slate-600">Attachments</label>
                <input type="file" multiple className="form-input" onChange={handleAttachmentChange} />
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  {taskData.attachment.map((file, index) => <div key={file} className="flex justify-between"><span className="truncate">Attachment {index + 1}</span><button type="button" className="text-rose-500" onClick={() => handleValueChange("attachment", taskData.attachment.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
                </div>
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="card-btn" onClick={() => navigate("/admin/tasks")}>Cancel</button>
              <button type="submit" className="btn-primary w-auto" disabled={loading}>{loading ? "Saving..." : taskId ? "Update task" : "Create task"}</button>
            </div>
          </div>
        </div>
      </form>
      {openDeleteAlter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h2 className="font-semibold text-slate-800">Delete this task?</h2>
            <p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3"><button type="button" className="card-btn" onClick={() => setOpenDeleteAlter(false)}>Cancel</button><button type="button" className="rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white" onClick={deleteTask}>Delete</button></div>
          </div>
        </div>
      )}
    </Dashboardlayout>
  );
};

export default CreateTask;
