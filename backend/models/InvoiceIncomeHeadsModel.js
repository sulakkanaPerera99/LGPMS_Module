// import connection
import db from "../config/database1.js";

export const getHeadsByInvoice= (sbcode,invdate,invnum,rhead,result) => {
    db.query("SELECT invoice_num ,sb_rate_head,amount,discount  FROM tempory_invoice_save WHERE sabha =?  AND DATE(date) =? AND invoice_num =? AND sb_rate_head =? ",[sbcode,invdate,invnum,rhead], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// SELECT DISTINCT(sb_rate_head) FROM `tempory_invoice_save` WHERE date="2023-12-05";
export const getHeadsforDay= (sbcode,invdate,result) => {
    db.query("SELECT DISTINCT (sb_rate_head) FROM tempory_invoice_save WHERE sabha =?  AND DATE(date) =? ",[sbcode,invdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};