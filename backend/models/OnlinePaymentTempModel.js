// import connection
import db from "../config/database.js";

// get all Online Payament
export const getAllOnlinePaymentsTemp = (result) => {
    db.query("SELECT * FROM online_payment_temp", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single Online Payament
export const getPaymentsByIdTemp = (data,result) => {
    db.query("SELECT * FROM online_payment_temp WHERE online_cus_nic = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert online payment temp
export const insertOnlinePaymentTemp  = (data,result) => {
    db.query("INSERT INTO online_payment_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// delete nline payment temp
export const deleteOnlinePayTemp = (id,result) => {
    db.query("DELETE FROM online_payment_temp WHERE online_cus_nic  = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
