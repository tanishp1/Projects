import React, { useState, useEffect } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { useContext } from "react";
import  { UserContext } from "../../context/useContext"
import Dashboardlayout from '../../components/layout/Dashboardlayout';
import { useNavigate } from 'react-router-dom';
import Axiosinstance from '../../utils/Axiosinstance';
import { API_PATHS } from '../../utils/ApiPath';

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setdashboardData] = useState(null);
  const [pieChart, setPieChart] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const getDashboardData = async () => {
    try {
      const response = await Axiosinstance.get(API_PATHS.TASK.GET_DASHBOARD_DATA);
      if(response.data){
        setdashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    getDashboardData();
  
    return () => {};
  }, [])
  
  return (
    <Dashboardlayout activeMenu="Dashboard">
      Dashboard
    </Dashboardlayout>
  )
}

export default Dashboard
