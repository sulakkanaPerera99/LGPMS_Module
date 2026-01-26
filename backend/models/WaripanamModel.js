// import connection
import db from "../config/database.js";

// save wards
export const insertWards = (data,result) => {
    db.query("INSERT INTO wards SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get wards by sabha
export const getSabhaWards = (id,result) => {
    db.query("SELECT * FROM wards WHERE sb_code = ? ORDER BY CAST(SUBSTRING(`ward`, 6) AS UNSIGNED)",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//save street record
export const insertStreet = (data,result) => {
    db.query("INSERT INTO streets SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

//get streets by sabha
export const getSabhaStreets = (sid,result) => {
    db.query("SELECT * FROM streets WHERE sb_code = ? ORDER BY street_name ASC",[sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// get categories(cat1) for all sabha
export const getMainCat = (result) => {
    db.query("SELECT * FROM asses_category", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save sub categories to asses_sub_category
export const insertSubCat = (data,result) => {
    db.query("INSERT INTO asses_sub_category SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get all sub categories of sabha
export const getSubCatBySabha = (id,result) => {
    db.query("SELECT * FROM asses_sub_category WHERE sb_code = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get strret by id
export const getStreetsById = (sid,result) => {
    db.query("SELECT * FROM streets WHERE street_id = ?",[sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update street name
export const UpdateStreetName = (data,id,result) => {
    db.query("UPDATE streets SET street_name = ?,street_code=? WHERE street_id = ?",[data.street_name,data.street_code, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get ub category by id
export const getSubCatById = (subid,result) => {
    db.query("SELECT * FROM asses_sub_category WHERE sub_id = ?",[subid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update sub category name
export const UpdateSubCategory = (data,sid,result) => {
    db.query("UPDATE asses_sub_category SET sub_cat_name = ? WHERE sub_id = ?",[data.sub_cat_name, sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// save rates
export const inserRate = (data,result) => {
    db.query("INSERT INTO asses_rates SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get rates by sabha
export const getSabhaRateval = (rid,result) => {
    // db.query("SELECT * FROM asses_rates WHERE sb_code = ? ORDER BY ward_id ASC",[rid], (err,results)=> {
        db.query("SELECT ar.* FROM asses_rates ar WHERE ar.edit_date = ( SELECT MAX(sub.edit_date) FROM asses_rates sub WHERE sub.ward_id = ar.ward_id AND sub.street_id = ar.street_id AND sub.cat_id = ar.cat_id ) AND sb_code = ? ORDER BY ward_id ASC",[rid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
 //get row count for a sabha
export const getCountBySabha = (cid,result) => {
    db.query("SELECT COUNT(*)  FROM asses_property WHERE sb_code = ? ",[cid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save property
export const insertProperty = (data,result) => {
    db.query("INSERT INTO asses_property SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//get properties by sabha
export const getSabhaProperties = (pid,result) => {
    db.query("SELECT * FROM asses_property WHERE sb_code = ? ORDER BY property_id ASC",[pid], (err,results)=> {
      
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save owner 
export const insertOwner = (data,result) => {
    db.query("INSERT INTO assess_owners SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get property owners from the view
export const getPropOwners = (pid,result) => {
    db.query("SELECT * FROM assesment_owner_details WHERE sb_code = ? AND end_date IS NULL ORDER BY property_id ASC",[pid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get a single property owner for edit
export const getSingleOwner = (oid,result) => {
    db.query("SELECT *  FROM assess_owners WHERE o_id = ? ",[oid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//check if property already exists
export const checkProperyExist = (pid,sabha,result) => {
    db.query("SELECT property_id,owner_nic,owner_name,start_date,end_date  FROM assess_owners WHERE property_id = ? AND sb_code=? ",[pid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//add record to asses_property_transfer
export const insertToTransfer = (data,result) => {
    db.query("INSERT INTO asses_property_transfer SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//update end_date in assess_owners table
export const UpdateEndDate = (data,id,result) => {
    db.query("UPDATE assess_owners SET end_date = ?,trans_reson = ?, atd_num=?, edit_by = ?, owner_status = ? WHERE property_id = ? and owner_status=1 ",[data.end_date, data.trans_reson, data.atd_num, data.edit_by,data.owner_status, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update assess_owners when transferring property
export const updateOwnerInTransfer= (data,id,result) => {
    db.query("UPDATE assess_owners SET owner_name = ?, owner_nic = ?, owner_contact = ?, owner_address = ?, start_date = ? WHERE property_id = ?",[data.owner_name, data.owner_nic, data.owner_contact, data.owner_address,data.start_date, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get property transfer by sabha and property id
export const getPropertyTransferById = (pid,sid,result) => {
    db.query("SELECT * FROM assesment_owner_details WHERE property_id=? AND sb_code = ? ORDER BY start_date DESC",[pid,sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//save quarter payments
export const insertQuarterPay = (data,result) => {
    db.query("INSERT INTO assess_quarter_amounts SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
//check if payment details already exists
export const checkPaymentExist = (pid,sb,result) => {
    db.query("SELECT property_id  FROM assess_quarter_amounts WHERE property_id = ? AND sb_code=? ",[pid,sb], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get all quarterpayment amounts
export const getAllQuarterPayAmounts = (sid,result) => {
    db.query("SELECT *  FROM assess_quarter_amounts WHERE sb_code = ? ",[sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//select properties by 3 categories
export const getAllPropertybyCatList = (sid,wid,stid,ctid,result) => {
    db.query("SELECT *  FROM asses_property WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND cat_id = ? ORDER BY property_id",[sid,wid,stid,ctid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//select properties by ward
export const getAllPropertybyward = (sid,wid,result) => {
    db.query("SELECT *  FROM asses_property WHERE sb_code = ? AND ward_id = ? ORDER BY property_id",[sid,wid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//select properties by street
export const getAllPropertybystreet = (sid,wid,stid,result) => {
    db.query("SELECT *  FROM asses_property WHERE sb_code = ? AND ward_id = ? AND street_id = ? ORDER BY property_id",[sid,wid,stid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//select properties by streetside
export const getAllPropertybystreetside = (sid,wid,stid,side,result) => {
    db.query("SELECT *  FROM asses_property WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND road_side=? ORDER BY property_id",[sid,wid,stid,side], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//select getWarrantCostCatList
export const getWarrantCostCatList = (sid,wid,stid,ctid,result) => {
    db.query("SELECT *  FROM asses_rates WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND cat_id = ?",[sid,wid,stid,ctid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get property by id and sabha 
export const getPropertyById = (pid,sid,result) => {
    db.query("SELECT * FROM asses_property WHERE sb_code = ? AND property_id = ? ",[pid,sid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get property owners details by propid  from the view
export const getPropertyOwnerById = (propid,sabha,result) => {
    db.query("SELECT * FROM assesment_owner_details WHERE property_id = ? AND sb_code = ?  AND owner_status =1 ",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//get property owners details by propid  from the view
export const getPropertyOwner= (propid,sabha,result) => {
    db.query("SELECT * FROM assess_owners WHERE property_id = ? AND sb_code = ? AND owner_status =1 ",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


//get property owners details by  sabha from the view
export const getPropertyOwnerBysabha = (sbid,result) => {
    db.query("SELECT * FROM assess_owners WHERE sb_code = ? AND owner_status =1 ",[sbid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//update rate for all the properties in this ward,street,category
export const UpdateRateByCategoryValues = (data,wid,sid,cid,sabha,result) => {
    db.query("UPDATE asses_property SET warrant_cost_rate = ? WHERE ward_id = ? AND street_id = ? AND cat_id = ? AND sb_code =? ",[data.warrant_cost_rate, wid,sid,cid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get quarter wise payments made for a property *****TO EDIT change this to fiter from year too*************
export const getPaymentsByQuarter = (propid,sabha,qnum,result) => {
    db.query("SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? AND quarter_num = ? ",[propid,sabha,qnum], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// quartetwise payments for property for year getting from the view
export const getProPaymentsByQuarter = (propid,sabha,qnum,yr,result) => {
    db.query("SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? AND quarter_num = ? AND paid_year = ? ",[propid,sabha,qnum,yr], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//get rate by category ward and street
export const getRateByCategoty = (sid,wid,stid,ctid,result) => {
    db.query("SELECT warrant_cost_rate FROM asses_rates WHERE sb_code = ? AND ward_id =? AND street_id=? AND cat_id=?  ORDER BY edit_date DESC   LIMIT 1 ",[sid,wid,stid,ctid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
// delete all piv from temporary invoice table by property id
export const deletePivByPropId = (id,result) =>  {
    db.query("DELETE FROM tempory_invoice WHERE shopdid = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};
//check for last year arrears
export const getLastArrears = (propid,sabha,qnum,yr,result) => {
    db.query("SELECT * FROM payment_details WHERE property_id = ? AND sb_code = ? AND quarter_num = ? AND paid_year < 2024 ",[propid,sabha,qnum,yr], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//save asse_payments_temp
export const insertPayTemp = (data,result) => {
    db.query("INSERT INTO assess_payments_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};


export const insertPay = (data,result) => {
    db.query("INSERT INTO assess_payments SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

//get data from ass paymment temp
export const getasspayTemp = (propid,sabha,result) => {
    db.query("SELECT * FROM assess_payments_temp WHERE property_id = ? AND sb_code = ?",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// delete all ass payment  by property id
export const tempQuaterPaydelete = (pid,sabha,result) =>  {
    db.query("DELETE FROM assess_payments_temp WHERE property_id = ? AND sb_code=?",[pid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// delete all ass payment  by property id
export const assessPaydelete = (invno,result) =>  {
    db.query("DELETE FROM assess_payments WHERE invoice_num = ?",[invno], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//update assess_owners when transferring property
export const updatearrears= (data,id,sabha,result) => {
    db.query("UPDATE asses_property SET arrears_val = ? WHERE property_id = ? AND sb_code=?",[data.arrears_val,id,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// save excess
export const inserexcess = (data,result) => {
    db.query("INSERT INTO assess_excess_update SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// delete excess by property id
export const excessdelete = (pid,sabha,result) =>  {
    db.query("DELETE FROM assess_excess_update WHERE property_id = ? AND sabha_code=?",[pid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//get data from excess paymment update temp
export const getexcessdata = (propid,sabha,result) => {
    db.query("SELECT * FROM assess_excess_update WHERE property_id = ? AND sabha_code = ?",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// save arrears
export const inserarrears = (data,result) => {
    db.query("INSERT INTO assess_arrears_update SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// delete arrears by property id
export const arrearsdelete = (pid,sabha,result) =>  {
    db.query("DELETE FROM assess_arrears_update WHERE property_id = ? AND sabha_code=?",[pid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//get data from arrears paymment update temp
export const getarrearsdata = (propid,sabha,result) => {
    db.query("SELECT * FROM assess_arrears_update WHERE property_id = ? AND sabha_code = ?",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//get data from Assessment paymment view update temp
// export const getpaymentdata = (seldate,sabha,result) => {
//     db.query("SELECT ap.ward_id,w.ward,SUM(ap.paid_amount) AS paid_amount,SUM(ap.discount_given) AS discount_given FROM assessment_payments ap JOIN wards w ON w.ward_id = ap.ward_id WHERE ap.paid_date BETWEEN DATE_FORMAT(?, '%Y-01-01') AND ? AND ap.sb_code = ? GROUP BY ap.ward_id",[seldate,seldate,sabha], (err,results)=> {
//         if (err){
//             console.log(err);
//             result(err,null);
//         }else{
//             result(null,results);
//         }
//     });
// };

export const getpaymentdata = (seldate, sabha, result) => {
    db.query(
        "SELECT pr.ward_id,w.ward,SUM(ap.paid_amount) AS paid_amount,SUM(ap.discount_given) AS discount_given "+
"FROM assess_payments ap "+
"JOIN asses_property pr ON pr.property_id = ap.property_id "+
"JOIN wards w ON w.ward_id = pr.ward_id "+ 
"WHERE ap.paid_date BETWEEN DATE_FORMAT(?, '%Y-01-01') AND ? "+
"AND ap.sb_code = ? "+ 
"GROUP BY pr.ward_id, w.ward",
        [seldate, seldate, sabha],
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};

//get data from excess paymment update temp
export const gettotalESTAssincomeBYward= (ward,sabha,result) => {
    db.query("SELECT ap.ward_id, w.ward, SUM(ap.`q_one_val`) AS q1,SUM(ap.`q_two_val`) AS q2,SUM(ap.`q_three_val`) AS q3,SUM(ap.`q_four_val`) AS q4,"+
"SUM(yearly_value) AS total_sum "+
"FROM asses_property ap "+ 
"JOIN wards w ON w.ward_id = ap.ward_id "+ 
"WHERE ap.ward_id=? "+
"AND ap.sb_code =? "+
"GROUP BY ap.ward_id;",[ward,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get all payments for property 
export const getProPaymentshis = (propid,sabha,result) => {
    db.query("SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? ORDER BY record_date DESC",[propid,sabha], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

//////////////////update property//////////////////////////////
export const updatePropData = (data, proid, result) => {
    db.query(
        "UPDATE asses_property SET ward_id = ?," +
"street_id=?,"+
"road_side=?,"+
"asses_num=?,"+
"cat_id=?,"+
"sub_cat_id=?,"+
"property_nature=?,"+
"unused_num=?,"+
"used_num=?,"+
"prop_value=?,"+
"prop_rate=?,"+
"warrant_cost_rate=?,"+
"use_status=?,"+
"prop_address=?,"+
"yearly_value=?,"+
"q_one_val=?,"+
"q_two_val=?,"+
"q_three_val=?,"+
"q_four_val=?,"+
"arrears_val=?"+
"WHERE property_id = ?",
[data.ward_id,
    data.street_id,
    data.road_side,
    data.asses_num,
    data.cat_id,
    data.sub_cat_id,
    data.property_nature,
    data.unused_num,
    data.used_num,
    data.prop_value,
    data.prop_rate,
    data.warrant_cost_rate,
    data.use_status,
    data.prop_address,
    data.yearly_value,
    data.q_one_val,
    data.q_two_val,
    data.q_three_val,
    data.q_four_val,
    data.arrears_val,
    proid],
        (err, results) => {
            if (err) {
                console.log(err);
                result(err, null);
            } else {
                result(null, results);
            }
        }
    );
};



/////////////////////////////////////////////online system model////////////////////////////////////////////////////////////////
export const insertAssessReceipttemp = (data,result) => {
    db.query("INSERT INTO online_assess_invoice_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
export const insertAssessReceipt = (data,result) => {
    db.query("INSERT INTO online_assess_invoice SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};
// get single rent-for-shop
export const getAssesReceipt = (receipt,propid,result) => {
    db.query("SELECT * FROM online_assess_invoice_bill WHERE invoice_num = ? AND property_id = ? ",[receipt,propid], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const insertAssessReceiptBillTemp = (data,result) => {
    db.query("INSERT INTO online_assess_invoice_bill_temp SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

export const insertAssessReceiptBill = (data,result) => {
    db.query("INSERT INTO online_assess_invoice_bill SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

