import { useEffect, useState } from "react";
import moment from "moment";
import { LuCalendarDays, LuClipboardList, LuDownload, LuListChecks, LuPlus, LuRefreshCw, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { useNavigate } from "react-router-dom";

const ManageTask = () => {
  const taskTabs = [
    { label: "All", value: "", countKey: "all" },
    { label: "Pending", value: "Pending", countKey: "pendingTask" },
    { label: "In Progress", value: "In Progress", countKey: "inProgressTask" },
    { label: "Completed", value: "Completed", countKey: "completedTask" },
  ];

  const [tasks, setTasks] = useState([]);
  const [statusSummary, setStatusSummary] = useState({
    all: 0,
    pendingTask: 0,
    inProgressTask: 0,
    completedTask: 0,
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);
  const navigate = useNavigate();

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

  const getAllTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_ALL_TASKS, {
        params: status ? { status } : undefined,
      });
      setTasks(response.data?.tasks || []);
      setStatusSummary(response.data?.statusSummary || {
        all: 0,
        pendingTask: 0,
        inProgressTask: 0,
        completedTask: 0,
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load tasks.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTaskReport = async () => {
    try {
      setDownloadingReport(true);
      const response = await Axiosinstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "tasks-report.xlsx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to download task report.");
    } finally {
      setDownloadingReport(false);
    }
  };

  useEffect(() => {
    // Fetch tasks when the selected status changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Dashboardlayout activeMenu="Manage Tasks">
      <div className="mt-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-slate-800">Manage Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">View and manage tasks assigned to your team.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="card-btn" onClick={downloadTaskReport} disabled={downloadingReport}>
              <LuDownload /> {downloadingReport ? "Downloading..." : "Download report"}
            </button>
            <button type="button" className="card-btn" onClick={getAllTasks} disabled={loading}>
              <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button type="button" className="btn-primary w-auto" onClick={() => navigate("/admin/create-task")}>
              <LuPlus className="mr-1 inline" /> Create task
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

        <div className="form-card mt-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <LuClipboardList className="text-primary" />
            <h2 className="font-medium text-slate-800">{status || "All"} tasks</h2>
          </div>
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading tasks...</p>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button type="button" className="card-btn mx-auto mt-3" onClick={getAllTasks}>Try again</button>
            </div>
          ) : tasks.length ? (
            <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => {
                const totalChecklist = task.todoCheckList?.length || 0;
                const completedChecklist = task.completedTodoCount ?? task.todoCheckList?.filter((item) => item.completed).length ?? 0;
                const progress = totalChecklist ? Math.round((completedChecklist / totalChecklist) * 100) : task.progress || 0;

                return (
                  <article key={task._id} className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${getPriorityStyle(task.priority)} bg-slate-50`}>
                        {task.priority} priority
                      </span>
                      <span className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-base font-semibold text-slate-800">{task.title}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{task.description || "No description provided."}</p>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="flex min-w-0 items-center gap-1 truncate"><LuCalendarDays />Start: {task.createdAt ? moment(task.createdAt).format("DD MMM YYYY") : "No start date"}</span>
                      <span className="flex min-w-0 items-center justify-end gap-1 truncate text-right"><LuCalendarDays />Due: {task.dueDate ? moment(task.dueDate).format("DD MMM YYYY") : "No due date"}</span>
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

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        {task.assignedTo?.length ? (
                          <>
                            <div className="flex -space-x-2">
                              {task.assignedTo.slice(0, 3).map((user) => user.profileImageUrl ? (
                                <img key={user._id} src={user.profileImageUrl} alt={user.name || "Assignee"} className="h-7 w-7 rounded-full border-2 border-white object-cover" />
                              ) : <span key={user._id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200"><LuUser /></span>)}
                            </div>
                            <span>{task.assignedTo.length} assigned</span>
                          </>
                        ) : "Unassigned"}
                      </div>
                      <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => navigate("/admin/create-task", { state: { taskId: task._id } })}>Edit task</button>
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

export default ManageTask
