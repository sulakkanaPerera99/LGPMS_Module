// import connection
import db from "../config/database.js";

// get all Foods
export const getReceipt = (result) => {
    db.query("SELECT * FROM tempory_invoice", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single Foods
export const getReceiptById = (id,result) => {
    db.query("SELECT * FROM tempory_invoice WHERE cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// new get receipt from temp
export const getReceiptByIdnSabha = (id,scode,result) => {
    db.query("SELECT * FROM tempory_invoice WHERE cus_nic = ? AND sabha_code=?",[id,scode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get tempory piv by subject
export const getPivById = (id,subid,result) => {
    db.query("SELECT * FROM tempory_invoice WHERE cus_nic = ? AND sub_nic=?",[id,subid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert temp Invoice
export const insertReceipt = (data,result) => {
    db.query("INSERT INTO tempory_invoice SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// update Food
export const updateReceiptById = (data,id,result) => {
    db.query("UPDATE food SET food_name = ?, food_price = ? WHERE food_id = ?",[data.food_name, data.food_price, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// delete Receipts
export const deleteReceiptById = (result) => {
    db.query("DELETE FROM tempory_invoice", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete single Receipts remove button of invoice
export const deleteSingleReceiptById = (id,result) =>  {
    db.query("DELETE FROM tempory_invoice WHERE id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete delete tempory invoice data by customer's NIC
// delete single Receipts
export const deleteTempInvByNic = (id,result) =>  {
    db.query("DELETE FROM tempory_invoice WHERE cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert into temp_Invoice_keep
export const insertKeep = (data,result) => {
    db.query("INSERT INTO temporary_invoice_keep SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//view Added Piv of subject
export const getPivBySub = (subid,saba,result) => {
    db.query("SELECT * FROM tempory_invoice WHERE sub_nic = ? AND sabha_code=? ORDER BY id DESC",[subid,saba], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete all in tempory invoice table when  session ends
// export const deleteTempInvBySabha = (id,result) =>  {
//     db.query("DELETE FROM tempory_invoice WHERE cus_nic = ?",[id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };