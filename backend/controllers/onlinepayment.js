// import functions from User model

import {
    getAllOnlinePayments,
    getPaymentsById,
    insertOnlinePayment
} from "../models/OnlinePaymentModel.js";

// get all Users
export const allPayment=(req,res)=>{
    getAllOnlinePayments((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single user
export const showAPayment = (req,res)=>{
    getPaymentsById(req.params.nic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create payment

export const createPayment=(req,res)=>{
    const onlinedata = req.body;
    insertOnlinePayment(onlinedata,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};



