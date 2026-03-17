// import connection
import db from "../config/database1.js";

//tempory table insert
export const insertTempSubject = (data,result) => {
    db.query("INSERT INTO temp_emp_sb_rates SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

//get temport table records by sabha
export const getTemporyAssigns = (id,result) => {
    db.query("SELECT * FROM temp_emp_sb_rates WHERE emp_prs_code = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete single subject remove button of invoice
export const deleteSingleSubById = (id,result) =>  {
    db.query("DELETE FROM temp_emp_sb_rates WHERE id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// save subjects to permenant table
export const insertsubject = (data,result) => {
    db.query("INSERT INTO emp_sb_rates SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete temport table completely
export const deleteAllSubs = (result) => {
    db.query("DELETE FROM temp_emp_sb_rates", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get all saved subjects of sabha from emp_sb_rates table
// export const getSavedSubs = (sid,result) => {
//     db.query("SELECT * FROM emp_sb_rates AS e,income_heads AS i WHERE e.emp_prs_code = ? AND e.h_id=i.h_id",[sid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
//new for sb_rates_new table 21-1-26
export const getSavedSubs = (sid,rsid,result) => {
    db.query("SELECT * FROM emp_sb_rates AS e,sb_rates_new AS i WHERE e.emp_prs_code = ? AND e.emp_sb_rates=i.sb_rate_head AND i.rate_sb_code = ? ",[sid,rsid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete assigned subjects
export const deleteAssignSub = (aid,result) =>  {
    db.query("DELETE FROM emp_sb_rates WHERE iid = ?",[aid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};