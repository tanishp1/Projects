import { useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { LuCalendarDays, LuClipboardList, LuListChecks, LuRefreshCw } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { useUserAuth } from "../../hooks/useUserAuth";

const MyTask = () => {
  useUserAuth();
  const navigate = useNavigate();
  const taskTabs = [
    { label: "All", value: "", countKey: "all" },
    { label: "Pending", value: "Pending", countKey: "pendingTask" },
    { label: "In Progress", value: "In Progress", countKey: "inProgressTask" },
    { label: "Completed", value: "Completed", countKey: "completedTask" },
  ];
  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({ all: 0, pendingTask: 0, inProgressTask: 0, completedTask: 0 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState("");

  const getStatusStyle = (taskStatus) => ({
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    "In Progress": "bg-cyan-50 text-cyan-600 border-cyan-100",
  }[taskStatus] || "bg-slate-50 text-slate-600 border-slate-100");

  const getPriorityStyle = (priority) => ({
    high: "text-rose-600",
    medium: "text-orange-600",
    low: "text-slate-500",
  }[priority] || "text-slate-500");

  const getMyTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_ALL_TASKS, {
        params: status ? { status } : undefined,
      });
      setTasks(response.data?.tasks || []);
      setStatusSummary(response.data?.statusSummary || { all: 0, pendingTask: 0, inProgressTask: 0, completedTask: 0 });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load your tasks.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, nextStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const response = await Axiosinstance.put(API_PATHS.TASK.UPDATE_TASK_STATUS(taskId), { status: nextStatus });
      setTasks((currentTasks) => currentTasks.map((task) => (
        task._id === taskId ? { ...task, ...response.data.task } : task
      )));
      toast.success("Task status updated.");
      await getMyTasks();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update task status.");
    } finally {
      setUpdatingTaskId("");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getMyTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Dashboardlayout activeMenu="My Tasks">
      <div className="mt-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-slate-800">My Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">Review your assignments and keep their status up to date.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="card-btn" onClick={getMyTasks} disabled={loading}>
              <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Task status filters">
          <div className="flex min-w-max gap-6">
            {taskTabs.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  key={tab.value || "all"}
                  onClick={() => setStatus(tab.value)}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${isActive ? "border-primary text-primary" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {tab.label}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-500"}`}>
                    {statusSummary[tab.countKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading your tasks...</p>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button type="button" className="card-btn mx-auto mt-3" onClick={getMyTasks}>Try again</button>
            </div>
          ) : tasks.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => {
                const totalChecklist = task.todoCheckList?.length || 0;
                const completedChecklist = task.completedTodoCount ?? task.todoCheckList?.filter((item) => item.completed).length ?? 0;
                const progress = totalChecklist ? Math.round((completedChecklist / totalChecklist) * 100) : task.progress || 0;

                return (
                  <article key={task._id} className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded border bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase ${getPriorityStyle(task.priority)}`}>
                        {task.priority || "medium"} priority
                      </span>
                      <span className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <h2 className="mt-3 line-clamp-2 text-base font-semibold text-slate-800">{task.title}</h2>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{task.description || "No description provided."}</p>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="flex min-w-0 items-center gap-1 truncate"><LuCalendarDays />{task.createdAt ? moment(task.createdAt).format("DD MMM YYYY") : "No start date"}</span>
                      <span className="flex min-w-0 items-center justify-end gap-1 truncate text-right"><LuCalendarDays />{task.dueDate ? moment(task.dueDate).format("DD MMM YYYY") : "No due date"}</span>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><LuListChecks />Checklist</span>
                        <span>{completedChecklist}/{totalChecklist} done</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-1 text-xs text-slate-500"><LuClipboardList />{totalChecklist} checklist items</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => navigate(`/users/task-details/${task._id}`)}>View details</button>
                        <select
                          aria-label={`Update status for ${task.title}`}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-primary"
                          value={task.status}
                          disabled={updatingTaskId === task._id}
                          onChange={(event) => updateTaskStatus(task._id, event.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No tasks found.</p>
          )}
        </div>
      </div>
    </Dashboardlayout>
  )
}

export default MyTask
