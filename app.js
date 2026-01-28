//-----env ko connect karo 
require("dotenv").config();

//----express ko require karna haa ha or server bnana ha 
const express = require('express');
const app = express();

//----build in middlewares
app.use(express.json());

//-----databse ko connect kia ha 
const connectDB = require("./config/db");
connectDB();

//-----routes bnai haa jin ka aga mera route ka type lagaa ga 
app.use("/api/authprac",require("./routes/authRoutes"));


//----port chal rahi ha 
const PORT = process.env.PORT || 5000;
app.listen(PORT ,() => {
    console.log(`your server is working ${PORT}`);
});