// import connection
import db from "../config/database1.js";
// import bcrypt from 'bcrypt';

// get all getgenNum
// export const sabhagetgenNum = (result) => {
//     db.query("SELECT * FROM sabha_invnum_generate ", (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

//GET invoicenum by sabha
export const sabhagetgenNum = (sid,result) => {
    db.query("SELECT * FROM sabha_invnum_generate WHERE sabha = ? ",[sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// insert online_invnum_generate
export const sabhainsertGenNum = (data,result) => {
    db.query("INSERT INTO sabha_invnum_generate SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};



// update Profile
// export const sabhaupdateGenNum = (data,result) => {
//     db.query("UPDATE sabha_invnum_generate SET gen_num = ?",[data.gen_num], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
// update Profile by sabha
export const sabhaupdateGenNum = (data,sbid,result) => {
    db.query("UPDATE sabha_invnum_generate SET gen_num = ? WHERE sabha = ?",[ data.gen_num, sbid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

