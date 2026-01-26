// import express 
import express from "express";

import { 
    showSavedInvoice
} from  "../controllers/invoiceView.js";
import { 
    allPrograms,
    allProgramHeads,
    revenueType,
    createVoteNew,
    allNewVotesdata,
    deleteVotes,
    allNewVotes
} from  "../controllers/incomeheads.js";
import { 
    allservices,
    addOnlineServices,
   
} from  "../controllers/onlineServices.js";
import {
    deleteEmpBySabha,
    allProvinceAdmins,
    adminsByProv,
    setInactiveEmp,
    secretariesByProv
} from "../controllers/employee.js";


import {
    showAssessmentTaxByIdTemp,
    createAssessmentTaxTemp,
    showAssessmentTaxTemp,
    deleteAssessmentTaxTemp
} from "../controllers/assessmentTaxTemp.js";

import {
    showAssessmentTaxById,
    showAssessmentTaxReciept,
    showAssessmentTax,
    showAssessmentTaxBySabha,
    assesmentByInvoicenum,
    addAsTaxDetails,
    createInvoiceAsses,
    updateAssesPrint,
    saveAddAsTaxDetails,
    deleteTempInvoiceByIn,
    
} from "../controllers/assessmentTax.js";

import {
    showAprovince
} from "../controllers/province.js";

import {
    showGullyReqest,
    showGullyReqestById,
    addGullyReqestDetails,
    GullyReqestUp,
    showGullyReqestBygId,
    GullyReqestdelete,
    onlineServiceHeadsofEmp,
    UpdateBookingAmount,
    UpdateBookingFeedback
    
} from "../controllers/gullyBowser.js";
import {
    showOnBookingReqest,
    showOnBookingReqestById,
    addOnBookingReqestDetails,
    OnBookingReqestUp,
    showOnBookingReqestBygId,
    OnBookingReqestdelete,
    showReqestByType
    
} from "../controllers/onlineBooking.js";

import{
    showOnlineServices,
    saveServicesOfSabha,
    deleteSabhaServiceById,
    servicesBySabhanType,

}from "../controllers/sabhaOnlineServices.js";
import{
    deleteMarktstreet,
    deleteSabaShopPlaceAll
}from "../controllers/marketStreet.js"

import{
    deleteShopsbyMarketPlace,
    deleteFromShopPlaceByID,
    UpdateShopArrearsOnly,
    oneMonthArrears,
    twoMonthArrears,
    threeMonthArrears
}from "../controllers/shopdetails.js"

import{
    SabhaRefNum,
    UpdateRefNumbySabha
}from "../controllers/referenceNum.js"

import{
    getCustomersOfSabha,
    getCustomersById,
    UpdateCustomerDetail,
    UpdateCustomerConta
} from "../controllers/sabhacustomer.js"

import {
    cancelInvoiceState,
    temSaveCancelInvoice,
    shroffInvoiceSumForDate,
    cancleInvoiceById,
    cancelledInvoiiceBySabha
} from "../controllers/invoice.js"

// import{
//     Bocpaysession,
//     Successpayment,
//     Cancelpayment
// } from "../controllers/paymentControllerBoc.js"
import {
    getTodayReportOneSub,
    monthlyVoteBySub,
    subVoteByMonth,
    allVoteByMonth,
    reportByDateRange
}from "../controllers/summery.js"

