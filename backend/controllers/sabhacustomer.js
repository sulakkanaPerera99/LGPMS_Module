// get single Sabha
import{
    getCusByNic,
    insertCustomer,
    getCustomerBySabha,
    getCusBySabha,
    getCusById,
    updateCusDetails,
    // getSabhaIncomeHedas,
    updateCusConta
    
} from "../models/SabhaCustomerModel.js";

export const showCustomer = (req,res)=>{
    const cnic = req.params.cnic;
    const sbcode = req.params.sbcode;
    getCusByNic(cnic,sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// create Customer
export const addCustomer=(req,res)=>{
    const data = req.body;
    insertCustomer(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

// add to sbha_cutomers
export const insertToSabhaCustomers=(req,res)=>{
    const data = req.body;
    getCustomerBySabha(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// grt all customers of sabha
export const getCustomersOfSabha = (req,res)=>{
    const sbcode = req.params.sbcode;
    getCusBySabha(sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get customer o edit
export const getCustomersById = (req,res)=>{
    const cid = req.params.cid;
    getCusById(cid,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//Update Customer
export const UpdateCustomerDetail=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateCusDetails(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//update Contact only
export const UpdateCustomerConta=(req,res)=>{
    const data = req.body;
    const id = req.params.id;
    updateCusConta(data,id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get sabha's all income heads
// export const sabhaIncomeHeads =(req,res)=>{
//     getSabhaIncomeHedas(req.params.id,(err,results)=> {
//         if (err) {
//             res.send(err);
//         }else {
//             res.json(results);
//         }
//     });
// };