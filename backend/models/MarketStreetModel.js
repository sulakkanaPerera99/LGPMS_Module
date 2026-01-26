// import connection
import db from "../config/database.js";

// get  sabha market Place using ID
export const getShopPlaceByID= (sbCode,msId,result) => {
    db.query("SELECT * FROM sabha_shop_place WHERE sabha_code =? AND ms_id  = ?",[sbCode,msId], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single sabha market Placeusing sabhaCode
export const getShopPlacesBySbCode= (Sabha_code,result) => {
    db.query("SELECT * FROM market_or_streets WHERE sb_code =?",[Sabha_code], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert sabha market Place

export const insertMarketPlace = (data,result) => {
    db.query("INSERT INTO market_or_streets SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};




// get all sabha market Place
export const getAllShopPlace = (result) => {
    db.query("SELECT * FROM market_or_streets", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete from market_or_streets and  shop_details

export const deleteFromMarketStreet = (msid,result) => {
    db.query("DELETE FROM market_or_streets WHERE ms_id = ?",[msid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//delete from sabha_shop_place
export const deleteFromSabaShopPlace = (msidp,result) => {
    db.query("DELETE FROM sabha_shop_place WHERE ms_id = ?",[msidp], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};