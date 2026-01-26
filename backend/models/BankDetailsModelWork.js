// import connection
import db from "../config/database.js";

export const insertBank = (data,result) => {
    db.query("INSERT INTO bank_details SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
export const getAccount = (data,result) => {
    db.query("SELECT * FROM bank_details WHERE acc_no = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get bank accounts by sabha
export const getSabhaAccounts = (id,result) => {
    db.query("SELECT * FROM bank_details WHERE prs_code = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// sav secret key
export const insertKey = (data,result) => {
    db.query("INSERT INTO saba_keys SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//delete a bank account of sabha
export const deleteAddedAcc = (bid,result) =>  {
    db.query("DELETE FROM bank_details WHERE id = ?",[bid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
