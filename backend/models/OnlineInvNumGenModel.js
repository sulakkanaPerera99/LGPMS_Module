// import connection
import db from "../config/database.js";
// import bcrypt from 'bcrypt';

// get all getgenNum
export const getgenNum = (result) => {
    db.query("SELECT * FROM online_invnum_generate", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getgenNum2 = (sabha,result) => {
    db.query("SELECT * FROM online_invoice_num WHERE sabha=?",[sabha] ,(err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert online_invnum_generate
export const insertGenNum = (data,result) => {
    db.query("INSERT INTO online_invnum_generate SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

export const insertGenNum2 = (sabha,data,result) => {
    db.query("INSERT INTO online_invoice_num SET ? ",[sabha,data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};



// update Profile
export const updateGenNum = (data,result) => {
    db.query("UPDATE online_invnum_generate SET gen_num = ?",[data.gen_num], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const updateGenNum2 = (data,sabha,result) => {
    db.query("UPDATE online_invoice_num SET gen_num = ? WHERE sabha=?",[data.gen_num,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


