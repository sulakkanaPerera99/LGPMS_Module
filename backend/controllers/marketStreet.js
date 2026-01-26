// import functions from MarketStreet model

import {
    getAllShopPlace,
    getShopPlaceByID,
    getShopPlacesBySbCode,
    insertMarketPlace,
    deleteFromMarketStreet,
    deleteFromSabaShopPlace
} from "../models/MarketStreetModel.js";

// get all sabha market Place
export const getAllmarketStreets=(req,res)=>{
    getAllShopPlace((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single sabha market Place Using sbh code
export const marketStreetsById= (req,res)=>{
    
    const sbCode = req.params.sbCode;
    const msId = req.params.msId;
    getShopPlaceByID(sbCode,msId,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single sabha market Place
export const marketStreetsBySbcode= (req,res)=>{
    getShopPlacesBySbCode(req.params.Sabha_code,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// // create sabha market Place
export const createmarketStreets=(req,res)=>{
    const data = req.body;
    insertMarketPlace(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete from market_or_streets and  shop_details
export const deleteMarktstreet=(req,res)=>{
    const msid = req.params.msid;
    deleteFromMarketStreet(msid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//deleteFromSabaShopPlace
export const deleteSabaShopPlaceAll=(req,res)=>{
    const msidp = req.params.msidp;
    deleteFromSabaShopPlace(msidp,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

