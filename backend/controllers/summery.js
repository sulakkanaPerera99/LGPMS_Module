import {

    getReportByID,
    getTodayReport,
    getMonthVoteReport,
    getMonthVote,
    getAllMonthVote,
    getReportByDateRange
} from "../models/SummeryModel.js";

// get ratehead summery for a date of a sabha
export const reportByHid= (req,res)=>{
    
    const psabha = req.params.psabha;
    const sbrateh = req.params.sbrateh;
    const repotdate = req.params.repotdate;
    getReportByID(psabha,sbrateh,repotdate,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
export const getTodayReportOneSub= (req,res)=>{
    
    const psabha = req.params.psabha;
    const repotdate = req.params.repotdate;
    const subnic = req.params.subnic
    getTodayReport(psabha,repotdate,subnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get monthly report by suject
export const monthlyVoteBySub= (req,res)=>{
    
    const psabha = req.params.psabha;
    const remon = req.params.remon;
    const reyr = req.params.reyr;
    const subnic = req.params.subnic
    getMonthVoteReport(psabha,remon,reyr,subnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get monthly report by suject and vote
export const subVoteByMonth= (req,res)=>{
    
    const psabha = req.params.psabha;
    const vot = req.params.vot;
    const remon = req.params.remon;
    const reyr = req.params.reyr;
    const subnic = req.params.subnic
    getMonthVote(psabha,vot,remon,reyr,subnic,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
//get all monthly report by vote
export const allVoteByMonth= (req,res)=>{
    
    const psabha = req.params.psabha;
    const vot = req.params.vot;
    const remon = req.params.remon;
    const reyr = req.params.reyr;
    getAllMonthVote(psabha,vot,remon,reyr,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
// get vote summary for date range
export const reportByDateRange= (req,res)=>{
    
    const psabha = req.params.psabha;
    const svote = req.params.svote;
    const dfrom = req.params.dfrom;
    const dto = req.params.dto;
    getReportByDateRange(psabha,svote,dfrom,dto,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};