import{
    getHeadsByInvoice,
    getHeadsforDay
    
} from "../models/InvoiceIncomeHeadsModel.js";

export const invoiceHeadsForDate= (req,res)=>{
    
    const sbcode = req.params.sbcode;
    const invdate = req.params.invdate;
    const invnum =req.params. invnum;
    const rhead =req.params. rhead
    getHeadsByInvoice(sbcode,invdate,invnum,rhead,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const headsForDate= (req,res)=>{
    
    const sbcode = req.params.sbcode;
    const invdate = req.params.invdate;
    
    getHeadsforDay(sbcode,invdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};