import {
    showOtherPayments,
    getOtherPayById,
    addOtherPayments,
    deleteOtherPay,
    deleteOtherPayByNic
}from "../controllers/otherPayments.js"
import {
    showOtherPaymentsTemp,
    getOtherPayByIdTemp,
    addOtherPaymentsTemp,
    deleteOtherPayTemp,
    deleteOtherPayByNicTemp
}from "../controllers/otherPaymentTemp.js"
import {
    ProvinceIncome,
    sabhaInfoByProvince,
    IncomeBysabhaHead,
    IncomeBysabha,
    prosecretaries,
    proemployees,
    monthlyincomeByProvince,
    monthlyTotalincomeByProvince
}from "../controllers/monistry.js"
import {
    insertTemporaryKeep,
    showPivBySubId,
    showReceiptByIdnSabha,
    viewSubjectPivList
}from "../controllers/temporyinvoice.js"
import{
    onlineSumForDate,
    onlineHeadsForDate,
    onlineVotesForDate,
    GenOnlineInvoice
}from "../controllers/onlinepay.js"
import{
    empUpdatePass,
    updateEmpForAdmin
}from "../controllers/employee.js"
import {
    getInvNum2,
    InsertInvNum2,
    updateInvNum2,
   
} from "../controllers/onlineInvnumGen.js";
import{
    allVotesOfSabha,
    SumofDay,
    SumofDayByVote,
    getprogBySabha,
    getAllprogHeadsBySabha,
    getprogincome,
    getsumOfHead,
    SbHeadsByprogHead,
    getEstIncom,
    getsumBetweenMonth,
    getprogincomeAnnually,
    incomeSummary,
    ProgramDetails,
    SbHeadsByprog,
    getEstIncomByProg
}from "../controllers/monthlyReport.js";
import {
    addData
}from "../controllers/est.js";
import {
    AUsersabha,
    registerusersabha,
    Deleteusersabha
}from "../controllers/customer.js";


/////////////////////////////////////////

import{
    EXPallVotesOfSabha,
    EXPSumofDay,
    EXPSumofDayByVote,
    EXPgetprogBySabha,
    EXPgetAllprogHeadsBySabha,
    EXPgetprogincome,
    EXPgetsumOfHead,
    EXPSbHeadsByprogHead,
    EXPgetEstIncom,
    EXPgetsumBetweenMonth,
    EXPgetprogincomeAnnually,
    EXPincomeSummary,
    EXPProgramDetails,
    EXPSbHeadsByprog,
    EXPgetEstIncomByProg,
    EXPmoneygetsumOfHead,
    EXPcrossgetsumOfHead,
    EXPmoneygetsumOfHeadPreMonth,
    EXPcrossgetsumOfHeadPreMonth,
}from "../controllers/expenceReports.js";

///////////////////////////////////

const newrouter = express.Router();

newrouter.get("/api/invoicesaved/:sabha/:invonum", showSavedInvoice);

newrouter.get("/api/allprogs/", allPrograms);

newrouter.get("/api/allprogheads/", allProgramHeads);

newrouter.get("/api/revtype/:rty", revenueType);

newrouter.post("/api/savevote/", createVoteNew);

newrouter.get("/api/allnewvotes/:sbcode", allNewVotes);
newrouter.get("/api/allvotes/:sbcode", allNewVotesdata);

newrouter.delete("/api/deletevotenw/:id", deleteVotes);

/////////Online Srvices////////////////
newrouter.post("/api/addservices/", addOnlineServices);

newrouter.get("/api/onlineservise/:sabhaid", allservices);

///////////////// Employee /////////////////////////////
newrouter.delete("/api/deleteemp/:eid", deleteEmpBySabha);
newrouter.get("/api/allprovadminsfr/:levl", allProvinceAdmins);

////////////Assement Tax ///////////////////////////////
newrouter.post("/api/assessmenttaxtemp/", createAssessmentTaxTemp);

newrouter.get("/api/assessmenttaxtemp/:cusnic", showAssessmentTaxByIdTemp);
newrouter.delete("/api/deletetasstempbynic/:id",deleteAssessmentTaxTemp);
newrouter.get("/api/assessmenttaxtemp/", showAssessmentTaxTemp);
newrouter.get("/api/assesbyinvid/:inv", assesmentByInvoicenum);
newrouter.post("/api/astaxdet/", addAsTaxDetails);
newrouter.get("/api/assesinvoiced/:invnum", createInvoiceAsses);
newrouter.put("/api/isprintup/:prin", updateAssesPrint);
newrouter.post("/api/astaxdetsave/", saveAddAsTaxDetails);
newrouter.delete("/api/deletetempinv/:id", deleteTempInvoiceByIn);
////////////Assement Tax ///////////////////////////////
newrouter.get("/api/assessmenttax/", showAssessmentTax);

newrouter.get("/api/taxreceipt/:receipt/:taxnic",showAssessmentTaxReciept );
newrouter.get("/api/assessmenttax/:id", showAssessmentTaxById);

newrouter.get("/api/assestaxbysabha/:sid/:cdate", showAssessmentTaxBySabha);
/////////////////////// Province ////////////////////////////////
newrouter.get("/api/probyid/:provid", showAprovince);

