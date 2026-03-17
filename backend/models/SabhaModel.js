// import connection
import db from "../config/database1.js";

// get all district
export const getAllsabha = (result) => {
    db.query("SELECT * FROM pra_sabha", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single sabha using dist Code
export const getsabhaByID= (data,result) => {
    db.query("SELECT * FROM pra_sabha WHERE sb_distcode = ?",[data], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single sabha using dist Code
export const getsabhaByCode= (data,result) => {
    db.query("SELECT * FROM pra_sabha WHERE sb_code = ?",[data], (err,results)=> {
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




