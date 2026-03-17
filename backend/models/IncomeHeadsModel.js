// import connection
import db from "../config/database1.js";

// get all user
// export const getAllIncomeHeads = (result) => {
//     db.query("SELECT * FROM income_heads", (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

// insert Income Head
// export const insertIncomeHead = (data,result) => {
//     db.query("INSERT INTO sb_rates SET ?",data, (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
// get single rate head id
export const getHeadByHeadId = (sbcode,ratehead,result) => {
    db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code =? AND sb_rate_head = ?",[sbcode,ratehead], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get income heads of individual subject by saba
export const getHeadBySubject= (id,sbcode,result) => {
    db.query("SELECT * FROM `emp_sb_rates` AS emp,sb_rates_new AS h WHERE (emp.sb_emp_nic_main = ? OR emp.sb_emp_nic_ac1 = ? OR emp.sb_emp_nic_ac2 =?) AND emp.emp_prs_code = ? AND emp.emp_prs_code=h.rate_sb_code AND emp.emp_sb_rates=h.sb_rate_head",[id,id,id,sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// export const getHeadBySubject= (id,sbcode,result) => {
//     db.query("SELECT * FROM emp_sb_rates WHERE (sb_emp_nic_main = ? OR sb_emp_nic_ac1 = ? OR sb_emp_nic_ac2 =?) AND emp_prs_code = ?",[id,id,id,sbcode], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
// get saved income heads of each sabha
// export const getSabhaIheads = (scode,result) => {
//     db.query("SELECT * FROM sb_rates AS s, income_heads AS i WHERE s.rate_sb_code = ? AND s.rate_head_id=i.h_id",[scode],(err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
//delete income heads
// export const deleteRateBySabha = (sid,rid,vid,result) =>  {
//     db.query("DELETE FROM sb_rates WHERE rate_sb_code = ? AND rate_head_id = ? AND sb_rate_head = ?",[sid,rid,vid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
export const getPrograms = (result) => {
    db.query("SELECT * FROM programs", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getProgramHeads = (result) => {
    db.query("SELECT * FROM program_heads", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getRevenueType = (rty,result) => {
    db.query("SELECT * FROM program_heads WHERE id = ?", [rty],(err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const insertVoteNew = (data,result) => {
    db.query("INSERT INTO sb_rates_new SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getAllNewVotes = (sbcode,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code = ? ",[sbcode], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new as sb,program_heads as p WHERE sb.rate_sb_code =? AND p.id=sb.program_head and p.revenue_type='income'",[sbcode], (err,results)=> {
        
          if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getAllNewVotesview= (sbcode,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code = ? ",[sbcode], (err,results)=> {
    db.query("SELECT sb.id,sb.sb_rate_head,sb.sb_rate_head_name,p.revenue_type FROM sb_rates_new as sb,program_heads as p WHERE sb.rate_sb_code =? AND p.id=sb.program_head ORDER BY p.revenue_type DESC",[sbcode], (err,results)=> {
        
          if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete income heads
export const deleteNewVotes = (id,result) =>  {
    db.query("DELETE FROM sb_rates_new WHERE id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};