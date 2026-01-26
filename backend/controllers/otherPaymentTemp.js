// import functions from Food model

import {
    // getshopRents,
    // getshopRentsById,
    // insertshopRents,
    // // updateFoodById,
    TempgetOtherPayments,
    TempgetOtherPaymentsById,
    TempOtherPaymentsAddDetails,
    TempdeleteOtherPayments,
    TempdeleteOtherPaymentsBynic,
   
} from "../models/OtherPaymentsTempModel.js";

// get all shopRents
export const showOtherPaymentsTemp=(req,res)=>{
    TempgetOtherPayments((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const getOtherPayByIdTemp=(req,res)=>{
    TempgetOtherPaymentsById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// insert details of online aasesment tx payments by subject
export const addOtherPaymentsTemp=(req,res)=>{
    const data = req.body;
    TempOtherPaymentsAddDetails(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//delete from  table 
export const deleteOtherPayTemp=(req,res)=>{
    const id = req.params.id;
    TempdeleteOtherPayments(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//delete from tempory table by nic
export const deleteOtherPayByNicTemp=(req,res)=>{
    const id = req.params.id;
    TempdeleteOtherPaymentsBynic(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};