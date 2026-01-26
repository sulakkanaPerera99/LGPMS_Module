// import connection
import db from "../config/database.js";

export const getonlineServices = (scode,result) => {
    db.query("SELECT * FROM sabha_online_services WHERE sabha_code = ?",[scode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// add services to sabha_online_services
export const saveSabaServices = (data,result) => {
    db.query("INSERT INTO sabha_online_services SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete service from sabha
export const deleteServiceById = (srid,result) => {
    db.query("DELETE FROM sabha_online_services WHERE id  = ?",[srid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//match sabha services for duplicates
export const getServicesBySabhanType = (saba,vote,ty,sname,result) => {
    db.query("SELECT * FROM sabha_online_services WHERE sabha_code = ? AND vote = ? AND service_type = ? AND service_name=? ",[saba,vote,ty,sname], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};