////////////Gully bowser Request ///////////////////////////////
newrouter.post("/api/gullyrequests/", addGullyReqestDetails);

newrouter.get("/api/gullyrequest/:id/", showGullyReqestById);
newrouter.get("/api/gullyrequestgid/:gid/", showGullyReqestBygId);
newrouter.put("/api/gullyrequestupda/:gid", GullyReqestUp);
newrouter.get("/api/allgully/:sbcode/:stype", showGullyReqest);
newrouter.delete("/api/deletegullyreq/:delid", GullyReqestdelete);
newrouter.get("/api/onlserviceheads/:nic/:scode", onlineServiceHeadsofEmp);
newrouter.put("/api/updamount/:gid", UpdateBookingAmount);
newrouter.put("/api/updfeedb/:obid", UpdateBookingFeedback);
//////////////////// Online Services ///////////////////////////////////

newrouter.get("/api/loadservices/:scode", showOnlineServices);
newrouter.post("/api/savesabhaserv/", saveServicesOfSabha);
newrouter.delete("/api/deletesabserv/:srid", deleteSabhaServiceById);
newrouter.get("/api/checkservice/:saba/:vote/:ty/:sname", servicesBySabhanType);

////////////online_booking Request ///////////////////////////////
newrouter.post("/api/onbookingrequests/", addOnBookingReqestDetails);

newrouter.get("/api/onbookingrequest/:id/", showOnBookingReqestById);
newrouter.get("/api/onbookingrequestgid/:gid/", showOnBookingReqestBygId);
newrouter.get("/api/requestbystype/:nic/:stype", showReqestByType);
newrouter.put("/api/onbookingrequestupdate/:gid", OnBookingReqestUp);
newrouter.get("/api/allonbooking/:sbcode", showOnBookingReqest);
newrouter.delete("/api/deletereq/:delid", OnBookingReqestdelete);

///////////////////// market place delete///////////////////////////

newrouter.delete("/api/delmarkstreet/:msid", deleteMarktstreet);
newrouter.delete("/api/delshopbymarkstreet/:splace", deleteShopsbyMarketPlace);
newrouter.delete("/api/delsabhashopplace/:msidp", deleteSabaShopPlaceAll);

newrouter.delete("/api/deleteboth/:splace/:snum/:ssabha", deleteFromShopPlaceByID);
newrouter.put("/api/uparr/:shopid", UpdateShopArrearsOnly);
//Shop Arrears 
newrouter.get("/api/arrearsone/:sabhaid", oneMonthArrears);
newrouter.get("/api/arrearstwo/:sabha", twoMonthArrears);
newrouter.get("/api/arrearsthre/:sb", threeMonthArrears);

/////////////////////// Reference number ///////////////////////////////////

newrouter.get("/api/getrefnumber/:refsabha", SabhaRefNum);
newrouter.put("/api/uprefnum/:sbid", UpdateRefNumbySabha);

///////////////////////// Sabha Customers ////////////////////////
newrouter.get("/api/allcusofsabha/:sbcode", getCustomersOfSabha);

newrouter.get("/api/cusbyid/:cid", getCustomersById);

newrouter.put("/api/upcustdetail/:id", UpdateCustomerDetail);

newrouter.put("/api/upcustcon/:id", UpdateCustomerConta);

////////////////////////// Invoice ////////////////////////

newrouter.put("/api/canclinvoi/:invid", cancelInvoiceState);

newrouter.put("/api/canceltempsaveinvoice/:invoid", temSaveCancelInvoice);


/////////////////////// Summary /////////////////////

newrouter.get("/api/reportallday/:psabha/:repotdate/:subnic", getTodayReportOneSub);

newrouter.get("/api/monvoterepo/:psabha/:remon/:reyr/:subnic", monthlyVoteBySub);
newrouter.get("/api/voterepobymon/:psabha/:vot/:remon/:reyr/:subnic", subVoteByMonth);
newrouter.get("/api/allvotemon/:psabha/:vot/:remon/:reyr", allVoteByMonth);
newrouter.get("/api/reporange/:psabha/:svote/:dfrom/:dto", reportByDateRange);

