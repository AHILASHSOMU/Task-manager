const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');
const userRoute = require('./routes/userRoute');
const app = express();
const db = require('./models');
dotenv.config();



app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true }));

app.use( cors())
app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials","true");
    res.send("API is running..");
});

app.use("/user", userRoute);

db.sequelize.sync().then(()=>{
    app.listen(3001, ()=>{
        console.log("Server running in 3001");
    });
})


