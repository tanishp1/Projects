const Task = require('../models/Task');

//@desc     GET all task (Admin: all, User: only assign task)
// @route   GET/api/tasks/
//@access   Private
const getTasks = async (req, res) => {
    try{
        const { status } = req.query;
        let filter = {};

        if(status){
            filter.status = status
        }

        let tasks;
        if(req.user.role === "admin"){
            tasks = await Task.find(filter).populate('assignedTo', 'name email profileImageUrl')
        }else {
            tasks = await Task.find({...filter, assignedTo: req.user._id}).populate('assignedTo','name email profileImageUrl')
        }

        // Add completed todochecklist count to each task
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoCheckList.filter((item) => item.completed).length;
                return { ...task._doc, completedTodoCount: completedCount };
            })
        );

        // Status summary count
        const allTasks = await Task.countDocuments(
            req.user.role == 'Admin' ? {} : {assignedTo: req.user._id}
        );

        const pendingTask = await Task.countDocuments({
            ...filter, status: 'Pending', ...(req.user.role !== 'admin' && {assignedTo: req.user._id}),
        });

        const inProgressTask = await Task.countDocuments({
            ...filter, status: 'In Progress', ...(req.user.role !== 'admin' &&{assignedTo: req.user._id}),
        });

        const completedTask = await Task.countDocuments({
            ...filter, status: 'Completed', ...(req.user.role !== 'admin' && {assignedTo: req.user._id}),
        });

        res.json({
            tasks, statusSummary: {
                all: allTasks, pendingTask, inProgressTask, completedTask
            }
        });

    }catch(error){
        return res.status(500).json({ message: "internal server issue"})
    }
}

//@desc     GET task ID
//@route    GET/api/tasks/:id
//@access   Private
const getTasksById = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');

        if(!task)
            return res.status(404).json({message: 'Task is not found'})
        res.json(task);

    }catch(error){
        return res.status(500).json({ message: "internal server issue"})
    }
}

//@desc     Create a new task (admin only)
//@route    POST/api/tasks/
//@access   Private(Admin)
const createTask = async (req, res) => {
    try{
        const {title, description, priority, dueDate, assignedTo, attachment, todoCheckList} = req.body;
        
        if(!Array.isArray(assignedTo)){
            return res.status(400).json({message: "assignedTo must be an array of user ID's"});
        }

        const task = await Task.create({
            title, description, priority, dueDate, assignedTo, createdBy: req.user._id, todoCheckList, attachment
        });
        return res.status(200).json({message : "Task created successfully", task});
    }catch(error){
        return res.status(500).json({ message: "internal server issue"})
    }
}

//@desc     Update the task details
//@route    PUT/api/tasks/:id
//@access   Private
const updateTask = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id);

        if(!task)
            return res.status(404).json({message: "task is not found"});

        task.title = req.body.title || task.title,
        task.description = req.body.description || task.description,
        task.priority = req.body.priority || task.priority,
        task.dueDate = req.body.dueDate || task.dueDate,
        task.todoCheckList = req.body.todoCheckList || task.todoCheckList,
        task.attachment = req.body.attachment || task.attachment

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return res.status(400).json({message: 'assignedTo must be an array of user IDs'})
            }
            task.assignedTo = req.body.assignedTo;
        }
        const updateTask = await task.save();
        return res.status(201).json({message: "Task update", updateTask});
    }catch(error){
        return res.status(500).json({ message: "internal server issue"})
    }
}

//@desc     delete the task details
//@route    DELETE/api/tasks/:id
//@access   Private
const deleteTask = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(400).json({message: 'Task is not found'})
        }

        await task.deleteOne();
        return res.status(200).json({message: "task deleted successfully"});

    }catch(error){
        return res.status(500).json({ message: "internal server issue"})
    }
}

