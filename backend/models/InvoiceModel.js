// import connection
import db from "../config/database.js";

// insert Invoice
export const insertInvoice = (data,result) => {
    db.query("INSERT INTO invoice SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get all Invoice
export const getInvoice = (result) => {
    db.query("SELECT * FROM invoice ", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert to tempory_invoice_save table
export const insertInvoicetoSave = (data,result) => {
    db.query("INSERT INTO tempory_invoice_save SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get invoice total for a day in a sabha

export const getSumByDate= (sabha,rdate,result) => {
    db.query("SELECT * FROM invoice WHERE sabha =?  AND DATE(date) =? ORDER BY `id` ASC ",[sabha,rdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//get invoice total for a day in a sabha

export const getSumByACC= (sabha,rdate,acc,result) => {
    db.query("SELECT * FROM invoice WHERE sabha =?  AND DATE(date) =? AND acc_number=? ORDER BY `id` ASC ",[sabha,rdate,acc], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//daily summery by cashier_nic
export const getSumByShroffnDate= (sabha,rdate,sid,result) => {
    db.query("SELECT * FROM invoice WHERE sabha =?  AND DATE(date) =? AND cashier_nic=? ORDER BY `id` ASC ",[sabha,rdate,sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update invoice to cancle state
export const updateInvtoCancel = (data,invid,result) => {
    db.query("UPDATE invoice SET invoice_status = ? WHERE invoice_num = ?",[data.invoice_status, invid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//update invoice to cancle state temp save
export const updateInvoiceCanTempSave = (tempdata,invoid,result) => {
    db.query("UPDATE tempory_invoice_save SET invoice_status = ? WHERE invoice_num = ?",[tempdata.invoice_status, invoid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// table : **invoice_cancelled **  cancele invoice 
export const cancleInvoice = (data,result) => {
    db.query("INSERT INTO invoice_cancelled SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// cancelled invoice list
export const canceledReport= (psabha,dtfrom,dtto,result) => {
    db.query("SELECT * FROM invoice_cancelled AS c, invoice AS p WHERE c.sabha =?  AND DATE (c.cancelled_date_time) BETWEEN  ? AND  ? AND c.invoice_num=p.invoice_num",[psabha,dtfrom,dtto], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};