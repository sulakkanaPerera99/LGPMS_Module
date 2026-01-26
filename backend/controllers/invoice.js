// import functions from Invoice model

import {
    insertInvoice,
    getInvoice,
    insertInvoicetoSave,
    getSumByDate,
    updateInvtoCancel,
    updateInvoiceCanTempSave,
    getSumByShroffnDate,
    cancleInvoice,
    canceledReport,
    getSumByACC
   
} from "../models/InvoiceModel.js";
export const createInvoice=(req,res)=>{
    const data = req.body;
    insertInvoice(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get all Invoice
export const showInvoice=(req,res)=>{
    getInvoice((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//insert to tempory_invoice_save table
export const addToSave=(req,res)=>{
    const data = req.body;
    insertInvoicetoSave(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const invoiceSumForDate= (req,res)=>{
    
    const sabha = req.params.sabha;
    const rdate = req.params.rdate;
    getSumByDate(sabha,rdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//
export const invoiceSumForAcc= (req,res)=>{
    
    const sabha = req.params.sabha;
    const rdate = req.params.rdate;
    const acc = req.params.acc;
    getSumByACC(sabha,rdate,acc,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//daily summery by cashier_nic
export const shroffInvoiceSumForDate= (req,res)=>{
    
    const sabha = req.params.sabha;
    const rdate = req.params.rdate;
    const sid=req.params.sid;
    getSumByShroffnDate(sabha,rdate,sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const cancelInvoiceState=(req,res)=>{
    const data = req.body;
    const invid = req.params.invid;
    updateInvtoCancel(data,invid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const temSaveCancelInvoice=(req,res)=>{
    const tempdata = req.body;
    const invoid = req.params.invoid;
    updateInvoiceCanTempSave(tempdata,invoid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const cancleInvoiceById=(req,res)=>{
    const data = req.body;
    cancleInvoice(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// cancelled invoice report 
export const cancelledInvoiiceBySabha= (req,res)=>{
    
    const psabha = req.params.psabha;
    const dtfrom = req.params.dtfrom;
    const dtto = req.params.dtto;
    canceledReport(psabha,dtfrom,dtto,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};