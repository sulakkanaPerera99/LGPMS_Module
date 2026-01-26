// import connection
import db from "../config/database.js";

// get all  rent-for-shop
export const getshopRentsTemp = (result) => {
    db.query("SELECT * FROM  rent_for_shop_temp", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single rent-for-shop
export const getshopRentsByIdTemp = (cusnic,result) => {
    db.query("SELECT * FROM rent_for_shop_temp WHERE rent_cus_nic = ?",[cusnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// insert rent-for-shop
export const insertshopRentsTemp = (data,result) => {
    db.query("INSERT INTO rent_for_shop_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// // update Food
// export const updateFoodById = (data,id,result) => {
//     db.query("UPDATE food SET food_name = ?, food_price = ? WHERE food_id = ?",[data.food_name, data.food_price, id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };


// delete rent-for-shop
export const deleteshopRentsByIdTemp = (id,result) => {
    db.query("DELETE FROM rent_for_shop_temp WHERE rent_cus_nic  = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};