//@desc     update the task status
//@route    PUT /api/tasks/:id/status
//@access   Private
const updateTaskStatus = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id);

        if(!task)
            return res.status(400).json({message: 'Task is not found'});
        
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if(!isAssigned && req.user.role !== 'admin'){
            return res.status(403).json({message: 'not authorized '});
        };

        task.status = req.body.status || task.status;

        if(task.status == 'Completed'){
            task.todoCheckList.forEach((item)=>(item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({message: 'Task status update', task});

    }catch(error){
        return res.status(500).json({message: "internal server isssue"})
    }
}
//@desc     update the task checklist
//@route    PUT /api/task/:id/todo
//access    Private
const updateTaskChecklist = async (req, res) => {
    try{
        const {todoCheckList} = req.body;
        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(400).json({message: 'Task not found'}) ;      
        };

        if(!task.assignedTo.includes(req.user._id)&& req.user.role !== 'admin'){
            return res.status(403).json({message: 'not authorized '});
        };

        task.todoCheckList = todoCheckList;

        //Auto update progress done in checklist 
        const completedCount = task.todoCheckList.filter(
            (item)=> item.completed
        ).length;
        
        const totalItems = task.todoCheckList.length;
        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        //Auto-mark task are completed if all item are checked
        if(task.progress == 100){
            task.status = "Completed";
        } else if(task.progress > 0){
            task.status = "In Progress";
        } else {
            task.status = "Pending";
        }

        await task.save();
        const updateTask = await Task.findById(req.params.id).populate(
            'assignedTo', 'name email profileImageUrl'
        )

        res.json({message: 'Task checklist is update successfully', task:updateTask})
    }catch(error){
        console.log(error)
        return res.status(500).json({messaage: "internal server issue"})
    }
}
//@desc     get dashboard data (Admin only)
//@route    GET /api/tasks/dashborad-data
//@access   Private 
const getDashboardData = async(req, res) => {
    try{

        // Fetch statistic
        const totalTask = await Task.countDocuments();
        const pendingTask = await Task.countDocuments({status: 'Pending'});
        const completeTask = await Task.countDocuments({status: 'Completed'});
        const overdueTask = await Task.countDocuments({
            status: { $ne: 'Completed'},
            dueDate: { $lt: new Date() },
        })

        // Ensure all possible status are includes
        const taskStatuses = ['Pending', 'In Progress', 'Completed'];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1}
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status )=>{
            const formatKey = status.replace(/\s+/g, "");
            acc[formatKey] = taskDistributionRaw.find((item)=> item._id == status)?.count || 0;
            return acc;
        },{});

        taskDistribution['All'] = totalTask;

        // Ensure all possible priority 
        const taskPriority = ['low', 'medium', 'high'];
        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1}
                },
            },
        ]);
        const taskPriorityLevel = taskPriority.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelRaw.find((item)=>item._id == priority)?.count || 0;
            return acc;
        }, {});

        // fetch recent 10
        const recentTasks = await Task.find()
        .sort({createdAt: -1}).limit(10).select('title status priority dueDate createAt');
        res.status(200).json({
            statistics: {
                totalTask, pendingTask, completeTask, overdueTask
            },
            charts: {
                taskDistribution,
                taskPriorityLevel,   
            },
            recentTasks,
        });
    }catch(error){
        return res.status(500).json({message: "internal sever issue"})
    }
}

//@desc     get dashboard user data 
//@route    GET /api/tasks/user-dashborad-data
//@access   Private
const getUserDashboardData = async(req, res) => {
    try{

        const userId = req.user._id;

        // fetching statistics for user-specific tasks
        const totalTask = await Task.countDocuments({assignedTo: userId});
        const pendingTask = await Task.countDocuments({ assignedTo: userId, status: 'Pending'});
        const completeTask = await Task.countDocuments({assignedTo: userId, status: 'Completed'});
        const overdueTask = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: 'Completed'},
            dueDate: { $lt: new Date() },
        })
        // Task distribution status
        const taskStatuses = ['Pending', 'In Progress', 'Completed'];
        const taskDistributionRaw = await Task.aggregate([
            {
                $match: {
                    assignedTo: userId
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1}
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status )=>{
            const formatKey = status.replace(/\s+/g, "");
            acc[formatKey] = taskDistributionRaw.find((item)=> item._id == status)?.count || 0;
            return acc;
        },{});

        taskDistribution['All'] = totalTask;

        const taskPriority = ['low', 'medium', 'high'];
        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $match: {
                    assignedTo: userId
                }
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1}
                },
            },
        ]);
        const taskPriorityLevel = taskPriority.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelRaw.find((item)=>item._id == priority)?.count || 0;
            return acc;
        }, {});

        // fetch recent 10
        const recentTasks = await Task.find({assignedTo: userId})
        .sort({createdAt: -1}).limit(10).select('title status priority dueDate createAt');
        res.status(200).json({
            statistics: {
                totalTask, pendingTask, completeTask, overdueTask
            },
            charts: {
                taskDistribution,
                taskPriorityLevel,   
            },
            recentTasks,
        });

    }catch(error){
        return res.status(500).json({message: "internal server issue"})
    }
}
module.exports = {getTasks, getTasksById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist, getDashboardData, getUserDashboardData};