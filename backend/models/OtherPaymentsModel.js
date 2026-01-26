// import connection
import db from "../config/database.js";

// get all  rent-for-shop
export const getOtherPayments = (cus,inv,result) => {
    db.query("SELECT * FROM  other_payments WHERE other_pay_cus_nic=? AND other_pay_invoice_num=?",[cus,inv], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single rent-for-shop
export const getOtherPaymentsById = (id,result) => {
    db.query("SELECT * FROM other_payments as pay,pra_sabha as s WHERE pay.other_pay_cus_nic = ? and pay.other_pay_sabha_code =s.sb_code",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};



// insert details of online aasesment tx payments by subject
export const OtherPaymentsAddDetails = (data,result) => {
    db.query("INSERT INTO other_payments SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


//Delete from tempory table 
export const deleteOtherPayments = (id,result) => {
    db.query("DELETE FROM other_payments WHERE other_pay_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//Delete from tempory table 
export const deleteOtherPaymentsBynic = (id,result) => {
    db.query("DELETE FROM other_payments WHERE other_pay_cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
