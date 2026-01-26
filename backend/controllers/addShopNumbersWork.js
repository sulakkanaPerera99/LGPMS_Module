// import functions from Market Place model

import {
    insertShop,
    getShopsBySabha,
    deleteSingleShopById,
} from "../models/AddShopNumbersModel.js";

// create user
export const addShop=(req,res)=>{
    const data = req.body;
    insertShop(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get shops of single sabha
export const showShopsBySabha=(req,res)=>{
    getShopsBySabha(req.params.id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Delete single Shop
export const deleteSingleShop=(req,res)=>{
    const id = req.params.id;
    deleteSingleShopById(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};