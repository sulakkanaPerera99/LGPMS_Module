// import connection
import db from "../config/database.js";

// get all Online Payament
export const getAllOnlinePayments = (result) => {
    db.query("SELECT * FROM onlinepayment", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single Online Payament
export const getPaymentsById = (data,result) => {
    db.query("SELECT * FROM onlinepayment WHERE online_cus_nic = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert online payment temp
export const insertOnlinePayment  = (data,result) => {
    db.query("INSERT INTO onlinepayment SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// delete nline payment temp
export const deleteOnlinePay = (id,result) => {
    db.query("DELETE FROM onlinepayment WHERE online_cus_nic  = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
