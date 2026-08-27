const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        require: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: Sting,
            require: true,
        },
        descirption: {
            type: String,
        },
        priority: {
            type: String,
            enum:['low', 'medium', 'high'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        dueDate: {
            type: String,
            require: true,
        },
        assignTo: [
            {
                type: mongoose.Schema.Types.ObjectId, ref:'User'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        attachment: [
            {
                type: String
            }
        ],
        todoCheckList: [
            todoSchema
        ],
        progress: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models('Task', taskSchema)