const express = require('express');
const router = express.Router();
const { registerUser, login, addTask, getAllTasks, updateTask, deleteTask, setRemainder } = require("../controllers/userController")
const protect = require('../middlewares/auth')

router.route('/register').post(registerUser)
router.route('/signIn').post(login)
router.route('/addTask').post(protect,addTask)
router.route('/getAllTasks').get(protect,getAllTasks)
router.route('/updateTask').post(protect,updateTask)
router.route('/deleteTask/:id').get(protect,deleteTask);
router.route('/setRemainder/:id').post(protect, setRemainder)

module.exports = router;