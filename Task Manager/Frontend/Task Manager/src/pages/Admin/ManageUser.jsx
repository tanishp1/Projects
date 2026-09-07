import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuCheck, LuClock3, LuDownload, LuMail, LuRefreshCw, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { getImageUrl } from "../../utils/helper";

const ManageUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState(false);

  const getAllUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.USER.GET_ALL_USERS);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load users.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadUserReport = async () => {
    try {
      setDownloadingReport(true);
      const response = await Axiosinstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = "users-report.xlsx";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to download user report.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const openUserDashboard = (userId) => {
    navigate("/users/dashboard", { state: { userId } });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllUsers();
  }, []);

  return (
    <Dashboardlayout activeMenu="Manage Users">
      <div className="mt-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-slate-800">Manage Users</h1>
            <p className="mt-1 text-sm text-slate-500">View your team and their task progress.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="card-btn" onClick={downloadUserReport} disabled={downloadingReport}>
              <LuDownload /> {downloadingReport ? "Downloading..." : "Download report"}
            </button>
            <button type="button" className="card-btn" onClick={getAllUsers} disabled={loading}>
              <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Loading users...</p>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button type="button" className="card-btn mx-auto mt-3" onClick={getAllUsers}>Try again</button>
            </div>
          ) : users.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {users.map((user) => (
                <article
                  key={user._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openUserDashboard(user._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openUserDashboard(user._id);
                    }
                  }}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <div className="flex items-start gap-3">
                    {user.profileImageUrl ? (
                      <img src={getImageUrl(user.profileImageUrl)} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary"><LuUser className="text-xl" /></span>
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-800">{user.name || "Unnamed user"}</h2>
                      <p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs text-slate-500">
                        <LuMail className="shrink-0" /> {user.email || "No email available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                    <div className="px-2 text-center first:pl-0">
                      <LuClock3 className="mx-auto text-amber-500" />
                      <p className="mt-2 text-lg font-semibold text-slate-800">{user.pendingTask ?? 0}</p>
                      <p className="text-[11px] text-slate-500">Pending</p>
                    </div>
                    <div className="px-2 text-center">
                      <LuRefreshCw className="mx-auto text-cyan-500" />
                      <p className="mt-2 text-lg font-semibold text-slate-800">{user.inProgressTask ?? 0}</p>
                      <p className="text-[11px] text-slate-500">In progress</p>
                    </div>
                    <div className="px-2 text-center last:pr-0">
                      <LuCheck className="mx-auto text-emerald-500" />
                      <p className="mt-2 text-lg font-semibold text-slate-800">{user.completedTask ?? 0}</p>
                      <p className="text-[11px] text-slate-500">Completed</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No users found.</p>
          )}
        </div>
      </div>
    </Dashboardlayout>
  )
}

export default ManageUser
