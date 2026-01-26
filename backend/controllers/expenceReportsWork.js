import {
    EXPgetVotesOfSabha,
    EXPgetinvoiceSumOfDate,
    EXPgetinvoiceSaveSumOfDate,
    EXPgetprog,
    EXPgetAllprogHeads,
    EXPgetincomeByprog,
    EXPgetsumIncomeByhead,
    EXPgetSbHeadsByprogHead,
    EXPgetEstData,
    EXPgetallSumBetween,
    EXPgetincomeByprogAnnaually,
    EXPgetincomeSummary,
    EXPGetProgramDetails,
    EXPgetSbHeadsByprogram,
    EXPgetEstDataByProgram,
    EXPgetsumIncomeByheadmoney,
    EXPgetsumIncomeByheadcross,
    EXPgetsumIncomeByheadmoneyPreMonth,
    EXPgetsumIncomeByheadcrossPreMonth,
   
} from "../models/ExpenseReportsModel.js";

export const EXPallVotesOfSabha= (req,res)=>{
    
    const sabha = req.params.sabha;
    EXPgetVotesOfSabha(sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPSumofDay= (req,res)=>{
    
    const sabha = req.params.sabha;
    const tod = req.params.tod;
    EXPgetinvoiceSumOfDate(sabha,tod,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const EXPSumofDayByVote= (req,res)=>{
    
    const sabha = req.params.sabha;
    const tod = req.params.tod;
    const vote = req.params.vote;
    EXPgetinvoiceSaveSumOfDate(sabha,tod,vote,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

/////////////////////////LG05///////////////////
export const EXPgetprogBySabha= (req,res)=>{
    
    const sabha = req.params.sabha;
    EXPgetprog(sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPgetAllprogHeadsBySabha= (req,res)=>{
   
    EXPgetAllprogHeads((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPgetprogincome= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetincomeByprog(sabha,prog,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const EXPgetsumOfHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetsumIncomeByhead(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
///////getSbHeadsByprogHead
export const EXPSbHeadsByprogHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const proghead=req.params.proghead;
    
    EXPgetSbHeadsByprogHead(sabha,proghead,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPgetEstIncom= (req,res)=>{
    
    const sabha = req.params.sabha;
    const head=req.params.head;
    const year=req.params.year;
    
    EXPgetEstData(sabha,head,year,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPgetsumBetweenMonth= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetallSumBetween(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPgetprogincomeAnnually= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    EXPgetincomeByprogAnnaually(sabha,prog,sbhead,selyear,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPincomeSummary= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    EXPgetincomeSummary(sabha,prog,sbhead,selyear,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
///GetProgramDetails

export const EXPProgramDetails= (req,res)=>{
    
    const id = req.params.id;
   
    EXPGetProgramDetails(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

///getSbHeadsByprogram
export const EXPSbHeadsByprog= (req,res)=>{
    
    const sabha = req.params.sabha;
    const proghead=req.params.proghead;
    const prog=req.params.prog;
    
    EXPgetSbHeadsByprogram(sabha,proghead,prog,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

///getEstDataByProgram
export const EXPgetEstIncomByProg= (req,res)=>{
    
    const sabha = req.params.sabha;
    const head=req.params.head;
    const year=req.params.year;
    const prog=req.params.prog;
    
    EXPgetEstDataByProgram(sabha,head,year,prog,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

//////////////////lg14////////////
export const EXPmoneygetsumOfHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetsumIncomeByheadmoney(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//PreMonth
export const EXPcrossgetsumOfHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetsumIncomeByheadcross(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const EXPmoneygetsumOfHeadPreMonth= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetsumIncomeByheadmoneyPreMonth(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//
export const EXPcrossgetsumOfHeadPreMonth= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    EXPgetsumIncomeByheadcrossPreMonth(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};