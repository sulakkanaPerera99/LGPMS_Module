// import connection
import db from "../config/database.js";

export const getDailyIncome= (id,sbcode,result) => {
    db.query("SELECT * FROM `tempory_invoice_save` WHERE sabha = ? AND date_time = ? ",[id,sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
