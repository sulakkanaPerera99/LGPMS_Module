// import connection
import db from "../config/database.js";

// get all  gully_bowser Request
export const getGullyReqest = (sbcode,stype,result) => {
    db.query("SELECT * FROM  online_booking WHERE sabha_code = ? AND service_type = ? ORDER BY `datetime`DESC", [sbcode,stype],(err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single gully_bowser Request
export const getGullyReqestById = (id,result) => {
    db.query("SELECT * FROM gully_bowser WHERE user_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single gully_bowser Request
export const getGullyReqestBygId = (gid,result) => {
    db.query("SELECT * FROM gully_bowser WHERE gid = ?",[gid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert details of gully_bowser Request
export const GullyReqestAdd= (data,result) => {
    db.query("INSERT INTO gully_bowser SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// update gully_bowser Request to processing
export const updateGullyReqest = (Stdata,gid,result) => {
    db.query("UPDATE online_booking SET payment_status = ? WHERE ob_id = ?",[Stdata.payment_status, gid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete gully_bowser Reques
export const deleteGullyReqest = (delid,result) => {
    db.query("DELETE FROM gully_bowser WHERE gid  = ?",[delid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get income heads of individual subject by saba for online services
export const getOnlineServiceHeads= (nic,scode,result) => {
    db.query("SELECT * FROM `emp_sb_rates` AS emp,sb_rates_new AS h WHERE (emp.sb_emp_nic_main = ? OR emp.sb_emp_nic_ac1 = ? OR emp.sb_emp_nic_ac2 =?) AND(emp.subjecttype <>'other' AND emp.subjecttype <>'assesmenttax' AND emp.subjecttype <>'shoprent' ) AND emp.emp_prs_code = ? AND emp.emp_prs_code=h.rate_sb_code AND emp.emp_sb_rates=h.sb_rate_head " ,[nic,nic,nic,scode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//Update amount of online booking
export const updateAmountOfBooking = (amountup,pstate,gid,result) => {
    db.query("UPDATE online_booking SET amount = ? , payment_status = ? WHERE ob_id = ?",[amountup.amount,pstate.payment_status, gid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update feedback(reject reason) of online booking
export const updateFeedbackOfBooking = (feed,paystate,obid,result) => {
    db.query("UPDATE online_booking SET feedback = ?, payment_status = ? WHERE ob_id = ?",[feed.feedback,paystate.payment_status, obid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};