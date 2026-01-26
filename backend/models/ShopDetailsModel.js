// import connection
import db from "../config/database.js";

// get all ShopDetails
export const getAllShopDetails = (result) => {
    db.query("SELECT * FROM shop_details", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single ShopDetail
export const getShopDetailByNIC= (taxeenic,sbcode,result) => {
    db.query("SELECT * FROM shop_details AS sd,market_or_streets AS ms WHERE sd.taxpayee_nic = ? AND sd.shop_sabha = ? AND sd.shop_place=ms.ms_id",[taxeenic,sbcode], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single ShopDetail
export const getShopDetailNIC= (taxnic,result) => {
    db.query("SELECT * FROM shop_details WHERE taxpayee_nic = ?",[taxnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// get single ShopDetail usind id
export const getShopDetailByID= (shopDid,result) => {
    db.query("SELECT * FROM shop_details AS sd,market_or_streets AS ms WHERE sd.shop_details_id = ? AND sd.shop_place=ms.ms_id",[shopDid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert ShopDetails
export const insertShopDetails = (data,result) => {
    db.query("INSERT INTO shop_details SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// update ShopDetails
export const updateShopDetails = (data,id,result) => {
    db.query("UPDATE shop_details SET shop_taxpayee = ?,taxpayee_nic = ?, taxpayee_contact = ?, taxpayee_address = ?, monthly_shop_rent = ?,Other=?,fine=? WHERE shop_details_id  = ?",[data.shop_taxpayee, data.taxpayee_nic, data.taxpayee_contact, data.taxpayee_address, data.monthly_shop_rent,data.Other,data.fine, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// update ShopArrears only
export const updateArrearsOnly = (data,shopid,result) => {
    db.query("UPDATE shop_details SET arrears = ?,pay_month  = ?, pay_year = ? WHERE shop_details_id  = ?",[data.arrears,data.pay_month,data.pay_year, shopid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// update ShopDetails
export const updateShopArrears = (arreasdata ,shopDid,result) => {
    db.query("UPDATE shop_details SET arrears = ? , pay_month = ?,pay_year=? WHERE shop_details_id  = ?",[arreasdata.arrears,arreasdata.pay_month,arreasdata.pay_year, shopDid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get shop details of a single sabha
export const getShopDetailBySabha= (sabhaid,result) => {
    db.query("SELECT * FROM shop_details AS sd,market_or_streets AS ms WHERE sd.shop_sabha = ? AND sd.shop_place=ms.ms_id ORDER BY sd.shop_place ASC, ms.ms_id ASC",[sabhaid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//1
export const deleteaShopfromSshopPlace = (splace,snum,ssabha,result) =>  {
    db.query("DELETE FROM shop_details WHERE shop_place = ? AND shop_number = ? AND shop_sabha = ?",[splace,snum,ssabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//2
export const deleteaShopById = (sid,result) =>  {
    db.query("DELETE FROM shop_details WHERE shop_details_id = ?",[sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete from market_or_streets and  shop_details
export const deleteShopsbyPlace = (splace,result) =>  {
    db.query("DELETE FROM shop_details WHERE shop_place = ?",[splace], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// arrears report for one month
// export const getOneMonthArrears= (sabhaid,result) => {
//     db.query("SELECT * FROM `shop_details` AS s, market_or_streets AS ms WHERE (s.pay_month = MONTH(CURDATE()) - 1 OR s.pay_month = MONTH(CURDATE()) + 11) AND s.shop_sabha = ?  AND s.shop_place=ms.ms_id ORDER BY s.shop_place ASC, ms.ms_id ASC",[sabhaid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
//paymonth -2 to get the difference of one month
export const getOneMonthArrears= (sabhaid,result) => {
    db.query("SELECT * FROM `shop_details` AS s, market_or_streets AS ms WHERE (s.pay_month = MONTH(CURDATE()) - 2) AND s.pay_year=YEAR(CURDATE())  AND s.shop_sabha = ?  AND s.shop_place=ms.ms_id ORDER BY s.shop_place ASC, ms.ms_id ASC",[sabhaid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// arrears report for two month
export const getTwoMonthArrears= (sabha,result) => {
    db.query("SELECT * FROM `shop_details` AS s, market_or_streets AS ms WHERE (s.pay_month = MONTH(CURDATE()) - 3) AND s.pay_year=YEAR(CURDATE()) AND s.shop_sabha = ?  AND s.shop_place=ms.ms_id ORDER BY s.shop_place ASC, ms.ms_id ASC",[sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// arrears report for 3 or more than 3 months
export const getThreeMonthArrears= (sb,result) => {
    // db.query("SELECT * FROM `shop_details` AS s, market_or_streets AS ms WHERE ABS(MONTH(CURDATE()) - s.pay_month) >=3 AND s.shop_sabha = ?  AND s.shop_place=ms.ms_id ORDER BY s.shop_place ASC, ms.ms_id ASC",[sb], (err,results)=> {
        db.query("SELECT * FROM `shop_details` AS s, market_or_streets AS ms WHERE ABS(MONTH(CURDATE()) - s.pay_month) >=4  AND (YEAR(CURDATE()) > s.pay_year OR (YEAR(CURDATE()) = s.pay_year AND MONTH(CURDATE()) - s.pay_month >= 4)) AND s.shop_sabha = ?  AND s.shop_place=ms.ms_id ORDER BY s.shop_place ASC, ms.ms_id ASC",[sb], (err,results)=> { 
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get a single shop details of a single sabha
// export const getSingleShopBySabha= (sabhaid,result) => {
//     db.query("SELECT * FROM shop_details AS sd,market_or_streets AS ms WHERE sd.shop_sabha = ? AND sd.shop_place=ms.ms_id AND sd.shop_details_id",[sabhaid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };