// import functions from User model

import {
    getAllShopDetails,
    getShopDetailByNIC,
    insertShopDetails,
    updateShopDetails,
    getShopDetailByID,
    getShopDetailNIC,
    updateShopArrears,
    getShopDetailBySabha,
    deleteaShopById,
    deleteShopsbyPlace,
    deleteaShopfromSshopPlace,
    updateArrearsOnly,
    getOneMonthArrears,
    getTwoMonthArrears,
    getThreeMonthArrears,
} from "../models/ShopDetailsModel.js";

// get all ShopDetails
export const ShopDetails=(req,res)=>{
    getAllShopDetails((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// get single ShopDetails
export const ShopDetailNIC = (req,res)=>{
    getShopDetailNIC(req.params.taxnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get a Item
export const ShopDetailsByNIC=(req,res)=>{
    const taxeenic = req.params.taxeenic;
    const sbcode = req.params.sbcode;
    getShopDetailByNIC(taxeenic,sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// get single ShopDetails by ID
export const ShopDetailsByID= (req,res)=>{
    getShopDetailByID(req.params.shopDid,(err,results)=> {
        if (err) {s
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// create ShopDetails
export const NewShopDetails=(req,res)=>{
    const data = req.body;
    insertShopDetails(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};


// update ShopDetails
export const UpdateShopData=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateShopDetails(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Update arrears only
export const UpdateShopArrearsOnly=(req,res)=>{
    const data = req.body;
    const shopid = req.params.shopid;
    updateArrearsOnly(data,shopid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// update Arrears
export const ShopArrearsUpdate=(req,res)=>{
    const arreasdata = req.body;
    const shopDid = req.params.shopDid;
    updateShopArrears(arreasdata,shopDid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// Get shop details of single sabha
export const ShopDetailBySabha = (req,res)=>{
    getShopDetailBySabha(req.params.sabhaid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//2 
export const deleteFromShopPlaceByID=(req,res)=>{
    const splace = req.params.splace;
    const snum = req.params.snum;
    const ssabha = req.params.ssabha;
    deleteaShopfromSshopPlace(splace,snum,ssabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete one shop detail
export const deleteSingleShopDetail=(req,res)=>{
    const sid = req.params.sid;
    deleteaShopById(sid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// delete from market_or_streets and  shop_details
export const deleteShopsbyMarketPlace=(req,res)=>{
    const splace = req.params.splace;
    deleteShopsbyPlace(splace,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// arrears report for one month
export const oneMonthArrears = (req,res)=>{
    getOneMonthArrears(req.params.sabhaid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// arrears report for two months
export const twoMonthArrears = (req,res)=>{
    getTwoMonthArrears(req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const threeMonthArrears = (req,res)=>{
    getThreeMonthArrears(req.params.sb,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};