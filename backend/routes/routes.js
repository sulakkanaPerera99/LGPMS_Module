// import express 
import express from "express";

// import {processPayment} from '../controllers/paymentController.js';
import {sabhaKeys} from '../controllers/SabhaKeys.js';
// import { processCancel } from "../controllers/handlecancel.js";
import {
    ShopDetails,
ShopDetailsByNIC,
NewShopDetails,
UpdateShopData,
ShopDetailsByID,
ShopDetailNIC,
ShopDetailBySabha,
ShopArrearsUpdate,
deleteSingleShopDetail
} from "../controllers/shopdetails.js";
import {
    AllIncomeHeads,
    showIncomeHead,
} from "../controllers/payhead.js";
import {
    showshopRents,
    showshopRentsById,
    createshopRents,
    showshopRentsReciept,
    deleteshopRents,
    showRentsByDATE,
} from "../controllers/shoprent.js";

import {
    showshopRentsTemp,
    showshopRentsByIdTemp,
    createshopRentsTemp,
    
    deleteshopRentsTemp,
} from "../controllers/shoprenttemp.js";

// import {
//     sendMail,
// } from "../controllers/email.js";
import {
    getAllprSabha,
    Sabha,
    showSabhaDetails,
} from "../controllers/sabha.js";
import {
    getAllDistrict,
    showDistrict,
    showSabhaOfProvince,
} from "../controllers/district.js";

import {
    AllProvince,
    
} from "../controllers/province.js";

import {
    Users,
    AUser,
    register,
    updateUser,
    VerifyPass,
    Passwordupdate
} from "../controllers/customer.js";

import {
    allPayment,
    createPayment,
    showAPayment,
} from "../controllers/onlinepayment.js";
import {
    allPaymentTemp,
    createPaymentTemp,
    showAPaymentTemp,
    deleteOnlineTemp,
} from "../controllers/onlinepaymenttemp.js";
import {
    showAUser,
    createAccount,
    allUsers,
    updateProfile,
    updatePass,
    updateState,
    UserByLevel,
    sabhaEmployees,
    VerifyHashPass,
    updateStatebySabha,
   
} from "../controllers/employee.js";


import {
    // allIncomeHeads,
    // createHead,
    showAHeadIds,
    subByNicOfSabha,
    // sabhaIheads,
    // deleteRbySabha
} from "../controllers/incomeheads.js";

import {
    showSabha,
    updateSabha,

} from "../controllers/prasabha.js";

import {
    showCustomer,
    addCustomer,
    insertToSabhaCustomers,
    // sabhaIncomeHeads,

} from "../controllers/sabhacustomer.js";

import {
    showReceipt,
    showReceiptById,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    deleteSingleReceipt,
    deleteTempInv

} from "../controllers/temporyinvoice.js";
import {
    createInvoice,
    showInvoice,
    addToSave,
    invoiceSumForDate
} from "../controllers/invoice.js";

import {
    allLevels,
    allProvinces
} from "../controllers/userlevels.js";
import {
    allOnPayments,
    addOnlinePay
} from "../controllers/onlinepay.js";
import{
    assignTempSubject ,
    tempAssigns,
    deleteSingleSub,
    createSubject,
    deleteSubjects,
    savedSubs,
    deleteAssignedSub
} from "../controllers/assignSubs.js";
import{
    addBank,
    checkAccount,
    sabhaAccounts,
    addKey,
    deleteAddedBAcc
} from "../controllers/bankDetails.js";
import{
    getAllmarketStreets,
    marketStreetsById,
    marketStreetsBySbcode,
    createmarketStreets,
} from "../controllers/marketStreet.js";
import{
    reportByHid,
} from "../controllers/summery.js";
import{
    invoiceHeadsForDate,
    headsForDate
} from "../controllers/invoiceIncomeHeads.js";
//addMarketPlace
import{
    addShop,
    showShopsBySabha,
    deleteSingleShop
} from "../controllers/addShopNumbers.js";
import {
    getInvNum,
    InsertInvNum,
    updateInvNum,
   
} from "../controllers/onlineInvnumGen.js";
import { sabhaInsertInvNum, sabhagetInvNum, sabhaupdateInvNum,

} from  "../controllers/sabhaInvoiceNumG.js";
// import { processPaymentBOC
// }from  "../controllers/paymentControllerBoc.js";
// import { insertGenNum } from "../models/OnlineInvNumGenModel.js";


