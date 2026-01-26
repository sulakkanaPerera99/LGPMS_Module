// import connection
import db from "../config/database.js";

// get all Savd Invoice
export const getSavedInvoice = (sabha,invonum,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha = ? AND invoice_num = ?",[sabha,invonum], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};