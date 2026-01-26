import db from "../config/database.js";

export const getSabhaRefNum = (refsabha,result) => {
    db.query("SELECT * FROM reference_num WHERE sb_code = ? ",[refsabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//update reference number for next user
export const updateSabhaRefNum = (data,sbid,result) => {
    db.query("UPDATE reference_num SET ref_num = ? WHERE sb_code = ?",[ data.ref_num, sbid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};