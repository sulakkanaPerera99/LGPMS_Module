// import connection
import db from "../config/database.js";

// get all  rent-for-shop
export const getAssessmentTaxTemp= (result) => {
    db.query("SELECT * FROM  assessment_tax_temp", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single rent-for-shop
export const getAssessmentTaxByIdTemp = (cusnic,result) => {
    db.query("SELECT * FROM assessment_tax_temp WHERE tax_cus_nic = ?",[cusnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// get single rent-for-shop
// export const getshopRentsReceipt = (receipt,id,result) => {
//     db.query("SELECT * FROM rent_for_shop AS r,market_or_streets AS ms WHERE r.rent_invoice_num = ? AND r.rent_cus_nic = ? AND r.rent_shop_place=ms.ms_id",[receipt,id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

// insert rent-for-shop
export const insertAssessmentTaxTemp = (data,result) => {
    db.query("INSERT INTO assessment_tax_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// // get single rent-for-shop by date and month
// export const getshopRentsByDate = (sabhaid,payyear,paymonth,cusnic,placeid,shopid,result) => {
//     db.query("SELECT * FROM rent_for_shop WHERE rent_sabha_code=? AND rent_year=? AND rent_month=? AND rent_cus_nic = ? AND rent_shop_place=? AND rent_shop_no=?",[sabhaid,payyear,paymonth,cusnic,placeid,shopid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

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
export const deleteTaxTempById = (id,result) => {
    db.query("DELETE FROM assessment_tax_temp WHERE tax_cus_nic  = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};