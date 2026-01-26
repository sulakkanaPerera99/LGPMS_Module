// import connection
import db from "../config/database.js";

export const insertShop = (data,result) => {
    db.query("INSERT INTO sabha_shop_place SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// get shopss of single sabha
export const getShopsBySabha = (id,result) => {
    db.query("SELECT * FROM sabha_shop_place AS shop,market_or_streets AS s_place WHERE shop.ms_id = s_place.ms_id  AND shop.sabha_code = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete single Shop remove button of Shop Datails
export const deleteSingleShopById = (id,result) =>  {
    db.query("DELETE FROM sabha_shop_place WHERE shop_place_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};