// import connection
import db from "../config/database.js";

// get  sabha rate heda summry for a date
export const getReportByID= (psabha,sbrateh,repotdate,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =? AND sb_rate_head  = ? AND date =? ",[psabha,sbrateh,repotdate], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// summary of vote for date range
export const getReportByDateRange= (psabha,svote,dfrom,dto,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =? AND sb_rate_head  = ? AND date BETWEEN  ? AND  ?",[psabha,svote,dfrom,dto], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//summary of one person for one day
export const getTodayReport= (psabha,repotdate,subnic,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =?  AND date =? AND sub_nic=? ",[psabha,repotdate,subnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//monthly summary of subject
export const getMonthVoteReport= (psabha,remon,reyr,subnic,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =?  AND MONTH(date) =? AND YEAR(date)=? AND sub_nic=? ",[psabha,remon,reyr,subnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//monthly summary by vote of subject
export const getMonthVote= (psabha,vot,remon,reyr,subnic,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =? AND sb_rate_head=? AND MONTH(date) =? AND YEAR(date)=? AND sub_nic=? ",[psabha,vot,remon,reyr,subnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//monthly summary by vote(not regarding nic)
export const getAllMonthVote= (psabha,vot,remon,reyr,result) => {
    db.query("SELECT * FROM tempory_invoice_save WHERE sabha =? AND sb_rate_head=? AND MONTH(date) =? AND YEAR(date)=? ",[psabha,vot,remon,reyr], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};