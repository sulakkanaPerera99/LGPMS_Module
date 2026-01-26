import{
    getExpenseVotes,
    getIncomeVotes,
    insertTempVouch,
    getTempVouch,
    deleteTempVouch,
    insertVoucher,
    getTodayVouch,
    deleteTempVouchBySabha,
    getVouchByDateRange,
    voucherSaveTempInv,
    getDiscTempVouch,
    saveVOucherToInvoice,
    getTempVouchByNum
    
} from "../models/VoucherModel.js";

//get expense votes of sabha
export const expenseVotes=(req,res)=>{
    
    getExpenseVotes(req.params.sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get income heads of sabha
export const incomeVotes=(req,res)=>{
    
    getIncomeVotes(req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const saveTempVouch=(req,res)=>{
    const data = req.body;
    insertTempVouch(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get temp saved table data
export const sabhaTempVouch=(req,res)=>{
    
    getTempVouch(req.params.sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//delete from temp table
export const deleteTemporaryVouch=(req,res)=>{
    const id = req.params.id;
    deleteTempVouch(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//insert to expenses table
export const saveVoucher=(req,res)=>{
    const data = req.body;
    insertVoucher(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get vouchers for today
export const todayVouchers=(req,res)=>{
    
    getTodayVouch(req.params.edate,req.params.saba,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// delete from expenses_temp by sabha
export const emptyTempVouchBysabha=(req,res)=>{
    const sb = req.params.sb;
    deleteTempVouchBySabha(sb,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// voucher for date range
export const voucherByDateRange= (req,res)=>{
    
    const psabha = req.params.psabha;
    const dfrom = req.params.dfrom;
    const dto = req.params.dto;
    getVouchByDateRange(psabha,dfrom,dto,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//save vouchers to tempory invoice save table
export const SaveVoucherTempInvoice=(req,res)=>{
    const data = req.body;
    voucherSaveTempInv(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get expenses_temp distinct by voucher number
export const sabhaDisticTempVoucher=(req,res)=>{
    
    getDiscTempVouch(req.params.sb,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//save voucher to invoice table as one record
export const saveVoucherAsInvoice=(req,res)=>{
    const data = req.body;
    saveVOucherToInvoice(data,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get voucher details by voucher number and sabha
export const tempVouchByNum=(req,res)=>{
    
    getTempVouchByNum(req.params.sabha,req.params.vno,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};