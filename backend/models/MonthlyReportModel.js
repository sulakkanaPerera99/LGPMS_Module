import db from "../config/database.js";
export const getVotesOfSabha= (sabha,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code =? ORDER BY id",[sabha], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new AS sb,programs AS p, program_heads AS ph WHERE sb.rate_sb_code =? AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND ph.revenue_type='income' ORDER BY ph.id",[sabha], (err,results)=> {
        
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getinvoiceSumOfDate= (sabha,tod,result) => {
    db.query("SELECT COALESCE(SUM(total_amount), 0) as totalamount, COALESCE(SUM(cash_total), 0) as cashtotal, COALESCE(SUM(cheque_total), 0) as chequetotal, COALESCE(SUM(total_stamp), 0) as stamp, COALESCE(SUM(total_vat), 0) as vat,COALESCE(SUM(total_discount), 0) as discount FROM invoice WHERE sabha=? AND date=? AND invoice_status='0'",[sabha,tod], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getinvoiceSaveSumOfDate= (sabha,tod,vote,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) as discount FROM tempory_invoice_save WHERE sabha=? AND date=? AND sb_rate_head=? AND invoice_status='0'",[sabha,tod,vote], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
///////////////LG 05//////////////////////////
export const getprog= (sabha,result) => {
    db.query("SELECT DISTINCT(sb.prog_id),p.program_sin,p.program_en FROM sb_rates_new AS sb,programs AS p WHERE sb.rate_sb_code =? AND sb.prog_id=p.program_id ORDER BY p.id",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getAllprogHeads= (result) => {
    db.query("SELECT * FROM program_heads WHERE revenue_type='income' ORDER BY id", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getincomeByprog= (sabha,prog,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) as discount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND ph.revenue_type='income' AND iv.sb_rate_head=sb.sb_rate_head AND p.program_id=? AND iv.sb_rate_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? AND MONTH(iv.date)=? ORDER BY ph.id",[sabha,prog,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const getsumIncomeByhead= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) AS amount,COALESCE(SUM(discount), 0) as discount,sb_rate_head FROM `tempory_invoice_save` WHERE sabha=? AND sb_rate_head=? AND invoice_status=0 AND YEAR(date)=? AND MONTH(date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getSbHeadsByprogHead= (sabha,proghead,result) => {
    db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE ph.id=sb.program_head AND ph.revenue_type='income' AND sb.rate_sb_code=? AND sb.program_head=?",[sabha,proghead], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getEstData=(sabha,head,year,result) => {
    db.query("SELECT * FROM est_income WHERE sabha=? AND vote=? AND year=?",[sabha,head,year], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getallSumBetween=(sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) as discount,sb.sb_rate_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND ph.revenue_type='income' AND iv.sb_rate_head=sb.sb_rate_head AND iv.sb_rate_head=? AND iv.invoice_status=0 AND YEAR(iv.date)=? AND MONTH(iv.date) BETWEEN '01' AND ?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getincomeByprogAnnaually= (sabha,prog,sbhead,selyear,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) as discount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND ph.revenue_type='income' AND iv.sb_rate_head=sb.sb_rate_head AND p.program_id=? AND iv.sb_rate_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? ORDER BY ph.id",[sabha,prog,sbhead,selyear], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const getincomeSummary= (sabha,prog,sbhead,selyear,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) as discount,sb.prog_id,sb.program_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND ph.revenue_type='income' AND iv.sb_rate_head=sb.sb_rate_head AND p.program_id=? AND sb.program_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? ORDER BY ph.id",[sabha,prog,sbhead,selyear], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


export const GetProgramDetails= (id,result) => {
    db.query("SELECT * FROM programs WHERE program_id=?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


export const getSbHeadsByprogram= (sabha,proghead,prog,result) => {
    db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE ph.id=sb.program_head AND ph.revenue_type='income' AND sb.rate_sb_code=? AND sb.program_head=? AND sb.prog_id=?",[sabha,proghead,prog], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


export const getEstDataByProgram=(sabha,head,year,prog,result) => {
    db.query("SELECT* FROM est_income as e,sb_rates_new as sb WHERE e.sabha=? AND e.vote=? AND e.year=? AND e.vote=sb.sb_rate_head AND sb.prog_id=? AND sb.rate_sb_code=e.sabha",[sabha,head,year,prog], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
