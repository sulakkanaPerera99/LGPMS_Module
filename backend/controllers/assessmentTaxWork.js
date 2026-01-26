// import functions from Food model

import {
    // getshopRents,
    // getshopRentsById,
    // insertshopRents,
    // // updateFoodById,
    getAssessmentTax,
    getAssessmentTaxById,
    getAssessmentTaxReceipt,
    getAssessmentTaxBySabha,
    getAssesByInvoice,
    asTaxAddDetails,
    CreateInvoiceforAsses,
    updateAsPrint,
    saveAsTaxAddDetails,
    deleteTempInvbyNumber
} from "../models/AssessmentTaxModel.js";

// get all shopRents
export const showAssessmentTax=(req,res)=>{
    getAssessmentTax((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const showAssessmentTaxById=(req,res)=>{
    getAssessmentTaxById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single shopRents
export const showAssessmentTaxReciept=(req,res)=>{
    getAssessmentTaxReceipt(req.params.receipt,req.params.taxnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get single shopRents
export const showAssessmentTaxBySabha=(req,res)=>{
    getAssessmentTaxBySabha(req.params.sid,req.params.cdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get recrd by invoice number
export const assesmentByInvoicenum=(req,res)=>{
    getAssesByInvoice(req.params.inv,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// insert details of online aasesment tx payments by subject
export const addAsTaxDetails=(req,res)=>{
    const data = req.body;
    asTaxAddDetails(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// insert details of online aasesment tx payments when print invoice
export const saveAddAsTaxDetails=(req,res)=>{
    const data = req.body;
    saveAsTaxAddDetails(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create invoice
export const createInvoiceAsses= (req,res)=>{
    const invnum = req.params.invnum;
    CreateInvoiceforAsses(invnum,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update assesment tax table print column
export const updateAssesPrint=(req,res)=>{
    const data = req.body;
    const prin = req.params.prin;
    updateAsPrint(data,prin,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete from tempory table when print
export const deleteTempInvoiceByIn=(req,res)=>{
    const id = req.params.id;
    deleteTempInvbyNumber(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create shopRents
// export const createshopRents=(req,res)=>{
//     const data = req.body;
//     insertshopRents(data,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };

// get single shopRents by DATE 
// export const showRentsByDATE=(req,res)=>{
//     const sabhaid = req.params.sabhaid;
//     const payyear = req.params.payyear;
//     const paymonth = req.params.paymonth;
//     const cusnic = req.params.cusnic;
//     const placeid = req.params.placeid;
//     const shopid = req.params.shopid;
//     getshopRentsByDate(sabhaid,payyear,paymonth,cusnic,placeid,shopid,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };

// // update Food
// export const updateFood=(req,res)=>{
//     const data = req.body;
//     const id = req.params.id;
//     updateFoodById(data,id,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };


// delete shopRents
// export const deleteshopRents=(req,res)=>{
//     const id = req.params.id;
//     deleteshopRentsById(id,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };