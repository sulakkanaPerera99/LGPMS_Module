// import connection
import db from "../config/database.js";

// get all  online_booking Request
export const getOnBookingReqest = (sbcode,result) => {
    db.query("SELECT * FROM  online_booking WHERE sabha_code = ? ORDER BY `datetime`DESC", [sbcode],(err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single online_booking Request
export const getOnBookingReqestById = (id,result) => {
    db.query("SELECT * FROM online_booking WHERE user_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single online_booking Request
export const getOnBookingReqestBygId = (gid,result) => {
    db.query("SELECT * FROM online_booking WHERE ob_id = ?",[gid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single online_booking Request
export const getReqestByserviceType= (nic,stype,result) => {
    db.query("SELECT * FROM online_booking WHERE user_nic = ? AND service_type=?",[nic,stype], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert details of online_booking Request
export const OnBookingReqestAdd= (data,result) => {
    db.query("INSERT INTO online_booking SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// update online_booking Request
export const updateOnBookingReqest = (Stdata,gid,result) => {
    db.query("UPDATE online_booking SET payment_status = ? WHERE ob_id  = ?",[Stdata.payment_status, gid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete online_booking Reques
export const deleteOnBookingReqest = (delid,result) => {
    db.query("DELETE FROM online_booking WHERE ob_id  = ?",[delid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};