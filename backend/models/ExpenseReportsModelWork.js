import db from "../config/database.js";
export const EXPgetVotesOfSabha= (sabha,result) => {
    // db.query("SELECT * FROM sb_rates_new WHERE rate_sb_code =? ORDER BY id",[sabha], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new AS sb,programs AS p, program_heads AS ph WHERE sb.rate_sb_code =? AND  sb.prog_id=ph.p_head_id  AND  p.program_id=ph.p_head_id AND ph.revenue_type='expense' ",[sabha], (err,results)=> {
        
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetinvoiceSumOfDate= (sabha,tod,result) => {
    db.query("SELECT COALESCE(SUM(total_amount), 0) as totalamount, COALESCE(SUM(cash_total), 0) as cashtotal, COALESCE(SUM(cheque_total), 0) as chequetotal, COALESCE(SUM(total_stamp), 0) as stamp, COALESCE(SUM(total_vat), 0) as vat,COALESCE(SUM(total_discount), 0) as discount FROM invoice WHERE sabha=? AND date=? AND invoice_status='0'",[sabha,tod], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const EXPgetinvoiceSaveSumOfDate= (sabha,tod,vote,result) => {
    db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) AS discount, FROM tempory_invoice_save WHERE sabha=? AND date=? AND sb_rate_head=? AND invoice_status='0'",[sabha,tod,vote], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
///////////////LG 05//////////////////////////
export const EXPgetprog= (sabha,result) => {
    db.query("SELECT DISTINCT(sb.prog_id),p.program_sin,p.program_en FROM sb_rates_new AS sb,programs AS p WHERE sb.rate_sb_code =? AND sb.prog_id=p.program_id ORDER BY p.program_id",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetAllprogHeads= (result) => {
    db.query("SELECT * FROM program_heads WHERE revenue_type='expense' ORDER BY id", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetincomeByprog= (sabha,prog,sbhead,selyear,selmon,result) => {
    // db.query("SELECT COALESCE(SUM(amount), 0) as amount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=ph.id  AND  ph.revenue_type='expense' AND iv.sb_rate_head=sb.sb_rate_head AND ph.p_head_id=? AND iv.sb_rate_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? AND MONTH(iv.date)=? ",[sabha,prog,sbhead,selyear,selmon], (err,results)=> {
        // db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) AS discount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=ph.id  AND  ph.p_head_id=? AND ph.revenue_type='expense' AND iv.sb_rate_head=? AND iv.invoice_status=0 AND YEAR(iv.date)=? AND MONTH(iv.date)=? ",[sabha,prog,sbhead,selyear,selmon], (err,results)=> {
        db.query("SELECT COALESCE(SUM(e_amount), 0) as amount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,expenses AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND  p.program_id=? AND ph.revenue_type='expense' AND iv.expense_head=? AND iv.expense_head=sb.sb_rate_head AND iv.e_status=0 AND iv.cross_states=0 AND YEAR(iv.e_date)=? AND MONTH(iv.e_date)=? ",[sabha,prog,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const EXPgetsumIncomeByhead= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(e_amount), 0) AS amount,expense_head FROM `expenses` WHERE sabha=? AND expense_head=? AND e_status=0 AND cross_states=0 AND YEAR(e_date)=? AND MONTH(e_date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetSbHeadsByprogHead= (sabha,proghead,result) => {
    // db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE h.income_head=sb.program_head AND  ph.revenue_type='expense' AND sb.rate_sb_code=? AND sb.main_program_head=?",[sabha,proghead], (err,results)=> {
    // db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE ph.p_head_id=sb.main_program_head  AND ph.revenue_type='expense' AND sb.rate_sb_code=? AND sb.main_program_head=?",[sabha,proghead], (err,results)=> {
    db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE ph.id=sb.program_head  AND ph.revenue_type='expense' AND sb.rate_sb_code=? AND sb.program_head=?",[sabha,proghead], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetEstData=(sabha,head,year,result) => {
    db.query("SELECT * FROM est_expense WHERE sabha=? AND vote=? AND year=?",[sabha,head,year], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetallSumBetween=(sabha,sbhead,selyear,selmon,result) => {
    // db.query("SELECT COALESCE(SUM(amount), 0) as amount,COALESCE(SUM(discount), 0) AS discount,sb.sb_rate_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=ph.id  AND  ph.revenue_type='expense' AND iv.sb_rate_head=sb.sb_rate_head AND iv.sb_rate_head=? AND iv.invoice_status=0 AND YEAR(iv.date)=? AND MONTH(iv.date) BETWEEN '01' AND ?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        db.query("SELECT COALESCE(SUM(e_amount), 0) as amount,sb.sb_rate_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,expenses AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND  ph.revenue_type='expense' AND iv.expense_head=sb.sb_rate_head AND iv.expense_head=? AND iv.e_status=0 AND iv.cross_states=0 AND YEAR(iv.e_date)=? AND MONTH(iv.e_date) BETWEEN '01' AND ?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetincomeByprogAnnaually= (sabha,prog,sbhead,selyear,result) => {
    // db.query("SELECT COALESCE(SUM(amount), 0) as amount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=ph.id  AND  ph.revenue_type='expense' AND iv.sb_rate_head=sb.sb_rate_head AND ph.p_head_id=? AND iv.sb_rate_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? ",[sabha,prog,sbhead,selyear], (err,results)=> {
    db.query("SELECT COALESCE(SUM(e_amount), 0) as amount,sb.prog_id FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,expenses AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id AND  ph.revenue_type='expense' AND iv.expense_head=sb.sb_rate_head AND p.program_id=? AND iv.expense_head=? AND iv.e_status=0 AND iv.cross_states=0 AND YEAR(iv.e_date)=? ",[sabha,prog,sbhead,selyear], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetincomeSummary= (sabha,prog,sbhead,selyear,result) => {
    // db.query("SELECT COALESCE(SUM(amount), 0) as amount,sb.prog_id,sb.program_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,tempory_invoice_save AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=ph.id  AND  ph.revenue_type='expense' AND iv.sb_rate_head=sb.sb_rate_head AND ph.p_head_id=? AND sb.program_head=? AND iv.invoice_status=0  AND YEAR(iv.date)=? ",[sabha,prog,sbhead,selyear], (err,results)=> {
    db.query("SELECT COALESCE(SUM(e_amount), 0) as amount,sb.prog_id,sb.program_head FROM sb_rates_new AS sb,programs AS p, program_heads AS ph,expenses AS iv WHERE sb.rate_sb_code =? AND sb.rate_sb_code=iv.sabha AND sb.prog_id=p.program_id AND sb.program_head=ph.id  AND sb.program_head=ph.id AND sb.sb_rate_head=iv.expense_head AND ph.revenue_type='expense' AND p.program_id=? AND sb.program_head=? AND iv.e_status=0 AND iv.cross_states=0 AND YEAR(iv.e_date)=? ORDER BY ph.p_head_id",[sabha,prog,sbhead,selyear], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPGetProgramDetails= (id,result) => {
    db.query("SELECT * FROM programs WHERE program_id=?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


export const EXPgetSbHeadsByprogram= (sabha,proghead,prog,result) => {
    db.query("SELECT * FROM sb_rates_new AS sb,program_heads AS ph WHERE ph.revenue_type='expense' AND sb.rate_sb_code=? AND sb.program_head=? AND sb.prog_id=?",[sabha,proghead,prog], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


export const EXPgetEstDataByProgram=(sabha,head,year,prog,result) => {
    db.query("SELECT* FROM est_expense as e,sb_rates_new as sb WHERE e.sabha=? AND e.vote=? AND e.year=? AND e.vote=sb.sb_rate_head AND sb.prog_id=? AND sb.rate_sb_code=e.sabha",[sabha,head,year,prog], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


//////////////lg14/////////////
export const EXPgetsumIncomeByheadmoney= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(e_amount), 0) AS e_amount,expense_head FROM `expenses` WHERE sabha=? AND expense_head=? AND e_status=0 AND cross_states=0 AND YEAR(e_date)=? AND MONTH(e_date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const EXPgetsumIncomeByheadcross= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(e_amount), 0) AS e_amount,expense_head FROM `expenses` WHERE sabha=? AND expense_head=? AND e_status=0 AND cross_states=1 AND YEAR(e_date)=? AND MONTH(e_date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const EXPgetsumIncomeByheadmoneyPreMonth= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(e_amount), 0) AS e_amount,expense_head FROM `expenses` WHERE sabha=? AND expense_head=? AND e_status=0 AND cross_states=1 AND YEAR(e_date)=? AND MONTH(e_date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
export const EXPgetsumIncomeByheadcrossPreMonth= (sabha,sbhead,selyear,selmon,result) => {
    db.query("SELECT COALESCE(SUM(e_amount), 0) AS e_amount,expense_head FROM `expenses` WHERE sabha=? AND expense_head=? AND e_status=0 AND cross_states=1 AND YEAR(e_date)=? AND MONTH(e_date)=?",[sabha,sbhead,selyear,selmon], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//PreMonth