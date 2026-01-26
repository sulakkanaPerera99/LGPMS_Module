import {
    getVotesOfSabha,
    getinvoiceSumOfDate,
    getinvoiceSaveSumOfDate,
    getprog,
    getAllprogHeads,
    getincomeByprog,
    getsumIncomeByhead,
    getSbHeadsByprogHead,
    getEstData,
    getallSumBetween,
    getincomeByprogAnnaually,
    getincomeSummary,
    GetProgramDetails,
    getSbHeadsByprogram,
    getEstDataByProgram
   
} from "../models/MonthlyReportModel.js";

export const allVotesOfSabha= (req,res)=>{
    
    const sabha = req.params.sabha;
    getVotesOfSabha(sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const SumofDay= (req,res)=>{
    
    const sabha = req.params.sabha;
    const tod = req.params.tod;
    getinvoiceSumOfDate(sabha,tod,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const SumofDayByVote= (req,res)=>{
    
    const sabha = req.params.sabha;
    const tod = req.params.tod;
    const vote = req.params.vote;
    getinvoiceSaveSumOfDate(sabha,tod,vote,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

/////////////////////////LG05///////////////////
export const getprogBySabha= (req,res)=>{
    
    const sabha = req.params.sabha;
    getprog(sabha,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const getAllprogHeadsBySabha= (req,res)=>{
   
    getAllprogHeads((err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const getprogincome= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    getincomeByprog(sabha,prog,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const getsumOfHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    getsumIncomeByhead(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
///////getSbHeadsByprogHead
export const SbHeadsByprogHead= (req,res)=>{
    
    const sabha = req.params.sabha;
    const proghead=req.params.proghead;
    
    getSbHeadsByprogHead(sabha,proghead,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const getEstIncom= (req,res)=>{
    
    const sabha = req.params.sabha;
    const head=req.params.head;
    const year=req.params.year;
    
    getEstData(sabha,head,year,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const getsumBetweenMonth= (req,res)=>{
    
    const sabha = req.params.sabha;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    const selmon=req.params.selmon;
    getallSumBetween(sabha,sbhead,selyear,selmon,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const getprogincomeAnnually= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    getincomeByprogAnnaually(sabha,prog,sbhead,selyear,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

export const incomeSummary= (req,res)=>{
    
    const sabha = req.params.sabha;
    const prog=req.params.prog;
    const sbhead=req.params.sbhead;
    const selyear=req.params.selyear;
    getincomeSummary(sabha,prog,sbhead,selyear,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
///GetProgramDetails

export const ProgramDetails= (req,res)=>{
    
    const id = req.params.id;
   
    GetProgramDetails(id,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

///getSbHeadsByprogram
export const SbHeadsByprog= (req,res)=>{
    
    const sabha = req.params.sabha;
    const proghead=req.params.proghead;
    const prog=req.params.prog;
    
    getSbHeadsByprogram(sabha,proghead,prog,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};

///getEstDataByProgram
export const getEstIncomByProg= (req,res)=>{
    
    const sabha = req.params.sabha;
    const head=req.params.head;
    const year=req.params.year;
    const prog=req.params.prog;
    
    getEstDataByProgram(sabha,head,year,prog,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};