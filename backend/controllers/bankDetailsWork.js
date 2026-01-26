// import functions from User model

import {
    insertBank,
    getAccount,
    getSabhaAccounts,
    insertKey,
    deleteAddedAcc
} from "../models/BankDetailsModel.js";

// create user
export const addBank=(req,res)=>{
    const data = req.body;
    insertBank(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get bank account number to check duplicates
export const checkAccount = (req,res)=>{
    getAccount(req.params.acc,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get bank accounts by sabha
export const sabhaAccounts =(req,res)=>{
    getSabhaAccounts(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// insert secret key
export const addKey=(req,res)=>{
    const data = req.body;
    insertKey(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Delete assign subs
export const deleteAddedBAcc=(req,res)=>{
    const bid = req.params.bid;
    deleteAddedAcc(bid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};