// import connection
import db from "../config/database.js";

// get all  rent-for-shop
export const getAssessmentTax = (result) => {
    db.query("SELECT * FROM  assessment_tax", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single rent-for-shop
export const getAssessmentTaxById = (id,result) => {
    db.query("SELECT * FROM assessment_tax WHERE tax_cus_nic = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get single rent-for-shop
export const getAssessmentTaxReceipt = (receipt,taxnic,result) => {
    db.query("SELECT * FROM assessment_tax WHERE tax_invoice_num = ? AND tax_cus_nic = ? ",[receipt,taxnic], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get online assesment tax payment for single sabha
export const getAssessmentTaxBySabha = (sid,cdate,result) => {
    db.query("SELECT * FROM assessment_tax WHERE tax_sabha_code = ? AND is_printed='NOT' AND  DATE(tax_cur_date) = ? ",[sid,cdate], (err,results)=> {
    // db.query("SELECT * FROM assessment_tax AS t,assesmenttax_invoice AS i WHERE t.tax_sabha_code = ? AND i.invoice_num<>t.tax_invoice_num AND  DATE(t.tax_cur_date) = ? ",[sid,cdate], (err,results)=> {
    // db.query("SELECT * FROM assessment_tax WHERE tax_sabha_code=? AND DATE(tax_cur_date) = ? ",[sid,cdate], (err,results)=> {
     
    
    if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get details by invoice
export const getAssesByInvoice = (inv,result) => {
    db.query("SELECT * FROM assessment_tax WHERE tax_invoice_num = ?",[inv], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert details of online aasesment tx payments by subject
export const asTaxAddDetails = (data,result) => {
    db.query("INSERT INTO assesmenttax_invoice_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// insert details of online aasesment tx payments when print
export const saveAsTaxAddDetails = (data,result) => {
    db.query("INSERT INTO assesmenttax_invoice SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// create invoice
export const CreateInvoiceforAsses = (invnum,result) => {
    db.query("SELECT * FROM assesmenttax_invoice_temp WHERE invoice_num = ?",[invnum], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update assesment tax table print column
export const updateAsPrint = (data,prin,result) => {
    db.query("UPDATE assessment_tax SET is_printed = ? WHERE tax_invoice_num = ?",[data.is_printed, prin], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//Delete from tempory table 
export const deleteTempInvbyNumber = (id,result) => {
    db.query("DELETE FROM assesmenttax_invoice_temp WHERE invoice_num  = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get data to invoice print FROM TEMP TABLE
// export const getAssesByInvoice = (inv,result) => {
//     db.query("SELECT * FROM assessment_tax WHERE tax_invoice_num = ?",[inv], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };
// insert rent-for-shop
// export const insertshopRents = (data,result) => {
//     db.query("INSERT INTO rent_for_shop SET ?",data, (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };


// // get single rent-for-shop by date and month
// export const getshopRentsByDate = (sabhaid,payyear,paymonth,cusnic,placeid,shopid,result) => {
//     db.query("SELECT * FROM rent_for_shop WHERE rent_sabha_code=? AND rent_year=? AND rent_month=? AND rent_cus_nic = ? AND rent_shop_place=? AND rent_shop_no=?",[sabhaid,payyear,paymonth,cusnic,placeid,shopid], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

// // update Food
// export const updateFoodById = (data,id,result) => {
//     db.query("UPDATE food SET food_name = ?, food_price = ? WHERE food_id = ?",[data.food_name, data.food_price, id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };


// delete rent-for-shop
// export const deleteshopRentsById = (id,result) => {
//     db.query("DELETE FROM rent_for_shop WHERE rent_shop_code  = ?",[id], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };