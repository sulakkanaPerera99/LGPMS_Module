// import connection
import db from "../config/database.js";

// get all user
// export const getAllLevels = (result) => {
//     db.query("SELECT * FROM user_levels", (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
// get User levels
export const getAllLevels = (id,result) => {
    db.query("SELECT * FROM user_levels WHERE levei_id > ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get User levels
export const getAllLevelsbyLID = (id,result) => {
    db.query("SELECT * FROM user_levels WHERE levei_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get provices from province table
export const getAllProvinces = (result) => {
        db.query("SELECT * FROM province", (err,results)=> {
            if (err){
                console.log(err);
                result(err,null);
            }else{
                result(null,results);
            }
        });
    };