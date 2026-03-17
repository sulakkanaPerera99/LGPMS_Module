import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
import paymentHistoryRoutes from './routes/water_billing_system/paymentHistoryRoutes.js';
import waterBillingReportRoutes from './routes/water_billing_system/reportRoutes.js';
import eachCustomerPaymentHistoryRoutes from './routes/water_billing_system/EachCustomerpaymentHistoryRoutes.js';
import waterProgressRoutes from './routes/water_billing_system/meterReadingsProgressRoute.js';
import waterBillRoutes from "./routes/water_billing_system/BillTemplateRoutes.js"; 
import onlineCustomerPaymentRoutes from './routes/water_billing_system/onlineCustomerPaymentRoutes.js';

//water votes
import waterVoteRoutes from './routes/water_billing_system/waterVoteRoutes.js';
//sms
import smsRoutes from './routes/SMS/smsRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CORS Config ---
app.use(cors({
    origin: ["http://localhost:8080", "https://elgservices.lk","http://localhost:8081"],
    credentials: true
}));


app.use('/api', waterBillRoutes); 

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
app.use('/api', eachCustomerPaymentHistoryRoutes);
app.use('/api', waterProgressRoutes);
app.use('/api/water_bill',onlineCustomerPaymentRoutes);

//water votes
app.use('/api/water-votes', waterVoteRoutes);
//sms
app.use('/api/sms', smsRoutes);

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