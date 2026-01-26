// import functions from temporyInvoiceModel 

import {
    getReceipt,
    getReceiptById,
    insertReceipt,
    updateReceiptById,
    deleteReceiptById,
    deleteSingleReceiptById,
    deleteTempInvByNic,
    insertKeep,
    getPivById,
    getReceiptByIdnSabha,
    getPivBySub
} from "../models/temporyInvoiceModel.js";

// get all Foods
export const showReceipt=(req,res)=>{
    getReceipt((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single Food
export const showReceiptById=(req,res)=>{
    getReceiptById(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get receipts new
export const showReceiptByIdnSabha=(req,res)=>{
    getReceiptByIdnSabha(req.params.id,req.params.scode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get tempory piv by subject
export const showPivBySubId=(req,res)=>{
    getPivById(req.params.id,req.params.subid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create Food
export const createReceipt=(req,res)=>{
    const data = req.body;
    insertReceipt(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// update Food
export const updateReceipt=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateReceiptById(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// delete Receipts
export const deleteReceipt=(req,res)=>{
   
    deleteReceiptById((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Delete single Receipt
export const deleteSingleReceipt=(req,res)=>{
    const id = req.params.id;
    deleteSingleReceiptById(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//deleteTempInvByNic
export const deleteTempInv=(req,res)=>{
    const id = req.params.id;
    deleteTempInvByNic(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//insert into temp_Invoice_keep
export const insertTemporaryKeep=(req,res)=>{
    const data = req.body;
    insertKeep(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get tempory piv added by subject
export const viewSubjectPivList=(req,res)=>{
    getPivBySub(req.params.subid,req.params.saba,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};