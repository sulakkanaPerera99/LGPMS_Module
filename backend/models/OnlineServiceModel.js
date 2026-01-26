// import connection
import db from "../config/database.js";

// get all user

export const getOnlineServices = (sabhaid,result) => {
    db.query("SELECT * FROM sabha_online_services WHERE sabha_code = ?",[sabhaid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert into onlinepayments
export const InsertServices= (data,result) => {
    db.query("INSERT INTO sabha_online_services SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
