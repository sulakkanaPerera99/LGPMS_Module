// import connection
import db from "../config/database.js";

// get all  rent-for-shop
export const TempgetOtherPayments = (result) => {
    db.query("SELECT * FROM  other_payments_temp", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single rent-for-shop
export const TempgetOtherPaymentsById = (id,result) => {
    db.query("SELECT * FROM other_payments_temp WHERE other_pay_cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};



// insert details of online aasesment tx payments by subject
export const TempOtherPaymentsAddDetails = (data,result) => {
    db.query("INSERT INTO other_payments_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


//Delete from tempory table 
export const TempdeleteOtherPayments = (id,result) => {
    db.query("DELETE FROM other_payments_temp WHERE other_pay_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//Delete from tempory table 
export const TempdeleteOtherPaymentsBynic = (id,result) => {
    db.query("DELETE FROM other_payments_temp WHERE other_pay_cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
