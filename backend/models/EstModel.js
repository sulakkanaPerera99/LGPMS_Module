// import connection
import db from "../config/database.js";

export const insertData = (data,result) => {
    db.query("INSERT INTO est_income SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};