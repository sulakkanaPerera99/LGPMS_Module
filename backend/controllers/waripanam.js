import {
    insertWards,
    getSabhaWards,
    insertStreet,
    getSabhaStreets,
    getMainCat,
    insertSubCat,
    getSubCatBySabha,
    getStreetsById,
    UpdateStreetName,
    UpdateSubCategory,
    getSubCatById,
    inserRate,
    getSabhaRateval,
    getCountBySabha,
    insertProperty,
    getSabhaProperties,
    insertOwner,
    getPropOwners,
    getSingleOwner,
    checkProperyExist,
    insertToTransfer,
    UpdateEndDate,
    updateOwnerInTransfer,
    getPropertyTransferById,
    insertQuarterPay,
    checkPaymentExist,
    getAllQuarterPayAmounts,
    getAllPropertybyCatList,
    getPropertyById,
    getPropertyOwnerById,
    UpdateRateByCategoryValues,
    getPaymentsByQuarter,
    getProPaymentsByQuarter,
    getRateByCategoty,
    deletePivByPropId,
    getLastArrears,
    insertPayTemp,
    getasspayTemp,
    insertPay,
    tempQuaterPaydelete,
    updatearrears,
    inserexcess,
    excessdelete,
    getexcessdata,
    getpaymentdata,
    gettotalESTAssincomeBYward,inserarrears,
    arrearsdelete,
    getarrearsdata,
    getProPaymentshis,
    updatePropData,
    assessPaydelete,
    getWarrantCostCatList,
    insertAssessReceipttemp,
    insertAssessReceipt,
    getAssesReceipt,
    insertAssessReceiptBillTemp,
insertAssessReceiptBill,
getAllPropertybyward,
getAllPropertybystreet,
getAllPropertybystreetside,
getPropertyOwnerBysabha,
getPropertyOwner

} from "../models/WaripanamModel.js";