// init express router
const router = express.Router();
////////////////////////// Payment Class /////////////////////////////////
// get all Payament
//router.post("/api/processPayment/",processPayment);
// router.post("/api/Payamentreceipt/",receipt);
// router.post("/api/getDefaultForm/:id/:amont",paymentgate);
//////////BOC///////////
// router.post('/api/processpaymentboc', processPaymentBOC);

//////////////////////////////////////////
// 
// router.post('/api/process-payment', processPayment);
// router.post('/api/gotresponse',processCancel);
// router.get('/api/resposedata',processCancel);
router.get('/api/keys/:sbid',sabhaKeys);


////////////////////////// Shop Details /////////////////////////////////
// get all Shop Details
router.get("/api/shopdata/", ShopDetails);
// get single Shop Details by nic and pra_code
router.get("/api/shopdata/:taxeenic/:sbcode", ShopDetailsByNIC);
// get single Shop Details by nic
router.get("/api/shopdata/:taxnic", ShopDetailNIC);
// get single Shop Details byid
router.get("/api/shopdataid/:shopDid", ShopDetailsByID); 
// create Shop Details
router.post("/api/shopdata/", NewShopDetails);
// update Shop Details 
router.put("/api/shopdata/:id", UpdateShopData);
// update Shop arrears put ShopArrearsUpdate b4 UpdateShopData
router.put("/api/shoparrears/:shopDid", ShopArrearsUpdate);
//ShopDetailBySabha
router.get("/api/shopddetails/:sabhaid", ShopDetailBySabha);

router.delete("/api/deletshopdetail/:sid", deleteSingleShopDetail);

////////////////////////// Income Heads ////////////////////////////////
// get all Income Heads
router.get("/api/incomehead",AllIncomeHeads);

// get single Income Heads 
router.get("/api/incomehead/:id", showIncomeHead);

router.get("/api/usergraterdanfive/:sbcode/:nic", UserByLevel);

////////////////////////// Shop Rent ////////////////////////////////
// get all Shop Rent
router.get("/api/shoprents", showshopRents);

// get single Shop Rent 
router.get("/api/shoprents/:id", showshopRentsById);
// get single Shop Rent 
router.get("/api/shoprentbyinvoice/:receipt/:id", showshopRentsReciept);

// get single Shop Rent  BY Date
router.get("/api/rentbydate/:sabhaid/:payyear/:paymonth/:cusnic/:placeid/:shopid", showRentsByDATE);

// create Shop Rent
router.post("/api/shoprents", createshopRents);

// update Shop Rent 
// router.put("/api/shoprents/:id", updateFood);

// delete Shop Rent
router.delete("/api/shoprents/:id", deleteshopRents);



////////////////////////// Shop Rent Temp////////////////////////////////
// get all Shop Rent Temp
router.get("/api/shoprentstemp", showshopRentsTemp);

// get single Shop Rent  Temp
router.get("/api/shoprentstemp/:cusnic", showshopRentsByIdTemp);

// create Shop Rent Temp
router.post("/api/shoprentstemp", createshopRentsTemp);

// update Shop Rent  Temp
// router.put("/api/shoprents/:id", updateFood);

// delete Shop Rent Temp
router.delete("/api/shoprentstemp/:id", deleteshopRentsTemp);


////////////////////////// OnlinePayment ////////////////////////////////

// get all payments
router.get("/api/onlinepayment/", allPayment);
// get  user payment
router.get("/api/onlinepayment/:nic", showAPayment);

// create payment
router.post("/api/onlinepayments/", createPayment);


////////////////////////// OnlinePaymentTEmp ////////////////////////////////

// get all payments
router.get("/api/onlinepaymenttemp/", allPaymentTemp);
// get  user payment
router.get("/api/onlinepaymenttemp/:nic", showAPaymentTemp);

// create payment
router.post("/api/onlinepaymenttemp/", createPaymentTemp);

router.delete("/api/onlinepaymenttemp/:id", deleteOnlineTemp);
////////////////////////// Email ////////////////////////////////

// // create Email
// router.post("/api/email/", sendMail);

