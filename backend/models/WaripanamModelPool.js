// assessmentModel.js
import db, { getConnection } from "../config/database.js";

///////////////////////// Wards /////////////////////////
export const insertWards = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO wards SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getSabhaWards = async (id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM wards WHERE sb_code = ? ORDER BY CAST(SUBSTRING(`ward`, 6) AS UNSIGNED)",
            [id]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Streets /////////////////////////
export const insertStreet = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO streets SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getSabhaStreets = async (sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM streets WHERE sb_code = ? ORDER BY street_name ASC",
            [sid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const getStreetsById = async (sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("SELECT * FROM streets WHERE street_id = ?", [sid]);
        return results;
    } finally {
        conn.release();
    }
};

export const UpdateStreetName = async (data, id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE streets SET street_name = ?, street_code = ? WHERE street_id = ?",
            [data.street_name, data.street_code, id]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Categories /////////////////////////
export const getMainCat = async () => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("SELECT * FROM asses_category");
        return results;
    } finally {
        conn.release();
    }
};

export const insertSubCat = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO asses_sub_category SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getSubCatBySabha = async (id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM asses_sub_category WHERE sb_code = ?",
            [id]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const getSubCatById = async (subid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM asses_sub_category WHERE sub_id = ?",
            [subid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const UpdateSubCategory = async (data, sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE asses_sub_category SET sub_cat_name = ? WHERE sub_id = ?",
            [data.sub_cat_name, sid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Rates /////////////////////////
export const inserRate = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO asses_rates SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getSabhaRateval = async (rid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT ar.* 
             FROM asses_rates ar 
             WHERE ar.edit_date = (
                 SELECT MAX(sub.edit_date) 
                 FROM asses_rates sub 
                 WHERE sub.ward_id = ar.ward_id AND sub.street_id = ar.street_id AND sub.cat_id = ar.cat_id
             ) AND sb_code = ? 
             ORDER BY ward_id ASC`,
            [rid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const getRateByCategoty = async (sid, wid, stid, ctid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT warrant_cost_rate 
             FROM asses_rates 
             WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND cat_id = ?  
             ORDER BY edit_date DESC LIMIT 1`,
            [sid, wid, stid, ctid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Properties /////////////////////////
export const insertProperty = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO asses_property SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getSabhaProperties = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM asses_property WHERE sb_code = ? ORDER BY property_id ASC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const getPropertyById = async (pid, sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM asses_property WHERE sb_code = ? AND property_id = ?",
            [sid, pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const updatePropData = async (data, proid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `UPDATE asses_property SET ward_id=?, street_id=?, road_side=?, asses_num=?, cat_id=?, sub_cat_id=?,
            property_nature=?, unused_num=?, used_num=?, prop_value=?, prop_rate=?, warrant_cost_rate=?, use_status=?, 
            prop_address=?, yearly_value=?, q_one_val=?, q_two_val=?, q_three_val=?, q_four_val=?, arrears_val=?
            WHERE property_id=?`,
            [
                data.ward_id, data.street_id, data.road_side, data.asses_num, data.cat_id, data.sub_cat_id,
                data.property_nature, data.unused_num, data.used_num, data.prop_value, data.prop_rate, data.warrant_cost_rate,
                data.use_status, data.prop_address, data.yearly_value, data.q_one_val, data.q_two_val, data.q_three_val,
                data.q_four_val, data.arrears_val, proid
            ]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Owners /////////////////////////
export const insertOwner = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO assess_owners SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getPropOwners = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assesment_owner_details WHERE sb_code = ? AND end_date IS NULL ORDER BY property_id ASC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

export const getSingleOwner = async (oid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_owners WHERE o_id = ?",
            [oid]
        );
        return results;
    } finally {
        conn.release();
    }
};

// Check if property exists
export const checkProperyExist = async (pid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT property_id, owner_nic, owner_name, start_date, end_date FROM assess_owners WHERE property_id = ? AND sb_code = ?",
            [pid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};

// Update end date in assess_owners
export const UpdateEndDate = async (data, id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `UPDATE assess_owners 
             SET end_date = ?, trans_reson = ?, atd_num = ?, edit_by = ?, owner_status = ? 
             WHERE property_id = ? AND owner_status = 1`,
            [data.end_date, data.trans_reson, data.atd_num, data.edit_by, data.owner_status, id]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Temporary Invoice /////////////////////////
export const deletePivByPropId = async (id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "DELETE FROM tempory_invoice WHERE shopdid = ?",
            [id]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Payments /////////////////////////
export const insertPayment = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO payments SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getPaymentsByProperty = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM payments WHERE property_id = ? ORDER BY pay_date DESC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Arrears /////////////////////////
export const insertArrears = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO arrears SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getArrearsByProperty = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM arrears WHERE property_id = ? ORDER BY ar_date DESC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Excess /////////////////////////
export const insertExcess = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO excess SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getExcessByProperty = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM excess WHERE property_id = ? ORDER BY ex_date DESC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Transfers /////////////////////////
export const insertTransfer = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO transfers SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getTransfersByProperty = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM transfers WHERE property_id = ? ORDER BY trans_date DESC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};

///////////////////////// Online Invoice /////////////////////////
export const insertOnlineInvoice = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO online_invoice SET ?", [data]);
        return results;
    } finally {
        conn.release();
    }
};

export const getOnlineInvoiceByProperty = async (pid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM online_invoice WHERE property_id = ? ORDER BY inv_date DESC",
            [pid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Update warrant_cost_rate for properties by category
export const UpdateRateByCategoryValues = async (data, wid, sid, cid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `UPDATE asses_property 
             SET warrant_cost_rate = ? 
             WHERE ward_id = ? AND street_id = ? AND cat_id = ? AND sb_code = ?`,
            [data.warrant_cost_rate, wid, sid, cid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};

// Delete arrears by property id and sabha
export const arrearsdelete = async (pid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `DELETE FROM assess_arrears_update WHERE property_id = ? AND sabha_code = ?`,
            [pid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Delete all assess payments by invoice number
export const assessPaydelete = async (invno) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `DELETE FROM assess_payments WHERE invoice_num = ?`,
            [invno]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Check if payment details already exist
export const checkPaymentExist = async (pid, sb) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT property_id 
             FROM assess_quarter_amounts 
             WHERE property_id = ? AND sb_code = ?`,
            [pid, sb]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Delete excess by property id
export const excessdelete = async (pid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `DELETE FROM assess_excess_update 
             WHERE property_id = ? AND sabha_code = ?`,
            [pid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Select properties by ward, street, and category
export const getAllPropertybyCatList = async (sid, wid, stid, ctid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT * FROM asses_property 
             WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND cat_id = ? 
             ORDER BY property_id`,
            [sid, wid, stid, ctid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Select properties by ward and street
export const getAllPropertybystreet = async (sid, wid, stid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT * FROM asses_property 
             WHERE sb_code = ? AND ward_id = ? AND street_id = ? 
             ORDER BY property_id`,
            [sid, wid, stid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Select properties by street side
export const getAllPropertybystreetside = async (sid, wid, stid, side) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT * FROM asses_property 
             WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND road_side = ? 
             ORDER BY property_id`,
            [sid, wid, stid, side]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Select properties by ward
export const getAllPropertybyward = async (sid, wid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT * FROM asses_property 
             WHERE sb_code = ? AND ward_id = ? 
             ORDER BY property_id`,
            [sid, wid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get all quarter payment amounts for a sabha
export const getAllQuarterPayAmounts = async (sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_quarter_amounts WHERE sb_code = ?",
            [sid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get a single online assessment receipt by invoice number and property ID
export const getAssesReceipt = async (receipt, propid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM online_assess_invoice_bill WHERE invoice_num = ? AND property_id = ?",
            [receipt, propid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get row count for a sabha
export const getCountBySabha = async (cid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT COUNT(*) AS count FROM asses_property WHERE sb_code = ?",
            [cid]
        );
        return results[0].count; // Return the count value directly
    } finally {
        conn.release();
    }
};
// Check for last year arrears
export const getLastArrears = async (propid, sabha, qnum, yr) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM payment_details WHERE property_id = ? AND sb_code = ? AND quarter_num = ? AND paid_year < ?",
            [propid, sabha, qnum, yr]
        );
        return results; // Return the array of arrears
    } finally {
        conn.release();
    }
};
// Get payments by quarter
export const getPaymentsByQuarter = async (propid, sabha, qnum) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? AND quarter_num = ?",
            [propid, sabha, qnum]
        );
        return results; // Return all matching payment rows
    } finally {
        conn.release();
    }
};
// Get property payments by quarter and year
export const getProPaymentsByQuarter = async (propid, sabha, qnum, yr) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? AND quarter_num = ? AND paid_year = ?",
            [propid, sabha, qnum, yr]
        );
        return results; // Returns array of payments
    } finally {
        conn.release();
    }
};
// Get full payment history for a property, ordered by latest first
export const getProPaymentshis = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_payments WHERE property_id = ? AND sb_code = ? ORDER BY record_date DESC",
            [propid, sabha]
        );
        return results; // Returns an array of payments
    } finally {
        conn.release();
    }
};
// Get active property owner (owner_status = 1)
export const getPropertyOwner = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_owners WHERE property_id = ? AND sb_code = ? AND owner_status = 1",
            [propid, sabha]
        );
        return results; // Returns array of active owners
    } finally {
        conn.release();
    }
};
// Get active property owner details by property ID
export const getPropertyOwnerById = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assesment_owner_details WHERE property_id = ? AND sb_code = ? AND owner_status = 1",
            [propid, sabha]
        );
        return results; // return array of active owner details
    } finally {
        conn.release();
    }
};
// Get all active property owners by Sabha ID
export const getPropertyOwnerBysabha = async (sbid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_owners WHERE sb_code = ? AND owner_status = 1",
            [sbid]
        );
        return results; // return all active owners in this Sabha
    } finally {
        conn.release();
    }
};
// Get property transfer history by property ID and Sabha ID
export const getPropertyTransferById = async (pid, sid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assesment_owner_details WHERE property_id = ? AND sb_code = ? ORDER BY start_date DESC",
            [pid, sid]
        );
        return results; // returns full transfer history
    } finally {
        conn.release();
    }
};
// Get warrant cost rates by category values
export const getWarrantCostCatList = async (sid, wid, stid, ctid) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM asses_rates WHERE sb_code = ? AND ward_id = ? AND street_id = ? AND cat_id = ?",
            [sid, wid, stid, ctid]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get arrears data by property and sabha
export const getarrearsdata = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_arrears_update WHERE property_id = ? AND sabha_code = ?",
            [propid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get temporary assessment payments by property and sabha
export const getasspayTemp = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_payments_temp WHERE property_id = ? AND sb_code = ?",
            [propid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};

// Get excess payment updates by property and sabha
export const getexcessdata = async (propid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "SELECT * FROM assess_excess_update WHERE property_id = ? AND sabha_code = ?",
            [propid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get payment data by year and sabha
export const getpaymentdata = async (seldate, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT pr.ward_id, w.ward, 
                    SUM(ap.paid_amount) AS paid_amount,
                    SUM(ap.discount_given) AS discount_given
             FROM assess_payments ap
             JOIN asses_property pr ON pr.property_id = ap.property_id
             JOIN wards w ON w.ward_id = pr.ward_id
             WHERE ap.paid_date BETWEEN DATE_FORMAT(?, '%Y-01-01') AND ?
               AND ap.sb_code = ?
             GROUP BY pr.ward_id, w.ward`,
            [seldate, seldate, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Get total estimated assessment income by ward
export const gettotalESTAssincomeBYward = async (ward, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            `SELECT ap.ward_id, w.ward, 
                    SUM(ap.q_one_val) AS q1,
                    SUM(ap.q_two_val) AS q2,
                    SUM(ap.q_three_val) AS q3,
                    SUM(ap.q_four_val) AS q4,
                    SUM(ap.yearly_value) AS total_sum
             FROM asses_property ap
             JOIN wards w ON w.ward_id = ap.ward_id
             WHERE ap.ward_id = ? 
               AND ap.sb_code = ?
             GROUP BY ap.ward_id`,
            [ward, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
// Insert new arrears record
export const inserarrears = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO assess_arrears_update SET ?", [data]);
        return results.insertId; // return inserted record ID
    } finally {
        conn.release();
    }
};
// Insert new excess record
export const inserexcess = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO assess_excess_update SET ?", [data]);
        return results.insertId; // return the inserted record ID
    } finally {
        conn.release();
    }
};
// Insert into online_assess_invoice_temp
export const insertAssessReceipttemp = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO online_assess_invoice_temp SET ?", [data]);
        return results.insertId;
    } finally {
        conn.release();
    }
};

// Insert into online_assess_invoice
export const insertAssessReceipt = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO online_assess_invoice SET ?", [data]);
        return results.insertId;
    } finally {
        conn.release();
    }
};



// Insert into online_assess_invoice_bill_temp
export const insertAssessReceiptBillTemp = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO online_assess_invoice_bill_temp SET ?", [data]);
        return results.insertId;
    } finally {
        conn.release();
    }
};

// Insert into online_assess_invoice_bill
export const insertAssessReceiptBill = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO online_assess_invoice_bill SET ?", [data]);
        return results.insertId;
    } finally {
        conn.release();
    }
};
export const insertPay = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query("INSERT INTO assess_payments SET ?", [data]);
        return results.insertId; // Returns the inserted record ID
    } finally {
        conn.release();
    }
};
export const insertPayTemp = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "INSERT INTO assess_payments_temp SET ?",
            [data]
        );
        return results;
    } finally {
        conn.release();
    }
};
export const insertQuarterPay = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "INSERT INTO assess_quarter_amounts SET ?",
            [data]
        );
        return results;
    } finally {
        conn.release();
    }
};
export const insertToTransfer = async (data) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "INSERT INTO asses_property_transfer SET ?",
            [data]
        );
        return results;
    } finally {
        conn.release();
    }
};
export const tempQuaterPaydelete = async (pid, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "DELETE FROM assess_payments_temp WHERE property_id = ? AND sb_code = ?",
            [pid, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
export const updateOwnerInTransfer = async (data, id) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE assess_owners SET owner_name = ?, owner_nic = ?, owner_contact = ?, owner_address = ?, start_date = ? WHERE property_id = ?",
            [data.owner_name, data.owner_nic, data.owner_contact, data.owner_address, data.start_date, id]
        );
        return results;
    } finally {
        conn.release();
    }
};
export const updatearrears = async (data, id, sabha) => {
    const conn = await getConnection();
    try {
        const [results] = await conn.query(
            "UPDATE asses_property SET arrears_val = ? WHERE property_id = ? AND sb_code = ?",
            [data.arrears_val, id, sabha]
        );
        return results;
    } finally {
        conn.release();
    }
};