// create ward
export const addWard=(req,res)=>{
    const data = req.body;
    insertWards(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//get wards by sabha
export const wardsBySabha =(req,res)=>{
    getSabhaWards(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//create street recoed
export const addStreet=(req,res)=>{
    const data = req.body;
    insertStreet(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get streets by sabha
export const streetsBySabha =(req,res)=>{
    getSabhaStreets(req.params.sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get categories(cat1) for all sabha
export const mainCategories=(req,res)=>{
    getMainCat((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
    
};
//save sub categories to asses_sub_category
export const addSubCat=(req,res)=>{
    const data = req.body;
    insertSubCat(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get all sub categories of sabha
export const subCatBySabha =(req,res)=>{
    getSubCatBySabha(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get streets by id 
export const streetById =(req,res)=>{
    getStreetsById(req.params.sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update strret name updatePropData
export const updateStreetData=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    UpdateStreetName(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update sub category name
export const updateSubCatData=(req,res)=>{
    const data = req.body;
    const sid = req.params.sid;
    UpdateSubCategory(data,sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get sub category by id 
export const subCategoryById =(req,res)=>{
    getSubCatById(req.params.subid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create rate
export const addRate=(req,res)=>{
    const data = req.body;
    inserRate(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get rates by sabha
export const sabhaRateValues =(req,res)=>{
    getSabhaRateval(req.params.rid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
 //get row count for a sabha
export const rowCountBySabha =(req,res)=>{
    getCountBySabha(req.params.cid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create propertyy
export const addProperty=(req,res)=>{
    const data = req.body;
    insertProperty(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get properties by sabha
export const propertiesOfSabha =(req,res)=>{
    getSabhaProperties(req.params.pid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//save property owner
export const addOwner=(req,res)=>{
    const data = req.body;
    insertOwner(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get property owners details of sabha
export const propOwnersOfSabha =(req,res)=>{
    getPropOwners(req.params.pid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get a single property owner for edit
export const ownerById =(req,res)=>{
    getSingleOwner(req.params.oid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//check if property already exists
export const ProperyExist =(req,res)=>{
    checkProperyExist(req.params.pid,req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get a single property owner for edit
export const addToTransfer=(req,res)=>{
    const data = req.body;
    insertToTransfer(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update end_date in asses_property_transfer tableUpdateEndDate
export const updateProOwnerEnddate=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    UpdateEndDate(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update assess_owners when transferring property
export const updateNewOwner=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateOwnerInTransfer(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get property transfer by sabha and property id
export const propertyTransferById =(req,res)=>{
    getPropertyTransferById(req.params.pid,req.params.sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//save quarter payments
export const addQuarterPayments=(req,res)=>{
    const data = req.body;
    insertQuarterPay(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//check if payments already exists
export const PaymentDetailsExist =(req,res)=>{
    checkPaymentExist(req.params.pid,req.params.sb,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get all quarterpayment amounts
export const allQuarterPayAmounts =(req,res)=>{
    getAllQuarterPayAmounts(req.params.sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//select properties by 3 categorieswarrantcostByCatList
export const propertyByCatList=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    const stid = req.params.stid;
    const ctid = req.params.ctid;
    getAllPropertybyCatList(sid,wid,stid,ctid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//select properties by ward
export const propertyByward=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    getAllPropertybyward(sid,wid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//select properties by 3 street
export const propertyBystreet=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    const stid = req.params.stid;
   
    getAllPropertybystreet(sid,wid,stid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//select properties by 3 street
export const propertyBystreetside=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    const stid = req.params.stid;
    const side = req.params.side;
   
    getAllPropertybystreetside(sid,wid,stid,side,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//get warrantcostByCatList
export const warrantcostByCatList=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    const stid = req.params.stid;
    const ctid = req.params.ctid;
    getWarrantCostCatList(sid,wid,stid,ctid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get property by id and sabha
export const sabhaPropertyByID=(req,res)=>{
    const sid = req.params.sid;
    const pid = req.params.pid;
    getPropertyById(sid,pid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get property owners details by propid and sabha
export const propertyOwnerByID=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
    getPropertyOwnerById(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//get property owners details by propid and sabha
export const propertyOwners=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
    getPropertyOwner(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get property owners details by d sabha
export const propertyOwnerBySabha=(req,res)=>{
    const sbid = req.params.sbid;
    // const sabha = req.params.sabha;
    getPropertyOwnerBysabha(sbid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update rate for all the properties in this ward,street,category
export const updatePropertyRateByMany=(req,res)=>{
    const data = req.body;
    const wid = req.params.wid;
    const sid = req.params.sid;
    const cid = req.params.cid;
    const sabha = req.params.sabha
    UpdateRateByCategoryValues(data,wid,sid,cid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get quarter wise payments made for a property
export const paymentsByQuarter=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
    const qnum = req.params.qnum;
    getPaymentsByQuarter(propid,sabha,qnum,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// quartetwise payments for property for year getting from the view
export const paymentsByQuarterView=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
    const qnum = req.params.qnum;
    const yr = req.params.yr;
    getProPaymentsByQuarter(propid,sabha,qnum,yr,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get rate by category ward and street
export const rateByCategory=(req,res)=>{
    const sid = req.params.sid;
    const wid = req.params.wid;
    const stid = req.params.stid;
    const ctid = req.params.ctid;
    getRateByCategoty(sid,wid,stid,ctid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// delete all piv from temporary invoice table by specific propertyid
export const deleteAllPivByProperty=(req,res)=>{
    const id = req.params.id;
    deletePivByPropId(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//check for last year arrears
export const lastYearArrears=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
    const qnum = req.params.qnum;
    const yr = req.params.yr;
    getLastArrears(propid,sabha,qnum,yr,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//save ass payments temp
export const addpaymentTemp=(req,res)=>{
    const data = req.body;
    insertPayTemp(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


//save ass payments t
export const addpayment=(req,res)=>{
    const data = req.body;
    insertPay(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};//getasspayTemp

//get ass payemnt temp
export const getasspayTempData=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
   
    getasspayTemp(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// delete all piv from temporary invoice table by specific propertyid
export const deletetempQuaterPay=(req,res)=>{
    const pid = req.params.pid;
    const sabha=req.params.sabha;
    tempQuaterPaydelete(pid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// delete all piv from temporary invoice table by specific propertyid
export const deleteAssessPay=(req,res)=>{
    const invno = req.params.invno;
    // const sabha=req.params.sabha;
    assessPaydelete(invno,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


//update arrears
export const updateArrers=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    const sabha = req.params.sabha
    updatearrears(data,id,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create excess
export const addexcess=(req,res)=>{
    const data = req.body;
    inserexcess(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// delete all excess specific propertyid
export const deleteexcess=(req,res)=>{
    const pid = req.params.pid;
    const sabha=req.params.sabha;
    excessdelete(pid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get excess update temp
export const excessdata=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
   
    getexcessdata(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create arrears
export const addarrears=(req,res)=>{
    const data = req.body;
    inserarrears(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// delete all arrears specific propertyid
export const deletearrears=(req,res)=>{
    const pid = req.params.pid;
    const sabha=req.params.sabha;
    arrearsdelete(pid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get arrears update temp
export const arrearsdata=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;
   
    getarrearsdata(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


//get assesement payemnt view temp
export const payemntbyward=(req,res)=>{
    const seldate = req.params.seldate;
    const sabha = req.params.sabha;
   
    getpaymentdata(seldate,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//////////gettotalESTAssincomeBYward
export const ESTincomebyward=(req,res)=>{
    const ward = req.params.ward;
    const sabha = req.params.sabha;
   
    gettotalESTAssincomeBYward(ward,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//  payments history for property 
export const paymentsHistory=(req,res)=>{
    const propid = req.params.propid;
    const sabha = req.params.sabha;

    getProPaymentshis(propid,sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//update Property
export const PropDataUpdate=(req,res)=>{
    const data = req.body;
    const proid = req.params.proid;
    updatePropData(data,proid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};



//////////////////////////////////////////////online system /////////////////////////////////////////////////////////////////////


export const createAssesseReceipttemp=(req,res)=>{
    const data = req.body;
    insertAssessReceipttemp(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const createAssesseReceipt=(req,res)=>{
    const data = req.body;
    insertAssessReceipt(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const getReceiptAssess=(req,res)=>{

    const propid = req.params.propid;
    const receipt = req.params.receipt;
    getAssesReceipt(receipt,propid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const createAssesseReceiptBill=(req,res)=>{
    const data = req.body;
    insertAssessReceiptBill(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const createAssesseReceiptBillTemp=(req,res)=>{
    const data = req.body;
    insertAssessReceiptBillTemp(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

