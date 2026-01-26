// import functions from OnlinePaymodel

import {
    getOnlineServices,
    InsertServices

} from "../models/OnlineServiceModel.js";

// get all Users

export const allservices = (req,res)=>{
    const sabhaid = req.params.sabhaid;
   
    getOnlineServices(sabhaid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create Customer
export const addOnlineServices=(req,res)=>{
    const data = req.body;
    InsertServices(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};