///////////////////Other Payments///////////////////////////////
newrouter.get("/api/otherpayments/:cus/:inv", showOtherPayments);
newrouter.get("/api/otherpaymentsbynic/:id", getOtherPayById);
newrouter.post("/api/otherpayments/", addOtherPayments);
newrouter.delete("/api/delotherpayments/:id", deleteOtherPay);
newrouter.delete("/api/delotherpaybynic/:id", deleteOtherPayByNic);

///////////////////Other PaymentsTemp///////////////////////////////
newrouter.get("/api/allotherpaymentstemp/", showOtherPaymentsTemp);
newrouter.get("/api/otherpaymentsbyidtemp/:id", getOtherPayByIdTemp);
newrouter.post("/api/otherpaymentstemp/", addOtherPaymentsTemp);
newrouter.delete("/api/delotherpaymentstemp/:id", deleteOtherPayTemp);
newrouter.delete("/api/delotherpaybynictemp/:id", deleteOtherPayByNicTemp);


//////////////////////////Ministry details/////////////////////
newrouter.get("/api/proincome/:province", ProvinceIncome);

newrouter.get("/api/prodata/:proid", sabhaInfoByProvince);
newrouter.get("/api/secretaries/:pro", prosecretaries);
newrouter.get("/api/proemplyees/:pro", proemployees);
newrouter.get("/api/proincomemonthly/:proid/:repyear/:repmonth", monthlyincomeByProvince);
newrouter.get("/api/prototalincomemonthly/:province/:repyear/:repmonth", monthlyTotalincomeByProvince);



///////////////////////// Employee //////////////////////////
newrouter.get("/api/adminbyprov/:prov/:lev", adminsByProv);
//update user active inactive status
newrouter.put("/api/inactiveemp/:enic", setInactiveEmp);
//secretariesByProv
newrouter.get("/api/secrbypro/:pr", secretariesByProv);

//secretariesByincome head
newrouter.get("/api/incmobyvote/:sabha", IncomeBysabhaHead);

newrouter.get("/api/sabha_income/:sabaid", IncomeBysabha);

//////////////////////tempory invoice (keep)/////////////
newrouter.post("/api/tempkeep/", insertTemporaryKeep);
newrouter.get("/api/pivbyidrow/:id/:subid", showPivBySubId);

////////////////////// onlinepay ////////////////// 
newrouter.get("/api/onlinesum/:sabha/:rdate", onlineSumForDate);

newrouter.get("/api/onlindailyheads/:sbcode/:invdate/", onlineHeadsForDate);
newrouter.get("/api/dailyonvoteheads/:sbcode/:invdate/:invnum/:rhead", onlineVotesForDate);
newrouter.get("/api/onlineinvocr/:sabha/:innum", GenOnlineInvoice);
///////////////////// employee //////////////////////
//update password
newrouter.put("/api/empuppass/:employnic", empUpdatePass);
newrouter.put("/api/adminupemp/:id", updateEmpForAdmin);

////////////////////
////////////////////////// Invoice Number Generate by Sabha ////////////////////////////////
// get  genaratenum
newrouter.get("/api/genarateinvonline/:sabha", getInvNum2);
// create genaratenum
newrouter.post("/api/genarateinvonline/", InsertInvNum2);
// update genaratenum 
newrouter.put("/api/updateinvonline/:sabha", updateInvNum2);

///////////////////////////////invoice /////////////////////
newrouter.get("/api/shroffsumdate/:sabha/:rdate/:sid", shroffInvoiceSumForDate);

newrouter.get("/api/receiptrownw/:id/:scode", showReceiptByIdnSabha);
newrouter.post("/api/canclewthreason/", cancleInvoiceById);
newrouter.get("/api/cancelledlist/:psabha/:dtfrom/:dtto", cancelledInvoiiceBySabha);
//////////////////////////// LG 04 - monthlyreport///////////////////////////
newrouter.get("/api/sbvotes/:sabha", allVotesOfSabha);
newrouter.get("/api/sumofday/:sabha/:tod", SumofDay);
newrouter.get("/api/sumofdayvote/:sabha/:tod/:vote", SumofDayByVote);

