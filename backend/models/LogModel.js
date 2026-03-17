// import connection
import db from "../config/database1.js";

// save wards
export const insertlogin = (data,result) => {
    db.query("INSERT INTO online_log_file SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};