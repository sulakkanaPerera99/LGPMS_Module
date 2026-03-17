import { createWebHistory, createRouter } from "vue-router";
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Thank from '../views/Thank.vue';
import Admin from '../admin/Admin.vue';
import Dashboard from '../views/Dashboard.vue';
import UserRegister from '../views/UserRegister.vue';
import Profile from '../views/Profile.vue';
import ChangePassword from '../views/ChangePassword.vue';
import SabhaProfile from '../views/SabhaProfile.vue';
import Assign from '../views/Assign.vue';
import Vote from '../views/Vote.vue'; 

//////////////////////////////////////////////////////////
import OfficerDashboard from '../views/water billing/OfficerDashboard.vue'
import AddAndManageWaterProjects from '../views/water billing/AddAndManageWaterProjects.vue'
import AddCustomer from '../views/water billing/AddCustomer.vue'
import ManageWaterAccounts from '../views/water billing/ManageWaterAccounts.vue'
import BillPayment from '../views/water billing/PayableAccounts.vue'
import StreetLine from '@/views/certificate issuing/Street Line/StreetLineDashboard.vue'
import CheckDues from '@/views/certificate issuing/Street Line/CheckDues.vue'
import AssignTO from '@/views/certificate issuing/Street Line/AssignTO.vue'
import ViewCustomerHistory from '@/views/water billing/ViewCustomerHistory.vue'
import PrintBill from '@/views/water billing/PrintBill.vue'
import BusinessTaxDashboard from '../views/certificate issuing/Business and Industrial tax and Trade certificate/BusinessTaxDashboard.vue'
import RequestNewSLApplication from '@/views/certificate issuing/Street Line/RequestNewSLApplication.vue'
import CheckSLCStatus from '@/views/certificate issuing/Street Line/CheckSLCStatus.vue'
import AllSLCertificates from '@/views/certificate issuing/Street Line/AllSLCertificates.vue'
import RequestNewBTApplication from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/RequestNewBTApplication.vue'
import PendingBTApplications from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/PendingBTApplications.vue'
import CheckBTCStatus from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/CheckBTCStatus.vue'
import GenerateBTCertificate from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/generateBTCertificate.vue'
import AllBTCertificates from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/AllBTCertificates.vue'
import BTCReportGeneration from '@/views/certificate issuing/Business and Industrial tax and Trade certificate/BTCReportGeneration.vue'
import WaterBillReportGeneration from '@/views/water billing/WaterBillReportGeneration.vue'
import GenerateSLCertificate from '@/views/certificate issuing/Street Line/GenerateSLCertificate.vue'
import StreetLineReportGeneration from '@/views/certificate issuing/Street Line/StreetLineReportGeneration.vue'
import AddReadings from "@/views/water billing/AddReadings.vue";
import BillTemplate from '@/views/water billing/BillTemplate.vue'
import PaymentInterface from "../views/water billing/PaymentInterface.vue";
import ManageBillingFees from "../views/water billing/ManageBillingFees.vue";
import AddBillingFees from "@/views/water billing/AddBillingFees.vue";
import fetchCustomerHistory from "../views/water billing/CustomerPaymentHistory.vue";
//sms
import BulkSMS from "@/views/SMS/BulkSMS.vue";
import SMSConfig from "@/views/SMS/SMSConfig.vue";
import ConfigVotes from "@/views/water billing/ConfigVotes.vue";
import AddMeterReadingManually from "@/views/water billing/AddMeterReadingManually.vue";
import BulkBillTemplate from "@/views/water billing/BulkBillTemplate.vue";

