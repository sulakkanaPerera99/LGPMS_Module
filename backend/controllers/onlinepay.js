// import functions from OnlinePaymodel

import {
    getOnlinePayments,
    InsertData,
    getOnlineSumByDate,
    getOnlineHeadsforDay,
    getHeadsOnline,
    genSabhaInvoice
} from "../models/OnlinePayModel.js";

// get all Users

export const allOnPayments = (req,res)=>{
    const id = req.params.id;
    const repotdate = req.params.repotdate;
    getOnlinePayments(id,repotdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create Customer
export const addOnlinePay=(req,res)=>{
    const data = req.body;
    InsertData(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//online income for PS2
export const onlineSumForDate= (req,res)=>{
    
    const sabha = req.params.sabha;
    const rdate = req.params.rdate;
    getOnlineSumByDate(sabha,rdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const onlineHeadsForDate= (req,res)=>{
    
    const sbcode = req.params.sbcode;
    const invdate = req.params.invdate;
    
    getOnlineHeadsforDay(sbcode,invdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//ps3 incpmeheads online
export const onlineVotesForDate= (req,res)=>{
    
    const sbcode = req.params.sbcode;
    const invdate = req.params.invdate;
    const invnum =req.params. invnum;
    const rhead =req.params. rhead
    getHeadsOnline(sbcode,invdate,invnum,rhead,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get all from onlinepayment for sabha invoice view
export const GenOnlineInvoice= (req,res)=>{
    
    const sabha = req.params.sabha;
    const innum = req.params.innum;
    genSabhaInvoice(sabha,innum,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};