export class SuccessHandle {
    message: string;
    data: any
}

export interface IRole {
    _id: string,
    nameid: string,
    title: string,
    access: string[]
}

export class IUser {
    _id: string;
    username: string;
    email: string;
    fullname: string;
    address: string;
    role: IRole;
    phone: string;
    imgurl: String
}

export class Iplans {
    _id: string;
    title: string;
    time: {
        month: Number;
        day: Number
    };
    items: string[];
    exceptions: string[];
    cost: number = 0;
    description: String
}

export class IPages {
    _id: string;
    userid: IUser;
    title: string;
    abstract: string;
    htmlcontent: string;
    createdAt: any;
}

export interface Ipayments {
    _id: string,
    userid: IUser,
    planid: Iplans,
    pay_id: String,
    transaction_id: String,
    amount: number,
    active: boolean,
    fullname: string,
    email: String,
    phone: Number,
    description: String,
    createdAt: String
}

export class IUserInfo {
    payments: Ipayments[];
    user: IUser
}
export interface activePlans {
    pay_id: string,
    planid: string | null,
    planLifeTime: number,
    percentOfUse: number,
    used: number,
    remaining: number
}

export class Product {
    _id: string;
    cost: string;
    title: string;
    time: {
        month: number;
        day: number;
    };
    description: string;
    detail: string;
    count: number
}

export interface IAccessControlLevel {
    id: string,
    access: string
}

// menus
export class IMenu {
    _id: string;
    title: string;
    order: IMenuItems[]
}
export class IMenuItems {
    content: string;
    url: string;
    children: IMenuItems[]
}
// settings
export class ISettings {
    userid: string;
    title: string;
    logo: string;
    keywords: string;
    description: string;
    metatags: object[];
    headermenu: string;
    footermenu: string;
    footer: {
        social: ISocials;
        extraHtml: string;
        description: string
    }
}

export class ISocials {
    telegram: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    github: string
}

export class IProjact {
    _id: string;
    userid: string;
    investForm: {
        title: string;
        ground:{
            count: string,
            cost: string,
        },
        building: [];
        landscaping: [];
        equipment: [];
        vehicles: [];
        officeEquipment: [];
        preOperation: {
            research: string;
            otherCosts1: string;
            otherCosts2: string;
            otherCosts3: string;
            otherCosts4: string;
            otherCosts5: string;
            staffTraining: number;
            tolidAzmayeshi: number;
        };
        pishbiniNashode: string;
    };
    salaryForm: {
        jobTitles: any[];
        jobLevels: any[];
        employees: any[];
    };
    fundAndExpensesForm: {
        time: string;
        mavadAvalie: [];
        zarfiyateSalane: string;
        tankhah: number;
        mojodiKala: number;
        motalebat: number;
        ghalebMasrafi: number;
        hazineJari: {
            water: {
                count: string;
                cost: string;
                percent: string;
            };
            gasWarmSeasons: {
                count: string;
                cost: string;
                percent: string;
            };
            gasColdSeasons: {
                count: string;
                cost: string;
                percent: string;
            };
            electricity: {
                count: string;
                cost: string;
                percent: string;
            };
            phoneAndInternet: {
                count: string;
                cost: string;
                percent: string;
            };
            salaryPercent: string
        };
    }
}
export class IEstimate {
    building: IEstehlak[];
    landscaping: IEstehlak[];
    equipment: IEstehlak[];
    vehicles: IEstehlak[];
    maintenanceCost: {
        building: number;
        equipment: number;
        vehicles: number;
    }
    officeEquipment: IEstehlak[];
    preOperation: IEstehlak[];
    unforeseen: IEstehlak[];
    employees: any[];
    sumSalaryCosts: any;
    salaryBase: any[];
    workingCapital: any;
    salesAndAdsRate: any;
    financialSummary: any;
    bankFacilities: any;
    annualProductionCosts: any;
}
//* for estimate
export interface IRate {
    building: number,
    equipment: number,
    vehicles: number,
    officeEquipment: number,
    preOperation: number,
    unforeseen: number,
}
export interface IEstehlak {
    title: string,
    year: number,
    estehlak: number,
    arzeshDaftari: number,
    sumOfCosts: number
}
// *