////////////////////////// USER ////////////////////////////////
// get all user
router.get("/api/customersdata/", Users);
// get all user
router.get("/api/customersdata/:nic", AUser);

//// verify Password

router.get("/api/customerspass/:nic/:pass", VerifyPass);

// create account
router.post("/api/customersdata/", register);
// update User 
router.put("/api/customersupdate/:id", updateUser);

// update Password 
router.put("/api/passUpdate/:usernic", Passwordupdate);
////////////////////////// District////////////////////////////////
// get all district
router.get("/api/districts/", getAllDistrict);

//get single district
router.get("/api/districts/:pro", showDistrict);

//showSabhaOfProvince
router.get("/api/provofsabha/:provid", showSabhaOfProvince);
///////////////////////// Sabha////////////////////////////////
// get all Sabha
router.get("/api/Prasabha/", getAllprSabha);

//get single Sabha
router.get("/api/Prasabha/:dis_code", Sabha);

//get single Sabha
router.get("/api/PraSabhadata/:Sabha_code", showSabhaDetails);

////////////////////////// Province////////////////////////////////
// get all provice
router.get("/api/provinces/", AllProvince);

//get single district
// router.get("/api/provinces/:dist_province", showDistrict);


////////////////////////// EMPLOYEE ////////////////////////////////
// get all employees
router.get("/api/employee/", allUsers);

//get employees level>5 
router.get("/api/graterdanfive/:sbcode", UserByLevel);

// get employees for specific sabha
router.get("/api/sabhaemps/:id", sabhaEmployees);

////////////////////////// INCOME HEADS ////////////////////////////////
// get all income heads
// router.get("/api/income_heads/", allIncomeHeads);

//create income heads for sabha
// router.post("/api/sb_rates/", createHead);

//get rate_head_id s from sb_rates table to avoid duplicate

router.get("/api/sb_rates/:sbcode/:ratehead", showAHeadIds);

//subByNicOfSabha get rate geads of subjects of sabha
router.get("/api/subheads/:id/:sbcode", subByNicOfSabha);

//sabhaIheads
// router.get("/api/headsbysabha/:scode", sabhaIheads);
// router.get("/api/sabhaiheads/:id", );

//delete sabha heads
// router.delete("/api/deletarate/:sid/:rid/:vid", deleteRbySabha);
////////////////////////// USER ////////////////////////////////
// get all user
router.get("/api/employee/:emp_nic", showAUser);
// router.get("/api/employee/:emp_email", showAUser);

//with hash password VerifyPass
router.get("/api/hashpass/:enic/:epass", VerifyHashPass);
// create account
//router.post("/api/users/", createAccount);
router.post("/api/employee/", createAccount);

// update Profile 
router.put("/api/employee/:id", updateProfile);

// update Password 
router.put("/api/updatepasswrd/:passnic ", updatePass);

// update Status
router.put("/api/statchange/:levid", updateState);
//updateStatebySabha
router.put("/api/statchangeforsabha/:stat/:levid", updateStatebySabha);
////////////////////////// SABHA ////////////////////////////////
//get sabha
router.get("/api/pra_sabha/:sb_code", showSabha);

//update Sabha
router.put("/api/pra_sabha/:sb_code", updateSabha);

////////////////////////// CUSTOMER ////////////////////////////////
//get Customer
router.get("/api/customers/:cnic/:sbcode", showCustomer);

//Add Customer
router.post("/api/customers/", addCustomer);

//Add to Sabha_customers
router.post("/api/sbha_cutomers/", insertToSabhaCustomers);

//Get Sabha's all Income heads
// router.get("/api/sabharate/:id", sabhaIncomeHeads);


////////////////////////// Tempory Invoice ////////////////////////////////
// get all Receipt
router.get("/api/receipt", showReceipt);

// get single Receipt 
router.get("/api/receiptrow/:id", showReceiptById);

// create Receipt
router.post("/api/receipt", createReceipt);

// update Receipt 
router.put("/api/receipt/:id", updateReceipt);

// delete all Receipt
router.delete("/api/receipt/", deleteReceipt);
//Delete single receipt by id
router.delete("/api/singlerece/:id", deleteSingleReceipt);
//deleteTempInv
router.delete("/api/tempinv/:id", deleteTempInv);
////////////////////// Invoice /////////////////////
// create Invoice
router.post("/api/saveinvoice", createInvoice);