//UnderDevelopment 

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login, 
  },
  {
    path: "/Dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/thank",
    name: "Thank",
    component: Thank,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
  },
  
 
  //user Registration
  {
    path: "/uregister",
    name: "UserRegister",
    component: UserRegister,
  },


  {
    path: "/Profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/ChangePassword",
    name: "ChangePassword",
    component: ChangePassword,
  },
  {
    path: "/SabhaProfile",
    name: "SabhaProfile",
    component: SabhaProfile,
  },
  
  {
    path: "/Assign",
    name: "Assign",
    component: Assign,
  },
  
  {
    path: "/incomeheadsnew",
    name: "Vote",
    component:Vote,
  },
  {
        path: '/home',
        name: 'home',
        component: Home
      },
      {
        path: '/officer-dashboard',
        name: 'officer-dashboard',
        component: OfficerDashboard
      },
      {
        path: '/manage-water-projects',
        name: 'manage-water-projects',
        component: AddAndManageWaterProjects
      },
      {
        path: '/edit-billing-fees',
        name: 'edit-billing-fees',
        component: ManageBillingFees
      },
      {
        path: '/add-billing-fees',
        name: 'add-billing-fees',
        component: AddBillingFees
      },
      {
        path: '/add-customer',
        name: 'add-customer',
        component: AddCustomer
      },
      {
        path: '/manage-water-accounts',
        name: 'manage-water-accounts',
        component: ManageWaterAccounts
      },
      {
        path: '/bill-payment',
        name: 'bill-payment',
        component: BillPayment
      },
      {
        path:'/print-bill',
        name:'print-bill',
        component: PrintBill
      },
      {
       path:'/view-customer-history',
       name:'view-customer-history',
       component: ViewCustomerHistory
      },
      {
        path:'/config_sms',
        name:'config_sms',
        component: SMSConfig
      },
      {
        path: '/water-bill-report-generation',
        name: 'water-bill-report-generation',
        component: WaterBillReportGeneration
      },
      {
        path:'/vote_setup',
        name:'vote_setup',
        component: ConfigVotes
      },
      {
        path:'/add-meter-reading-manual',
        name:'add-meter-reading-manual',
        component: AddMeterReadingManually
      },
      {
        path: '/bulk-bill-template',
        name: 'BulkBillTemplate',
        component: BulkBillTemplate
      },
      {
        path: '/tax/street',
        name: 'street-certificate',
        component: StreetLine
      },
      {
        path: '/request-new-sl-application',
        name: 'request-new-sl-application',
        component: RequestNewSLApplication
      },
      {
        path: '/check-dues',
        name: 'check-dues',
        component: CheckDues
      },
      {
        path: '/check-sl-cert-status',
        name: 'check-sl-cert-status',
        component: CheckSLCStatus
      },
      {
        path: '/generate-sl-certificate',
        name: 'generate-sl-certificate',
        component: GenerateSLCertificate
      },
      {
        path: '/all-sl-certificates',
        name: 'all-sl-certificates',
        component: AllSLCertificates
      },
      {
        path: '/sl-report-generation',
        name: 'sl-report-generation',
        component: StreetLineReportGeneration
      },
      {
        path: '/assign-TO',
        name: 'assign-TO',
        component: AssignTO
      },
      {
        path: '/tax/business',
        name: 'business-tax',
        component: BusinessTaxDashboard
      },
      {
        path: '/request-new-bt-application',
        name: 'request-new-bt-application',
        component: RequestNewBTApplication
      },
      {
        path: '/Pending-bt-applications',
        name: 'Pending-bt-applications',
        component: PendingBTApplications
      },
      {
        path: '/check-bt-cert-status',
        name: 'check-bt-cert-status',
        component: CheckBTCStatus
      },
      {
        path: '/generate-bt-certificate',
        name: 'generate-bt-certificate',
        component: GenerateBTCertificate
      },
      {
        path: '/all-bt-certificates',
        name: 'all-bt-certificates',
        component: AllBTCertificates
      },
      {
        path: '/bt-report-generation',
        name: 'bt-report-generation',
        component: BTCReportGeneration
      },
      {
        path: '/add-meter-reading',
        name: 'add-meter-reading',
        component: AddReadings
      },
      {
        path: '/bill-template/:id',
        name: 'BillTemplate',
        component: BillTemplate
      },
      {
        path: '/pay-bill/:billNumber',
        name: 'PaymentInterface',
        component: PaymentInterface,
        props: true
      },
      {
        path: '/pay-bill-legacy/:accountId',
        name: 'WaterBillPayment',
        component: PaymentInterface,
        props: (route) => ({ billNumber: route.params.accountId })
      },
      {
        path: '/payment-history-view/:id',
        name: 'PaymentHistoryView',
        component: fetchCustomerHistory,
        props: true
      },
      {
        path: '/send_sms',
        name: 'send_sms',
        component: BulkSMS
      },
      {
    path: '/:pathMatch(.*)*',
    component: Login,
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;