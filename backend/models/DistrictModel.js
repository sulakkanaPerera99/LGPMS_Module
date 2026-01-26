// import connection
import db from "../config/database.js";

// get all district
export const getAlldistric = (result) => {
    db.query("SELECT * FROM district", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single district
export const getdistrictByID= (code,result) => {
    db.query("SELECT * FROM district WHERE dist_province =?",[code], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// // insert User
// export const createDistrict = (data,result) => {
//     db.query("INSERT INTO district SET ?",data, (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results[0]);
//         }
//     });
// };

//SELECT * FROM `district` as d,pra_sabha as p WHERE p.sb_distcode =d.dist_code AND dist_province ="DIST1"
//Get  Prasabha of District
export const getSabhaOfProvince= (code,result) => {
    db.query("SELECT * FROM `district` as d,pra_sabha as p WHERE p.sb_distcode =d.dist_code AND dist_province =?",[code], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

