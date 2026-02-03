import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from 'path';

// --- Routes Imports ---
import router from "./routes/routes.js";
import newrouter from "./routes/newroutes.js";
import dateroutes from "./routes/dateroutes.js";
import WaterProjectRoute from "./routes/water_billing_system/waterProjectRoutes.js";
import billingFeesRoute from "./routes/water_billing_system/billingFeesRoute.js";
import customerRoutes from "./routes/water_billing_system/waterCustomerAccountsRoutes.js";
import waterCustomerRoutes from './routes/water_billing_system/waterCustomerAccountsRoutes.js';
import waterReadingsRoutes from './routes/water_billing_system/waterReadingsRoutes.js';
import waterBillPaymentRoutes from './routes/water_billing_system/waterBillPaymentRoutes.js';
import paymentRoutes from './routes/water_billing_system/paymentRoutes.js';
import paymentHistoryRoutes from './routes/water_billing_system/customerRoutes.js';
import waterBillingReportRoutes from './routes/water_billing_system/reportRoutes.js'; // Path fixed (removed ../backend)

// *** 1. නිවැරදි කළ Import Path එක ***
import waterBillRoutes from "./routes/water_billing_system/BillTemplateRoutes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CORS Config ---
app.use(cors({
    origin: ["http://localhost:8080", "https://elgservices.lk"],
    credentials: true
}));

// --- Route Registration ---

// *** 2. මෙම කොටස අලුතින් එකතු කරන්න (Route Mount කිරීම) ***
app.use('/api', waterBillRoutes); 
// මෙය දැමූ පසු ඔබේ URL එක වනුයේ: http://localhost:3000/api/water-bills/:id

app.use('/api', billingFeesRoute);
app.use(router);
app.use(newrouter);
app.use(dateroutes);
app.use('/api', WaterProjectRoute);
app.use('/api/water-billing', customerRoutes);
app.use('/api', waterCustomerRoutes);
app.use('/api/water-readings', waterReadingsRoutes);
app.use('/api', waterBillPaymentRoutes);
app.use('/api', paymentRoutes);
app.use('/api', paymentHistoryRoutes);
app.use('/api/reports', waterBillingReportRoutes);

app.get('/api/getserverdate', (req, res) => {
  const serverDate = new Date();
  res.json({ serdate: serverDate });
});

app.get('/', function(req, res){
    res.json({ message: 'Welcome to LGPMS api' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});