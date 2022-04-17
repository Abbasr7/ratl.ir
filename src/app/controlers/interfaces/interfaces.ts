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

export interface IUser {
    _id: string,
    username: string,
    email: string,
    fullname:string,
    address: string,
    role: IRole,
    phone:string,
    imgurl: String  
}

export interface Iplans{
    _id:string,
    title:string,
    time:{
        month:Number,
        day:Number
    },
    cost:string,
    description:String
}

export interface Ipayments{
    _id:string,
    userid:String,
    planid:String|Iplans,
    pay_id:String,
    transaction_id:String,
    amount:string,
    active:boolean,
    fullname:string,
    email:String,
    phone:Number,
    description:String,
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
export interface IMenuItems{
    _id:string,
    listId:string,
    dataId:string,
    title:string,
    url:string
}