////////////////LG 05 - monthlyreport//////////////////////////
newrouter.get("/api/sbprog/:sabha", getprogBySabha);
newrouter.get("/api/allproghead/", getAllprogHeadsBySabha);
newrouter.get("/api/progincome/:sabha/:prog/:sbhead/:selyear/:selmon", getprogincome);
newrouter.get("/api/sumofhead/:sabha/:sbhead/:selyear/:selmon", getsumOfHead);
newrouter.get("/api/sbheadsbyproghead/:sabha/:proghead/", SbHeadsByprogHead);
newrouter.get("/api/estincome/:sabha/:head/:year", getEstIncom);
newrouter.get("/api/sumbetweenmonth/:sabha/:sbhead/:selyear/:selmon", getsumBetweenMonth);
newrouter.get("/api/annualprogincome/:sabha/:prog/:sbhead/:selyear/", getprogincomeAnnually);
newrouter.get("/api/incomesummary/:sabha/:prog/:sbhead/:selyear/", incomeSummary);
newrouter.get("/api/progdetails/:id", ProgramDetails);
newrouter.get("/api/sbheadsbyprog/:sabha/:proghead/:prog/", SbHeadsByprog);
newrouter.get("/api/estiprog/:sabha/:head/:year/:prog/", getEstIncomByProg);

//////////////////////// Tempory invoice //////////////////////////getEstIncomByProg

newrouter.get("/api/ownpiv/:subid/:saba", viewSubjectPivList);

/////////////////////// Estimation  /////////////////////

newrouter.post("/api/saveest/", addData);
////////////////////// customer sbaha//////////////////
newrouter.get("/api/customersabha/:nic", AUsersabha);
newrouter.post("/api/addcustomersabha/", registerusersabha);
newrouter.delete("/api/deletecussabha/:sabha", Deleteusersabha);


/////////////////////////Expense Reprts/////////////////////////


//////////////////////////// LG 04 - monthlyreport///////////////////////////
newrouter.get("/api/expsbvotes/:sabha", EXPallVotesOfSabha);
newrouter.get("/api/expsumofday/:sabha/:tod", EXPSumofDay);
newrouter.get("/api/expsumofdayvote/:sabha/:tod/:vote", EXPSumofDayByVote);

////////////////LG 05 - monthlyExpensesreport//////////////////////////

newrouter.get("/api/expsbprog/:sabha", EXPgetprogBySabha);
newrouter.get("/api/expallproghead/", EXPgetAllprogHeadsBySabha);
newrouter.get("/api/expprogincome/:sabha/:prog/:sbhead/:selyear/:selmon", EXPgetprogincome);
newrouter.get("/api/expsumofhead/:sabha/:sbhead/:selyear/:selmon", EXPgetsumOfHead);
newrouter.get("/api/expsbheadsbyproghead/:sabha/:proghead/", EXPSbHeadsByprogHead);
newrouter.get("/api/expestincome/:sabha/:head/:year", EXPgetEstIncom);
newrouter.get("/api/expsumbetweenmonth/:sabha/:sbhead/:selyear/:selmon", EXPgetsumBetweenMonth);
newrouter.get("/api/expannualprogincome/:sabha/:prog/:sbhead/:selyear/", EXPgetprogincomeAnnually);
newrouter.get("/api/expincomesummary/:sabha/:prog/:sbhead/:selyear/", EXPincomeSummary);
newrouter.get("/api/expprogdetails/:id", EXPProgramDetails);
newrouter.get("/api/expsbheadsbyprog/:sabha/:proghead/:prog/", EXPSbHeadsByprog);
newrouter.get("/api/expestiprog/:sabha/:head/:year/:prog/", EXPgetEstIncomByProg);

newrouter.get("/api/expmoneysumofhead/:sabha/:sbhead/:selyear/:selmon", EXPmoneygetsumOfHead);
newrouter.get("/api/expcrosssumofhead/:sabha/:sbhead/:selyear/:selmon", EXPcrossgetsumOfHead);
newrouter.get("/api/exppremonthmoneysumofhead/:sabha/:sbhead/:selyear/:selmon", EXPmoneygetsumOfHeadPreMonth);
newrouter.get("/api/exppremonthcrosssumofhead/:sabha/:sbhead/:selyear/:selmon", EXPcrossgetsumOfHeadPreMonth);


export default newrouter;