const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const {Users} = require('../models')
const { Tasks } = require('../models')

const registerUser = asyncHandler(async (req, res) => {
    console.log("came");
    try {
        const {name, email, phoneNumber, password} = req.body;
        const userExists = await Users.findOne({ where: {email}});
        if(userExists){
            res.json({
                existMessage: "User already exist"
            })
           
        }else {
            const salt = await bcrypt.genSaltSync(10);
            let hashPassword = await bcrypt.hash(password, salt);
            if(hashPassword) {
                const newUser = await Users.create({
                    name,
                    email,
                    phoneNumber,
                    password: hashPassword,
                });
                if(newUser) {
                    console.log("new",newUser.dataValues.id);
                    res.json({
                        name: name,
                        email: email,
                        phoneNumber: phoneNumber,
                        token: generateToken(newUser.dataValues.id),
                        successMessage:"Registration successfull",
                     
                    })
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
})

const login = asyncHandler(async (req, res)=> {
    try {
        const {email, password} = req.body;
        
        const user = await Users.findOne({ where: {email}});
        if(user && (await bcrypt.compare(password, user.dataValues.password))){
            
            res.json({
                name: user.dataValues.name,
                email: user.dataValues.email,
                token: generateToken(user.dataValues.id),
                userData:user
            })
           
        }else {
            if (!user){
                res.json({
                    message: "User does not exist"
                });
            }
            res.json({
                message: "Password Incorrect"
            })
        }
    } catch (error) {
        console.log(error.message);
    }
})

const addTask = asyncHandler(async(req,res) => {
    const {userId, title, description, startDate, endDate} = req.body
    console.log("back", userId, title, description);
    const task = await Tasks.create({
        title,
        description,
        startDate,
        endDate,
        progress: 0,
        status: false,
        userId
      });

      res.status(201).json(task);
})

const getAllTasks = asyncHandler(async (req, res) =>{
    const userId = req.query.userId;
    console.log(userId);
    const tasks = await Tasks.findAll({
        where: { userId },
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'userId']
        }
    })
    res.json(tasks);
});

const updateTask = asyncHandler(async (req, res) =>{
    const {id, upTitle, upDescription,upProgress, upStartDate, upEndDate} = req.body
    console.log("backendpp",id, upTitle, upDescription,upProgress, upStartDate, upEndDate);

    const task = await Tasks.findByPk(id);

    if(!task){
        res.status(404);
        throw new Error("Task not found");
    }

    task.title = upTitle;
    task.description = upDescription;
    task.startDate = upStartDate;
    task.endDate = upEndDate;
    task.progress = upProgress;

    if (upProgress === 100) {
        task.status = true;
      }

      await task.save();

      res.json({ message: "Task updated successfully", task });
})

const deleteTask = asyncHandler(async (req, res) => {
    const id = req.params.id;
    console.log("back", id);
    const task = await Tasks.findByPk(id);

    if (!task) {
        res.status(404);
        throw new Error("Task not found");
      }
      await task.destroy();
      res.json({ message: "Task deleted successfully" });
})

const setRemainder = asyncHandler(async(req, res) => {
    console.log("came to setreminder");
    try {
        console.log("setting");
        const taskId = req.params.id;
        const taskData = req.body;
        const userId = req.user.id;

        console.log("back", taskData, taskId, userId);

        const task = await Tasks.findOne({
            where: {
                id: taskId,
                userId: userId,
            }
        })

        if(!task){
            return res.status(404).json({ message: "Task not found"});
        }
        else {
            task.setRemainder = taskData.remainder
        }

        const updated = await task.save();

        res.status(200).json({ message: "Task Updated successfully", task: updated})
    } catch (error) {
        console.log(error);
    }
})

module.exports = {
    registerUser,
    login,
    addTask,
    getAllTasks,
    updateTask,
    deleteTask,
    setRemainder

}