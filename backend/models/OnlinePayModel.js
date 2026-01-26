// import connection
import db from "../config/database.js";

// get all user

export const getOnlinePayments = (id,repotdate,result) => {
    db.query("SELECT * FROM onlinepayment As o, customers As c WHERE o.online_sabha_code = ? AND o.online_pay_date =? AND o.online_cus_nic=c.cus_nic",[id,repotdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert into onlinepayments
export const InsertData = (data,result) => {
    db.query("INSERT INTO onlinepayment SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//online income for PS2
export const getOnlineSumByDate= (sabha,rdate,result) => {
    db.query("SELECT * FROM onlinepayment WHERE online_sabha_code =?  AND DATE(online_pay_date) =? ORDER BY `online_pay_id` ASC ",[sabha,rdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//PS3 online
export const getOnlineHeadsforDay= (sbcode,invdate,result) => {
    db.query("SELECT DISTINCT(vote) AS vote FROM onlinepayment WHERE online_sabha_code =?  AND DATE(online_pay_date) =? ",[sbcode,invdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//incomeheads
export const getHeadsOnline= (sbcode,invdate,invnum,rhead,result) => {
    db.query("SELECT online_invoice_num ,vote,online_pay_amount  FROM onlinepayment WHERE online_sabha_code =?  AND DATE(online_pay_date) =? AND online_invoice_num =? AND vote =? ",[sbcode,invdate,invnum,rhead], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get all from onlinepayment for sabha invoice view
export const genSabhaInvoice= (sabha,innum,result) => {
    db.query("SELECT * FROM onlinepayment AS o, customers As c WHERE o.online_sabha_code =?  AND o.online_invoice_num =? AND o.online_cus_nic=c.cus_nic",[sabha,innum], (err,results)=> {
        // db.query("SELECT * FROM onlinepayment WHERE online_sabha_code =?  AND online_invoice_num =? ORDER BY `online_pay_id` ASC ",[sabha,innum], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};