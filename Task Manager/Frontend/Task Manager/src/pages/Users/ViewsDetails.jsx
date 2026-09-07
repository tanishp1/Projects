import { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LuArrowLeft, LuCalendarDays, LuCheck, LuClipboardList, LuPaperclip } from "react-icons/lu";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { useUserAuth } from "../../hooks/useUserAuth";

const ViewsDetails = () => {
  useUserAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingChecklist, setSavingChecklist] = useState(false);

  const getTaskDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_TASK_BY_ID(id));
      setTask(response.data);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load task details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getTaskDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleChecklistItem = async (itemIndex) => {
    if (!task) return;

    const todoCheckList = task.todoCheckList.map((item, index) => (
      index === itemIndex ? { ...item, completed: !item.completed } : item
    ));

    try {
      setSavingChecklist(true);
      const response = await Axiosinstance.put(API_PATHS.TASK.UPDATE_TODO_CHECKLIST(id), { todoCheckList });
      setTask(response.data.task);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update checklist.");
    } finally {
      setSavingChecklist(false);
    }
  };

  const statusStyle = {
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    "In Progress": "bg-cyan-50 text-cyan-600 border-cyan-100",
  }[task?.status] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <Dashboardlayout activeMenu="My Tasks">
      <div className="mx-auto mt-5 max-w-4xl pb-8">
        <button type="button" className="card-btn mb-4" onClick={() => navigate("/users/tasks")}>
          <LuArrowLeft /> Back to tasks
        </button>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading task details...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-500">{error}</p>
            <button type="button" className="card-btn mx-auto mt-3" onClick={getTaskDetails}>Try again</button>
          </div>
        ) : task ? (
          <div className="space-y-5">
            <section className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">{task.priority || "medium"} priority</span>
                    <span className={`rounded border px-2 py-1 text-[11px] font-medium ${statusStyle}`}>{task.status}</span>
                  </div>
                  <h1 className="mt-4 text-2xl font-semibold text-slate-800">{task.title}</h1>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{task.description || "No description provided."}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm text-slate-500 sm:grid-cols-2">
                <span className="flex items-center gap-2"><LuCalendarDays />Created: {task.createdAt ? moment(task.createdAt).format("DD MMM YYYY") : "-"}</span>
                <span className="flex items-center gap-2"><LuCalendarDays />Due: {task.dueDate ? moment(task.dueDate).format("DD MMM YYYY") : "No due date"}</span>
              </div>
            </section>

            <section className="card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LuClipboardList className="text-primary" />
                  <h2 className="font-medium text-slate-800">Checklist</h2>
                </div>
                <span className="text-xs text-slate-500">{task.progress || 0}% complete</span>
              </div>
              {task.todoCheckList?.length ? (
                <div className="mt-4 space-y-2">
                  {task.todoCheckList.map((item, index) => (
                    <label key={item._id || `${item.text}-${index}`} className="flex cursor-pointer items-center gap-3 rounded border border-slate-100 p-3 text-sm text-slate-700 hover:bg-slate-50">
                      <input type="checkbox" checked={Boolean(item.completed)} disabled={savingChecklist} onChange={() => toggleChecklistItem(index)} />
                      <span className={item.completed ? "text-slate-400 line-through" : ""}>{item.text}</span>
                      {item.completed && <LuCheck className="ml-auto text-emerald-500" />}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No checklist items for this task.</p>
              )}
            </section>

            {task.attachment?.length ? (
              <section className="card">
                <div className="flex items-center gap-2">
                  <LuPaperclip className="text-primary" />
                  <h2 className="font-medium text-slate-800">Attachments</h2>
                </div>
                <div className="mt-4 space-y-2">
                  {task.attachment.map((attachment, index) => (
                    <a key={`${attachment}-${index}`} href={attachment} target="_blank" rel="noreferrer" className="block truncate text-sm text-primary hover:underline">
                      {attachment}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </Dashboardlayout>
  )
}

export default ViewsDetails
