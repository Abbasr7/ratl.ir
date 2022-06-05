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
    fullname:string;
    address: string;
    role: IRole;
    phone:string;
    imgurl: String  
}

export class Iplans{
    _id:string;
    title:string;
    time:{
        month:Number;
        day:Number
    };
    items:string[];
    exceptions:string[];
    cost:number=0;
    description:String
}

export class IPages{
    _id: string;
    userid: IUser;
    title: string;
    abstract: string;
    htmlcontent: string;
    createdAt:any;
}

export interface Ipayments{
    _id:string,
    userid:IUser,
    planid:Iplans,
    pay_id:String,
    transaction_id:String,
    amount:number,
    active:boolean,
    fullname:string,
    email:String,
    phone:Number,
    description:String,
    createdAt:String
}

export class IUserInfo{
    payments:Ipayments[];
    user:IUser
}
export interface activePlans {
    pay_id: string,
    planid: string|null,
    planLifeTime:number,
    percentOfUse: number,
    used: number,
    remaining:number
}

export class Product {
    _id: string;
    cost: string;
    title: string;
    time:{
        month:number;
        day:number;
    };
    description:string;
    detail: string;
    count:number
}

export interface IAccessControlLevel{
    id:string,
    access:string
}

// menus
export class IMenu{
    _id:string;
    title:string;
    order:IMenuItems[]
}
export class IMenuItems{
    content:string;
    url:string;
    children:IMenuItems[]
}
// settings
export class ISettings{
    userid: string;
    title: string;
    logo: string;
    keywords:  string;
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

export class ISocials{
    telegram: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    github: string
}

export interface IProjacts{
    investForm: {
        title: {
            type: String,
            required: true
        },
        building: [],
        landscaping: [],
        equipment: [],
        vehicles: [],
        officeEquipment: [],
        preOperation: {
            research: [],
            otherVariousCosts: [],
            staffTraining: [],
            tolidAzmayeshi: [],
        },
        pishbiniNashode: [],
    },
    salaryForm: {
        jobTitles: [],
        jobLevels: [],
        employees: [],
    },
    fundAndExpensesForm: {
        time: [],
        mavadAvalie: [],
        zarfiyateSalane: [],
        hazineJari: {
            water: {
                count: [],
                cost: [],
                percent: [],
            },
            gasWarmSeasons: {
                count: [],
                cost: [],
                percent: [],
            },
            gasColdSeasons: {
                count: [],
                cost: [],
                percent: [],
            },
            electricity: {
                count: [],
                cost: [],
                percent: [],
            },
            phoneAndInternet: {
                count: [],
                cost: [],
                percent: [],
            },
            salaryPercent: []
        },
    }
}