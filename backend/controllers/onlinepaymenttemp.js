// import functions from User model

import {
    getAllOnlinePaymentsTemp,
    getPaymentsByIdTemp,
    insertOnlinePaymentTemp,
    deleteOnlinePayTemp
} from "../models/OnlinePaymentTempModel.js";

// get all Users
export const allPaymentTemp=(req,res)=>{
    getAllOnlinePaymentsTemp((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single user
export const showAPaymentTemp = (req,res)=>{
    getPaymentsByIdTemp(req.params.nic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create payment
export const createPaymentTemp=(req,res)=>{
    const data = req.body;
    insertOnlinePaymentTemp(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// delete online pay
export const deleteOnlineTemp=(req,res)=>{
    const id = req.params.id;
    deleteOnlinePayTemp(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

