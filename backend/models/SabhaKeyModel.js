// import connection
import db from "../config/database.js";

// get all sabha Key
export const getAllKeys = (result) => {
    db.query("SELECT * FROM saba_keys", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single sabha Key
export const getKeyBySabha= (sbid,result) => {
    db.query("SELECT * FROM saba_keys WHERE sb_id = ?",[sbid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// insert Sabha Keys
export const insertKey= (data,result) => {
    db.query("INSERT INTO saba_keys SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// update sabha Keys
// export const updateProfileByNic = (data,id,result) => {
//     db.query("UPDATE customers SET cus_name = ?, cus_contact = ?, cus_address = ?, cus_email = ? WHERE cus_nic = ?",[data.cus_name, data.cus_contact, data.cus_address, data.cus_email, id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };



