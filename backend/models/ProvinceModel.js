// import connection
import db from "../config/database.js";

// get all province
export const getAllprovince = (result) => {
    db.query("SELECT * FROM province", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single province
export const getprovinceByID= (provid,result) => {
    db.query("SELECT pro_code,pro_name FROM province WHERE pro_code = ?",[provid], (err,results)=> {
        
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert User
export const insertprovince = (data,result) => {
    db.query("INSERT INTO province SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};




