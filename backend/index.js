// using nodemon so that you do not need to type node index.js every time new code saved

// import express - is for building the Rest apis
import express from "express";

// import body-parser - helps to parse the request and create the req.body object
import bodyParser from "body-parser";

// import cors - provides Express middleware to enable CORS with various options, connect frontend
import cors from "cors";

// import routes
import {fileURLToPath} from 'url';
import router from "./routes/routes.js";
import newrouter from "./routes/newroutes.js";
// import asesroutes from "./routes/asesroutes.js"
import dateroutes from "./routes/dateroutes.js"
import WaterProjectRoute from "./routes/water_billing_system/waterProjectRoutes.js"; // අපි අලුතෙන් හදපු Route එක Import කළා
import billingFeesRoute from "./routes/water_billing_system/billingFeesRoute.js";
import customerRoutes from "./routes/water_billing_system/waterCustomerAccountsRoutes.js";
import waterCustomerRoutes from './routes/water_billing_system/waterCustomerAccountsRoutes.js';


import path from 'path';
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

// init express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// use express json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CORS සැකසුම් (වෙනස් කළ කොටස) ---
app.use(cors({
    origin: ["http://localhost:8080", "https://elgservices.lk"], // මෙන්න මෙතන තමයි දෙකටම අවසර දෙන්නේ
    credentials: true
}));


app.use('/api', billingFeesRoute);


// use router
app.use(router);
app.use(newrouter);
// app.use(asesroutes);
app.use(dateroutes);
app.use('/api',WaterProjectRoute); // අලුත් Water Project Route එක එකතු කළා
app.use('/api/water-billing', customerRoutes);
app.use('/api', waterCustomerRoutes);



// පහත තිබූ res.setHeader කොටස අයින් කළා (Removed manual headers block)

app.get('/api/getserverdate', (req, res) => {
  const serverDate = new Date();
  res.json({ serdate: serverDate });
});

app.get('/', function(req, res){
    res.json({ message: 'Welcome to LGPMS api' });
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});