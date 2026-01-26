// import functions from Invoice model

import {
    getSavedInvoice
   
} from "../models/InvoiceViewModel.js";

// get all Invoice from temporyinvoicesave

export const showSavedInvoice= (req,res)=>{
    const sabha = req.params.sabha;
    const invonum = req.params.invonum;
    getSavedInvoice(sabha,invonum,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};