// import / requiring libraries...
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoute = require('./routes/authRoute');
const interviewRoutes = require('./routes/interviewRoute');
const evaluateRoute = require('./routes/evaluateRoute');


// creating app from express...
const app = express();





// configuring dotenv to access enviornment variables...
dotenv.config();

// connecting to database...
//connectDB();




// middlewares functions...
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// routes ...
app.get('/', (req,res) => {res.send('api is running.....');});

app.use('/api/auth', authRoute);
app.use('/api/interview', interviewRoutes);
app.use('/api/interview', evaluateRoute);








// starting or listening server at specific port...
app.listen(process.env.PORT,() => {
    console.log(`✅ Server is running at port ${process.env.PORT}`);
});