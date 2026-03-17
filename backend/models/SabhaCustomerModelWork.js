// import connection
import db from "../config/database1.js";

// get single user from saba customer table
export const getCusByNic = (cnic,sbcode,result) => {
    
    db.query("SELECT * FROM sbha_cutomers WHERE cus_nic  = ? AND sabha_code =? ",[cnic,sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//insert Customer
export const insertCustomer = (data,result) => {
    db.query("INSERT INTO sbha_cutomers SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// insert into Sabha_customers
export const getCustomerBySabha = (data,result) => {
    db.query("INSERT INTO sbha_cutomers SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get all customers of sabha
export const getCusBySabha = (sbcode,result) => {
    
    db.query("SELECT * FROM sbha_cutomers WHERE sabha_code =? ",[sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getCusById = (cid,result) => {
    
    db.query("SELECT * FROM sbha_cutomers WHERE id =? ",[cid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//Update customer
export const updateCusDetails = (data,id,result) => {
    db.query("UPDATE sbha_cutomers SET cus_name = ?,cus_contact = ?, cus_address = ? WHERE id = ?",[data.cus_name, data.cus_contact, data.cus_address, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get sabha Income heads
// export const getSabhaIncomeHedas = (id,result) => {
//     db.query("SELECT * FROM sb_rates AS r,income_heads AS h WHERE r.rate_sb_code=? AND r.rate_head_id = h.h_id;",[id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

//Ipdate Customer contact number only, from shop details
export const updateCusConta = (data,id,result) => {
    db.query("UPDATE sbha_cutomers SET cus_name =?, cus_contact = ?, cus_address= ? WHERE cus_nic = ?",[data.cus_name,data.cus_contact,data.cus_address, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};