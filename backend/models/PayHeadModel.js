// import connection
import db from "../config/database1.js";

// get all icome head
export const getAllIncomeHeads = (result) => {
    db.query("SELECT * FROM income_heads", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single income head
export const getIncomeHeadID= (data,result) => {
    db.query("SELECT * FROM income_heads WHERE h_id  = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};