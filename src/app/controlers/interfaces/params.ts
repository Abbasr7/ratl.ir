export class Parameters {
    _id: string;
    projectid:string;
    userid: string;
    percents:{
        salary: number,
        ghalebMasrafi: number,
        fixedCapital: number,
        workingCapital: number,
        bankLoansFromTotalCapital: number,
        bankInterestRate: number,
        installmentCount: number,
        rawMaterials: number,
    };
    profitAndLossPercents: {
        deprication: number,
        salary_var: number,
        salary_fix: number,
        rawMaterials_var: number,
        maintenance_var: number,
        maintenance_fix: number,
        administrativeAndSelling_var: number,
        unforeseen_var: number,
        unforeseen_fix: number,
        WEGT_var: number,
        WEGT_fix: number,
        Ads_var: number,
        preOperation_fix: number,
        workingCapital_fix: number,
        BFInterest_fix: number,
        bime_fix: number,
    };
    net:{
        building: number, // %
        equipment: number, // %
        vehicles: number, // %
        officeEquipment: number, // %
        preOperation: number, // %
        unforeseen: number // %
    };
    rate:{
        building: number, // %
        equipment: number, // %
        vehicles: number, // %
        officeEquipment: number, // %
        preOperation: number, // %
        unforeseen: number, // %
    };
    maintenance: {
        building: number, // %
        equipment: number, // %
        vehicles: number, // %
        officeEquipment: number, // %
        preOperation: number, // %
        unforeseen: number // %
    };
    basePrice: number;
    period: number;
    productionCapacity: number;
}