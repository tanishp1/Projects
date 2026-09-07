import { useContext, useEffect, useState } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { LuArrowRight, LuCalendarDays, LuRefreshCw } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/useContext";
import CustomeBarChart from "../../components/Charts/CustomeBarChart";
import CustomePieChart from "../../components/Charts/CustomePieChart";
import Dashboardlayout from "../../components/layout/Dashboardlayout";
import InfoCard from "../../components/Cards/InfoCard";
import Axiosinstance from "../../utils/Axiosinstance";
import { API_PATHS } from "../../utils/ApiPath";
import { addThousandsSeparator } from "../../utils/helper";
import { useUserAuth } from "../../hooks/useUserAuth";

const CHART_COLORS = ["#8D51FF", "#00BBDB", "#7BCE00"];

const UsersDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_USER_DASHBOARD_DATA(user?._id));
      setDashboardData(response.data);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load your dashboard.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const taskDistribution = dashboardData?.charts?.taskDistribution || {};
  const taskPriorityLevel = dashboardData?.charts?.taskPriorityLevel || {};
  const pieChartData = [
    { status: "Pending", count: taskDistribution.Pending || 0 },
    { status: "Completed", count: taskDistribution.Completed || 0 },
    { status: "In Progress", count: taskDistribution.InProgress || 0 },
  ];
  const barChartData = [
    { priority: "high", count: taskPriorityLevel.high || 0 },
    { priority: "medium", count: taskPriorityLevel.medium || 0 },
    { priority: "low", count: taskPriorityLevel.low || 0 },
  ];

  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className="my-5 pb-8">
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl text-slate-800 md:text-2xl">Good morning, {user?.name || "there"}!</h1>
              <p className="mt-1.5 text-xs text-slate-400 md:text-[13px]">{moment().format("dddd Do MMM YYYY")}</p>
            </div>
            <button type="button" className="card-btn" onClick={getDashboardData} disabled={loading}>
              <LuRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            <InfoCard label="Total Tasks" value={addThousandsSeparator(taskDistribution.All || 0)} color="bg-blue-600" />
            <InfoCard label="Pending Tasks" value={addThousandsSeparator(taskDistribution.Pending || 0)} color="bg-amber-500" />
            <InfoCard label="In Progress Tasks" value={addThousandsSeparator(taskDistribution.InProgress || 0)} color="bg-cyan-500" />
            <InfoCard label="Completed Tasks" value={addThousandsSeparator(taskDistribution.Completed || 0)} color="bg-emerald-500" />
          </div>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading your dashboard...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-rose-500">{error}</p>
            <button type="button" className="card-btn mx-auto mt-3" onClick={getDashboardData}>Try again</button>
          </div>
        ) : (
          <>
            <div className="my-4 grid grid-cols-1 gap-6 md:my-6 md:grid-cols-2">
              <div className="card">
                <h2 className="font-medium text-slate-800">Task Distribution</h2>
                <CustomePieChart data={pieChartData} color={CHART_COLORS} />
              </div>
              <div className="card">
                <h2 className="font-medium text-slate-800">Task Priority</h2>
                <CustomeBarChart data={barChartData} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg text-slate-800">Recent Tasks</h2>
                <button type="button" className="card-btn" onClick={() => navigate("/users/tasks")}>
                  See all <LuArrowRight />
                </button>
              </div>
              {dashboardData?.recentTasks?.length ? (
                <div className="mt-4 divide-y divide-slate-100">
                  {dashboardData.recentTasks.map((task) => (
                    <div key={task._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{task.priority || "medium"} priority</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><LuCalendarDays />{task.dueDate ? moment(task.dueDate).format("DD MMM YYYY") : "No due date"}</span>
                        <span className="rounded border border-slate-200 px-2 py-1">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">No tasks assigned to you yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </Dashboardlayout>
  )
}

export default UsersDashboard
