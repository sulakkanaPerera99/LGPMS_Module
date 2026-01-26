import{
    getDailyIncome
    
} from "../models/DailyIncomeModel.js";

export const dailyIncomeOfSabha=(req,res)=>{
    const id = req.params.id;
    const sbcode = req.params.sbcode;
    getDailyIncome(id,sbcode,(err,results)=> {
        if (err) {
            res.send(err);
        }else {
            res.json(results);
        }
    });
};
