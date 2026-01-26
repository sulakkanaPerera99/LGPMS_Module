import {
    getonlineServices,
    saveSabaServices,
    deleteServiceById,
    getServicesBySabhanType,
} from "../models/SabhaOnlineServicesModel.js";
    
export const showOnlineServices=(req,res)=>{
    const scode = req.params.scode;
    getonlineServices(scode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// add services to sabha_online_services
export const saveServicesOfSabha=(req,res)=>{
    const data = req.body;
    saveSabaServices(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete service by id
export const deleteSabhaServiceById=(req,res)=>{
    const srid = req.params.srid;
    deleteServiceById(srid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//match sabha services for duplicates saba,vote,ty
export const servicesBySabhanType= (req,res)=>{
    const saba = req.params.saba;
    const vote = req.params.vote;
    const ty = req.params.ty;
    const sname =req.params.sname;
    getServicesBySabhanType(saba,vote,ty,sname,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};