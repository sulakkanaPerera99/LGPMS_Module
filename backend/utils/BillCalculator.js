// 1. Usage Charge Calculation (Telescopic Method) - No Changes
const calculateSlabAmount = (units, slabList) => {
    let remainingUnits = units;
    let totalUsageCharge = 0;
    
    // Sort slabs by min value
    const sortedSlabs = slabList.sort((a, b) => a.min - b.min);

    for (const slab of sortedSlabs) {
        if (remainingUnits <= 0) break;

        let rangeSize;

        // Max 0 means "Infinity"
        if (slab.max === 0 || slab.max === null) {
            rangeSize = Infinity; 
        } else {
            rangeSize = slab.max - slab.min + 1;
        }

        let unitsForThisSlab = Math.min(remainingUnits, rangeSize);
        totalUsageCharge += unitsForThisSlab * parseFloat(slab.rate);
        remainingUnits -= unitsForThisSlab;
    }
    return totalUsageCharge;
};

/**
 * 2. Dynamic Amount Calculation (Helper Function)
 * Fixed සහ Percentage යන දෙකම මෙය හරහා ගණනය වේ.
 * @param {Array} itemsList - Frontend එකෙන් එන Charges හෝ Discounts Array එක
 * @param {Number} baseAmount - ප්‍රතිශතය ගණනය කිරීමට අදාල මූලික අගය (Sub Total)
 */
const calculateDynamicAmount = (itemsList, baseAmount = 0) => {
    let total = 0;

    if (Array.isArray(itemsList)) {
        itemsList.forEach(item => {
            let itemAmount = 0;
            // Frontend එකෙන් එන value එක (Rate එක හෝ Fixed Amount එක)
            const rateOrValue = parseFloat(item.amount || item.value || 0);

            // Type එක check කරනවා (fixed ද? percentage ද?)
            const type = (item.type || 'fixed').toLowerCase().trim();

            if (type === 'percentage' || type === '%') {
                // ප්‍රතිශතයක් නම්: (Base Amount * Rate) / 100
                // උදා: බිල රු. 1000 නම්, 10% බද්දක් සඳහා = (1000 * 10) / 100 = 100
                itemAmount = (baseAmount * rateOrValue) / 100;
            } else {
                // ස්ථාවර මුදලක් නම් කෙලින්ම එකතු කරනවා
                itemAmount = rateOrValue;
            }

            total += itemAmount;
        });
    }
    
    return total;
};

// 3. MAIN BILL CALCULATION FUNCTION
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

    // B. Database Query
    const query = `
        SELECT * FROM water_billing_configurations 
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
        throw new Error(`Billing Config Not Found! Details -> Sabha: ${data.sabha_code}, Type: ${data.connection_type}`);
    }

    const config = configs[0];

    // C. Parsing JSON Data
    const unitRanges = typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : config.unit_ranges;
    
    const otherChargesList = typeof config.other_charges === 'string' 
        ? JSON.parse(config.other_charges) 
        : (config.other_charges || []);

    const discountsList = typeof config.discounts === 'string' 
        ? JSON.parse(config.discounts) 
        : (config.discounts || []);

    // ---------------------------------------------------------
    // D. Calculations (UPDATED LOGIC)
    // ---------------------------------------------------------

    // 1. Usage Charge (Water Consumption Charge)
    const waterCharge = calculateSlabAmount(unitsConsumed, unitRanges);

    // 2. Fixed Charge Calculation
    let fixedCharge = parseFloat(config.fixed_rate) || 0;

    if (Array.isArray(unitRanges)) {
        const matchingSlab = unitRanges.find(slab => {
            const min = parseFloat(slab.min);
            const max = (slab.max === 0 || slab.max === null) ? Infinity : parseFloat(slab.max);
            return unitsConsumed >= min && unitsConsumed <= max;
        });

        if (matchingSlab && matchingSlab.fixed_charge && parseFloat(matchingSlab.fixed_charge) > 0) {
            fixedCharge = parseFloat(matchingSlab.fixed_charge);
        }
    }

    // =========================================================
    // 🟢 NEW: Base Amount for Percentage Calculations
    // =========================================================
    // වෙනත් ගාස්තු සහ වට්ටම් ප්‍රතිශතයක් ලෙස ගණනය කිරීමට මූලික අගය මෙයයි.
    // Base Amount = Water Usage Charge + Fixed Charge
    const subTotal = waterCharge + fixedCharge;

    // 3. Other Charges Calculation (Using Helper Function)
    // මෙතන subTotal එක pass කරනවා ප්‍රතිශත ගණනය කරන්න
    const otherChargesTotal = calculateDynamicAmount(otherChargesList, subTotal);

    // 4. Discounts Calculation (Using Helper Function)
    // වට්ටම් ගණනය කරන්නෙත් subTotal (Bill Amount) එක මතයි
    const discountAmount = 0;

    // 5. Final Totals
    // මාසික ගාස්තුව = (ජල ගාස්තුව + ස්ථාවර ගාස්තුව + වෙනත් ගාස්තු) - වට්ටම්
    const monthlyTotal = subTotal + otherChargesTotal;
    
    // මුළු ගෙවිය යුතු මුදල = මාසික ගාස්තුව + හිඟ මුදල්
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