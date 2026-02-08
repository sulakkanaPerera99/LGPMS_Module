// 1. Usage Charge Calculation (Telescopic Method) - මේකේ වෙනසක් නෑ
const calculateSlabAmount = (units, slabList) => {
    let remainingUnits = units;
    let totalUsageCharge = 0;
    
    // Sort slabs by min value
    const sortedSlabs = slabList.sort((a, b) => a.min - b.min);

    for (const slab of sortedSlabs) {
        if (remainingUnits <= 0) break;

        let rangeSize;

        // Max 0 means "Infinity" or "Rest of the units"
        if (slab.max === 0 || slab.max === null) {
            rangeSize = Infinity; 
        } else {
            rangeSize = slab.max - slab.min + 1;
        }

        // Calculate units for this specific slab
        let unitsForThisSlab = Math.min(remainingUnits, rangeSize);
        
        // This calculates only the Usage Price (Rate * Units)
        totalUsageCharge += unitsForThisSlab * parseFloat(slab.rate);
        remainingUnits -= unitsForThisSlab;
    }
    return totalUsageCharge;
};

// 2. Calculate Other Charges - මේකෙත් වෙනසක් නෑ
const calculateOtherCharges = (chargesList) => {
    let total = 0;
    if (Array.isArray(chargesList)) {
        chargesList.forEach(charge => {
            total += parseFloat(charge.amount || charge.value || 0);
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
        throw new Error(`Billing Config Not Found! Details -> Sabha: ${data.sabha_code}, Type: ${data.connection_type}`);
    }

    const config = configs[0];

    // C. Parsing JSON
    const unitRanges = typeof config.unit_ranges === 'string' ? JSON.parse(config.unit_ranges) : config.unit_ranges;
    const otherChargesList = typeof config.other_charges === 'string' ? JSON.parse(config.other_charges) : config.other_charges;

    // ---------------------------------------------------------
    // D. Calculations (UPDATED LOGIC HERE)
    // ---------------------------------------------------------

    // 1. Usage Charge (Telescopic)
    const waterCharge = calculateSlabAmount(unitsConsumed, unitRanges);

    // 2. Fixed Charge Calculation ✅
    // Step 1: Default to the global Fixed Rate (e.g., Officer set Electricity Bill base rate)
    let fixedCharge = parseFloat(config.fixed_rate) || 0;

    // Step 2: Check if the current consumption falls into a Slab with a specific Fixed Charge
    if (Array.isArray(unitRanges)) {
        // Find the specific slab that covers the Total Units Consumed
        const matchingSlab = unitRanges.find(slab => {
            const min = parseFloat(slab.min);
            // Handle max=0 as Infinity
            const max = (slab.max === 0 || slab.max === null) ? Infinity : parseFloat(slab.max);
            
            return unitsConsumed >= min && unitsConsumed <= max;
        });

        // If a matching slab is found AND it has a specific fixed_charge defined
        if (matchingSlab && matchingSlab.fixed_charge && parseFloat(matchingSlab.fixed_charge) > 0) {
            fixedCharge = parseFloat(matchingSlab.fixed_charge);
            // console.log(`Slab-based Fixed Charge Applied: ${fixedCharge} (Range: ${matchingSlab.min}-${matchingSlab.max})`);
        }
    }

    // 3. Other Charges & Discount
    const otherChargesTotal = calculateOtherCharges(otherChargesList);
    const discountAmount = parseFloat(config.discounts) || 0;

    // 4. Final Totals
    const monthlyTotal = (waterCharge + fixedCharge + otherChargesTotal) - discountAmount;
    const totalAmount = monthlyTotal + previousDues;

    return {
        units_consumed: unitsConsumed,
        water_consumption_charge: waterCharge.toFixed(2),
        fixed_charge: fixedCharge.toFixed(2), // This will now reflect either Slab-based or Electricity-based
        other_charges: otherChargesTotal.toFixed(2),
        discounts: discountAmount.toFixed(2),
        monthly_charge: monthlyTotal.toFixed(2),
        previous_dues: previousDues.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        applied_config_id: config.id 
    };
};