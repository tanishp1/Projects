import React from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

import PrivateRoute from './routes/PrivateRoute'

import Dashborad from './pages/Admin/Dashborad'
import ManageTask from './pages/Admin/ManageTask'
import CreateTask from './pages/Admin/CreateTask'
import ManageUser from './pages/Admin/ManageUser'

import UsersDashborad from './pages/Users/UsersDashborad'
import MyTask from './pages/Users/MyTask'
import ViewsDetails from './pages/Users/ViewsDetails'

const App = () => {
  return (
    <div >
      <Router>
        <Routes>
          <Route  path='/login' element={<Login/>}/>
          <Route path='/sigup' element={<Signup/>} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRole={['admin']}/>}/> 
          <Route path='/admin/dashboard' element={<Dashborad/>}/>
          <Route path='/admin/task' element={<ManageTask/>}/>
          <Route path='/admin/create-task' element={<CreateTask/>}/>
          <Route path='/admin/users' element={<ManageUser/>}/>
        
        {/* Users Routes */}
        <Route element={<PrivateRoute allowedRole={['admin']}/>}/>
        <Route path='/users/dashboard' element={<UsersDashborad/>}/>
        <Route path='/users/tasks' element={<MyTask/>}/>
        <Route path='/users/task-details/:id' element={<ViewsDetails/>}/>
        
        </Routes>
      </Router>
    </div>
  )
}

export default App
