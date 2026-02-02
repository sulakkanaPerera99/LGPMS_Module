// utils/BillCalculator.js

const calculateSlabAmount = (units, slabList) => {
    let remainingUnits = units;
    let totalUsageCharge = 0;
    // Sort slabs just in case logic
    const sortedSlabs = slabList.sort((a, b) => a.min - b.min);

    for (const slab of sortedSlabs) {
        if (remainingUnits <= 0) break;
        let rangeSize = slab.max - slab.min + 1;
        let unitsForThisSlab = Math.min(remainingUnits, rangeSize);
        totalUsageCharge += unitsForThisSlab * parseFloat(slab.rate);
        remainingUnits -= unitsForThisSlab;
    }
    return totalUsageCharge;
};

const calculateOtherCharges = (chargesList) => {
    let total = 0;
    if (Array.isArray(chargesList)) {
        chargesList.forEach(charge => {
            total += parseFloat(charge.amount || charge.value || 0);
        });
    }
    return total;
};

export const calculateBill = async (connection, data, previousDues = 0) => {
    // A. Units Calculation
    const currentReading = parseFloat(data.current_reading);
    const previousReading = parseFloat(data.previous_reading);
    
    if (currentReading < previousReading) {
        throw new Error("Invalid Reading: Current reading is less than previous reading.");
    }

    const unitsConsumed = currentReading - previousReading;

    // Inputs Sanitization
    const samurdhiValue = (data.is_samurdhi === true || data.is_samurdhi === 1 || data.is_samurdhi === '1') ? 1 : 0;
    const meteredValue = (data.is_metered === true || data.is_metered === 1 || data.is_metered === '1') ? 1 : 0;

    // B. Database Query (Fallback Logic Included)
    const query = `
        SELECT * FROM billing_configurations 
        WHERE sabha_code = ? 
        AND connection_type = ? 
        AND status = 1 
        AND (project_code = ? OR project_code IS NULL)
        AND (is_samurdhi = ? OR is_samurdhi = 0)
        AND (is_metered = ? OR is_metered = 0)
        ORDER BY 
            project_code DESC, 
            is_samurdhi DESC, 
            is_metered DESC
        LIMIT 1
    `;

    const [configs] = await connection.query(query, [
        data.sabha_code,
        data.connection_type,
        data.project_code,
        samurdhiValue,
        meteredValue
    ]);

    if (configs.length === 0) {
        throw new Error(`Billing Config Not Found! Details -> Sabha: ${data.sabha_code}, Type: ${data.connection_type}, Samurdhi: ${samurdhiValue}, Metered: ${meteredValue}`);
    }

    const config = configs[0];

    // C. Parsing JSON
    const unitRanges = typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : config.unit_ranges;
    const otherChargesList = typeof config.other_charges === 'string' ? JSON.parse(config.other_charges) : config.other_charges;

    // D. Calculations
    const waterCharge = calculateSlabAmount(unitsConsumed, unitRanges);
    const fixedCharge = parseFloat(config.fixed_rate) || 0;
    const otherChargesTotal = calculateOtherCharges(otherChargesList);
    const discountAmount = parseFloat(config.discounts) || 0;

    const monthlyTotal = (waterCharge + fixedCharge + otherChargesTotal) - discountAmount;
    const totalAmount = monthlyTotal + previousDues;

    return {
        units_consumed: unitsConsumed,
        water_consumption_charge: waterCharge.toFixed(2),
        fixed_charge: fixedCharge.toFixed(2),
        other_charges: otherChargesTotal.toFixed(2),
        discounts: discountAmount.toFixed(2),
        monthly_charge: monthlyTotal.toFixed(2),
        previous_dues: previousDues.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        applied_config_id: config.id 
    };
};