// import functions from Food model

import {
    // getshopRents,
    // getshopRentsById,
    // insertshopRents,
    // // updateFoodById,
    getOtherPayments,
    getOtherPaymentsById,
    OtherPaymentsAddDetails,
    deleteOtherPayments,
    deleteOtherPaymentsBynic,
   
} from "../models/OtherPaymentsModel.js";

// get all shopRents
export const showOtherPayments=(req,res)=>{
    getOtherPayments(req.params.cus,req.params.inv,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single shopRents
export const getOtherPayById=(req,res)=>{
    getOtherPaymentsById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// insert details of online aasesment tx payments by subject
export const addOtherPayments=(req,res)=>{
    const data = req.body;
    OtherPaymentsAddDetails(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//delete from  table 
export const deleteOtherPay=(req,res)=>{
    const id = req.params.id;
    deleteOtherPayments(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//delete from tempory table by nic
export const deleteOtherPayByNic=(req,res)=>{
    const id = req.params.id;
    deleteOtherPaymentsBynic(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};