// get all Invoice
router.get("/api/invoice", showInvoice);

//insert to tempory_invoice_save table
router.post("/api/addtosave", addToSave);

//get invoice summery for date
router.get("/api/invoicesum/:sabha/:rdate", invoiceSumForDate);
////////////////////////// Sabha Rates ////////////////////////////////
router.get("/api/userlevels/:id", allLevels);

//get provices from province table
router.get("/api/allprovinces/", allProvinces);

////////////////////////// ONLINE PAYMENT ////////////////////////////////
// get all payments
router.get("/api/onlinepay/:id/:repotdate", allOnPayments);
router.post("/api/onlinepay/", addOnlinePay);


/////////////////////// Tempory assigned subjects ///////////////////
router.post("/api/temporyassign/", assignTempSubject);

//tempAssigns
router.get("/api/gettempasign/:id", tempAssigns);

//deleteSingleSub 
router.delete("/api/singlesubdelete/:id", deleteSingleSub);

 //asign subects
 router.post("/api/savesubs", createSubject);

 //delete all subs from temp table
 router.delete("/api/deletsubs/", deleteSubjects);
// export default router
//saved subjects of sabha
router.get("/api/savedsubs/:sid/:rsid", savedSubs);

//Delete assigned subject
router.delete("/api/deletasignsub/:aid", deleteAssignedSub);

//////////////////Bank Details ///////////////////
//insertbank to table
router.post("/api/savebank/", addBank);
//get acount numbers to check duplicates
router.get("/api/bankaccounts/:acc/", checkAccount);
//get all bank accounts by sabha
router.get("/api/sabhaaccounts/:id", sabhaAccounts);
//insertKey
router.post("/api/addseckey/", addKey);
//deleteAddedBAcc
router.delete("/api/deletaddacc/:bid", deleteAddedBAcc);
//Insert  MarketStreet
router.post("/api/marketstreet/", createmarketStreets);
//get all MarketStreet 
router.get("/api/marketstreet/", getAllmarketStreets);
//get MarketStreet by id
router.get("/api/marketstreetbyid/:sbCode/:msId", marketStreetsById);
//get MarketStreet by sabha
router.get("/api/marketstreet/:Sabha_code", marketStreetsBySbcode);


///////////////// Reports (tempory_invoice_save)/////////////////
router.get("/api/reportbyid/:psabha/:sbrateh/:repotdate", reportByHid);

////////////// Invoice IncomeHeads ////////////////////
//router.get("/api/shopdata/:taxeenic/:sbcode", ShopDetailsByNIC);
router.get("/api/dailyinvoiceheads/:sbcode/:invdate/:invnum/:rhead", invoiceHeadsForDate);
router.get("/api/dailyheads/:sbcode/:invdate/", headsForDate);

////////////////////// addMarketPlace //////////////////////////
//insert market place to table
router.post("/api/saveshop/", addShop);
//showShopsBySabha
router.get("/api/shopsosb/:id", showShopsBySabha);
//Delete Single Shop
router.delete("/api/deletshop/:id", deleteSingleShop);


////////////////////////// Invoice Number Generate ////////////////////////////////
// get  genaratenum
router.get("/api/genaratenum/", getInvNum);
// create genaratenum
router.post("/api/genaratenum/", InsertInvNum);
// update genaratenum 
router.put("/api/genaratenum/", updateInvNum);

////////////////////////sabha Invoice Num Gen //////////////////////////////////////
// get  genaratenum
// router.get("/api/sabhagenaratenum/", sabhagetInvNum);
router.get("/api/sabhagenaratenum/:sid", sabhagetInvNum);
// create genaratenum
router.post("/api/sabhagenaratenum/", sabhaInsertInvNum);
// update genaratenum 
router.put("/api/sabhagenaratenum/:sbid", sabhaupdateInvNum);

///////////////////////// new from Employeejs ///////////////////////////////////////////////
// router.get("/api/adminbyprov/:prov/:lev", adminsByProv);
//update user active inactive status
// router.put("/api/inactiveemp/:enic", setInactiveEmp);
//secretariesByProv
// router.get("/api/secrbypro/:pr", secretariesByProv);
// get details of sabha by province id

export default router;








