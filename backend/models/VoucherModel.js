// import connection
import db from "../config/database.js";
//get expense heads for sabha
export const getExpenseVotes = (sbcode,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE main_program_head < 4100 AND rate_sb_code = ? ",[sbcode], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new as sb,program_heads as p WHERE sb.rate_sb_code =? AND p.id=sb.program_head and p.revenue_type='expense' ",[sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get income heads for sabha
export const getIncomeVotes = (sabha,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code = ? ",[sabha], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new as sb,program_heads as p WHERE sb.rate_sb_code =? AND p.id=sb.program_head and p.revenue_type='income' ",[sabha], (err,results)=> {

    // db.query("SELECT * FROM sb_rates_new WHERE main_program_head >= 4100 AND rate_sb_code = ? ",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//tempory table insert
export const insertTempVouch = (data,result) => {
    db.query("INSERT INTO expenses_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// get temporary table data
export const getTempVouch = (sabha,result) => {
    db.query("SELECT * FROM expenses_temp WHERE sabha = ? ",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete from temp table
export const deleteTempVouch = (id,result) =>  {
    db.query("DELETE FROM expenses_temp WHERE eid = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save vouchers
export const insertVoucher = (data,result) => {
    db.query("INSERT INTO expenses SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get vouchers for today
export const getTodayVouch = (edate,saba,result) => {
    db.query("SELECT * FROM expenses WHERE DATE(e_date_time) = ? AND sabha = ? ",[edate,saba], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete from expenses_temp by sabha
export const deleteTempVouchBySabha = (sb,result) =>  {
    db.query("DELETE FROM expenses_temp WHERE sabha = ?",[sb], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get vouchers for date range
export const getVouchByDateRange= (psabha,dfrom,dto,result) => {
    db.query("SELECT * FROM expenses WHERE sabha =?  AND e_date BETWEEN  ? AND  ?",[psabha,dfrom,dto], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save vouchers to tempory invoice save table
export const voucherSaveTempInv = (data,result) => {
    db.query("INSERT INTO tempory_invoice_save SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get expenses_temp distinct by voucher number
export const getDiscTempVouch = (sb,result) => {
    //
    // db.query("SELECT * FROM expenses_temp WHERE voucher_num IN (SELECT DISTINCT voucher_num FROM expenses_temp) AND sabha = ? ;",[sb], (err,results)=> {
    db.query("SELECT * FROM expenses_temp WHERE sabha= ? AND cross_states=1",[sb], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save voucher to invoice table as one record
export const saveVOucherToInvoice = (data,result) => {
    db.query("INSERT INTO invoice SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get voucher details by voucher number and sabha
export const getTempVouchByNum = (sabha,vno,result) => {
    db.query("SELECT * FROM expenses_temp WHERE sabha = ? AND voucher_num = ? AND cross_states=1",[sabha,vno], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};