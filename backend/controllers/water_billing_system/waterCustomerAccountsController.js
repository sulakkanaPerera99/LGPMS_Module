import { getProjectNumberByCode } from '../../models/water_billing_system/waterprojectsModel.js';
import { getCustomerCountBySabhaAndProject, insertCustomer, getCustomersBySabha } from '../../models/water_billing_system/waterCustomerAccountsModel.js';

export const registerCustomer = async (req, res) => {
    try {
        const {
            customerType,
            oldBillNumber,
            fullName,
            nic,
            propertyAddress,
            mailingAddress,
            contactInfo,
            connectionType,
            projectCode,
            isSamurdhi,
            samurdhiNumber,
            isMetered,
            sabha_code
        } = req.body;

        // Validation
        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // Business Logic: Bill Number Generation
        // 1. Sabha Suffix: Last 3 digits of sabha_code
        const sabhaSuffix = String(sabha_code).slice(-3);

        // 2. Project Number: Fetch from DB based on projectCode or default to '00'
        let projectNum = '00';
        if (projectCode) {
            const fetchedProjectNum = await getProjectNumberByCode(projectCode, sabha_code);
            if (fetchedProjectNum !== null && fetchedProjectNum !== undefined) {
                projectNum = String(fetchedProjectNum).padStart(2, '0');
            }
        }

        // 3. Account Type Code
        let accountTypeCode = '1'; // Default
        if (customerType) {
            const type = customerType.toLowerCase();
            if (type === 'domestic') {
                accountTypeCode = '1';
            } else if (type === 'commercial') {
                accountTypeCode = '2';
            } else if (type.includes('industrial') || type.includes('construction')) {
                accountTypeCode = '3';
            }
        }

        // 4. Samurdhi Status Code
        const isSamurdhiBool = (isSamurdhi === true || isSamurdhi === 'true' || isSamurdhi === 1);
        const samurdhiCode = isSamurdhiBool ? '1' : '0';

        // 5. Metered Status Code
        const isMeteredBool = (isMetered === true || isMetered === 'true' || isMetered === 1);
        const meteredCode = isMeteredBool ? '1' : '0';

        // 6. Serial Number
        const customerCount = await getCustomerCountBySabhaAndProject(sabha_code, projectCode);
        const serialNum = String(customerCount + 1).padStart(3, '0');

        // Final Bill Number
        const newBillNumber = `${sabhaSuffix}${projectNum}${accountTypeCode}${samurdhiCode}${meteredCode}${serialNum}`;

        // Data Mapping (camelCase -> snake_case)
        const customerData = {
            customer_type: customerType,
            old_bill_number: oldBillNumber,
            new_bill_number: newBillNumber,
            full_name: fullName,
            nic: nic,
            property_address: propertyAddress,
            mailing_address: mailingAddress,
            contact_info: contactInfo,
            connection_type: connectionType,
            project_code: projectCode,
            is_samurdhi: isSamurdhi,
            samurdhi_number: samurdhiNumber,
            is_metered: isMetered,
            sabha_code: sabha_code,
            status: 1 //Default status set to 1 (Active)
        };

        // Insert into DB
        await insertCustomer(customerData);

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: { new_bill_number: newBillNumber }
        });

    } catch (error) {
        console.error("Error registering customer:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const { sabha_code } = req.params;
        const { search, sort, connectionTypes, samurdhi, metered, status, projectCode } = req.query;

        if (!sabha_code) {
            return res.status(400).json({ success: false, message: "Sabha Code is required" });
        }

        // Build filters object
        const filters = {};

        if (search && search.trim()) filters.search = search.trim();
        if (sort) filters.sort = sort;
        if (connectionTypes) {
            filters.connectionTypes = connectionTypes.split(',').map(type => type.trim()).filter(type => type);
        }

        // Samurdhi filter
        if (samurdhi) {
            const samurdhiValues = samurdhi.split(',').map(val => val.trim()).filter(val => val);
            filters.isSamurdhi = samurdhiValues.map(val => {
                if (val === 'Samurdhi') return 1;
                if (val === 'Not Samurdhi') return 0;
                return null;
            }).filter(val => val !== null);
        }

        // Metered filter
        if (metered) {
            const meteredValues = metered.split(',').map(val => val.trim()).filter(val => val);
            filters.isMetered = meteredValues.map(val => {
                if (val === 'Metered') return 1;
                if (val === 'Not Metered') return 0;
                return null;
            }).filter(val => val !== null);
        }

        // Status filter (UPDATED LOGIC)
        // Maps 'Active' -> 1 and 'Inactive' -> 0
        if (status) {
            const statusValues = status.split(',').map(stat => stat.trim()).filter(stat => stat);
            filters.status = statusValues.map(val => {
                const v = val.toLowerCase();
                if (v === 'active' || v === '1') return 1;
                if (v === 'inactive' || v === '0') return 0;
                return null;
            }).filter(val => val !== null);
        }

        const customers = await getCustomersBySabha(sabha_code, projectCode, filters);

        return res.status(200).json(customers);

    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};