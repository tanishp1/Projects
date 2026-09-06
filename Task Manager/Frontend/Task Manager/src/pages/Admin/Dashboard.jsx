import { useState, useEffect } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { useContext } from "react";
import  { UserContext } from "../../context/useContext"
import Dashboardlayout from '../../components/layout/Dashboardlayout';
import Axiosinstance from '../../utils/Axiosinstance';
import { API_PATHS } from '../../utils/ApiPath';
import moment from 'moment'
import { addThousandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/Cards/infoCard';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import TaskListTable from '../../components/TaskListTable';
import CustomePieChart from '../../components/Charts/CustomePieChart';
import CustomeBarChart from '../../components/Charts/CustomeBarChart';

const COLORS = ['#8D51FF', '#00BBDB', '#7BCE00'];

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setdashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevel = data?.taskPriorityLevel || null;

    const taskDistributionData = [
      {status: 'Pending', count: taskDistribution?.Pending || 0},
      {status: 'Completed', count: taskDistribution?.Completed || 0},
      {status: 'In Progress', count: taskDistribution?.InProgress || 0},
    ];
    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      {priority: 'high', count: taskPriorityLevel?.high || 0},
      {priority: 'meduim', count: taskPriorityLevel?.meduim || 0},
      {priority: 'low', count: taskPriorityLevel?.low || 0},
    ];
    setBarChartData(PriorityLevelData);
  }

  const onSeeMore = () => {
    navigate('/admin/tasks');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await Axiosinstance.get(API_PATHS.TASK.GET_DASHBOARD_DATA);
        if(response.data){
          setdashboardData(response.data);
          prepareChartData(response.data?.charts || null)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    };

    loadDashboardData();
  }, [])
  
  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className='card my-5'>
        <div>
          <div className='col-span-3'>
          <h2 className='text-xl md:text-2xl'>Good Morning !{user?.name}</h2>
          <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>
            {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
          <InfoCard  label="Total Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.All || 0
          )}
          color="bg-blue-600"
          />

          <InfoCard  label="Pending Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.Pending || 0
          )}
          color="bg-amber-500"
          />

          <InfoCard  label="In Progress Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.InProgress || 0
          )}
          color="bg-cyan-500"
          />

          <InfoCard  label="Completed Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.Completed || 0
          )}
          color="bg-emerald-500"
          />

        </div>
      </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>

            <div>
              <div className='card'>
                <div className='flex items-center justify-between'>
                  <h5 className='font-medium'>Task Distribution</h5>
                </div>

                <CustomePieChart data={pieChartData} color={COLORS}/>
              </div>
            </div>

            <div>
              <div className='card'>
                <div className='flex items-center justify-between'>
                  <h5 className='font-medium'>Task Priority</h5>
                </div>

                <CustomeBarChart data={barChartData} />
              </div>
            </div>
            <div className='md:cols-span-2'>
              <div className='card'>
                <div className='flex items-center justify-between'>
                  <h5 className='text-lg'>Recent Task</h5>
                  <button className='card-btn' onClick={onSeeMore}>See All
                    <LuArrowRight className='text-base'/></button>
                </div>
                <TaskListTable tableData={dashboardData?.recentTasks || []}/>
              </div>
            </div>
          </div>
    </Dashboardlayout>
  )
}

export default Dashboard
