export class Globals {
    public static apiUrl = "http://localhost:3000";
    public static admin = "/admin";
    public static users = "/user";
    public static pages = "/page";
    public static plans = "/plan";
    public static projacts = "/projact";
    public static payments = "/pay";

    public static adminApi = {
        getdata: `${this.admin}/getdata`, // ?type=${type}
        removedata: `${this.admin}/removedata`, // ?type=${type}&&id=${id}
        createMenu: `${this.admin}/menus?type=list`, // post:data
        getMenus: `/api/menus`,
        editMenuListTitle: `${this.admin}/menus?type=editlist`, // post:data
        editMenuListOrder: `${this.admin}/menus?type=order`, // post:data
        deleteMenu: `${this.admin}/menus?id=id`,
        editMenuLocation: `${this.admin}/settings/menu/`, // +/:location post:data
        createRole: `${this.admin}/roles`, // post:data
        editRole: `${this.admin}/roles`, // put:data
        deleteRole: `${this.admin}/roles`, // delete:data
    }
    public static pagesApi = {
        getAll: `${this.pages}/all`,
        details: `${this.pages}/details/`, // +/:id
        create: `${this.pages}/new`,
        edit: `${this.pages}/edit/`,   // +/:id
        delete: `${this.pages}/delete/`    // +/:id
    };
    public static plansApi = {
        getAll: `${this.plans}/getall/`,
        details: `${this.plans}/details/`, // get +/:id
        create: `${this.plans}/new`,
        edit: `${this.plans}/edit/`,   // put +/:id
        delete: `${this.plans}/delete/`    // delete +/:id
    };
    public static usersApi = {
        initCkeck: `${this.users}/init/check`,
        initRegister: `${this.users}/init/register`, // post:data
        verifyToken: `${this.users}/authenticate`, // get ?token=${token}
        register: `${this.users}/register`, // post:data
        login: `${this.users}/login`, // post:data
        logout: `${this.users}/logout`, // post:data
        userinfo: `${this.users}/userinfo?type=all`, // &id=${id}
        edit: `${this.users}/edit`, // put:data
        editRole: `${this.users}/change/role`, // put:data
        editPassword: `${this.users}/change/password`, // put:data
        delete: `${this.users}/delete/`    // delete +/:id
    };
    public static paymentsApi = {
        checkOut: `${this.payments}/checkout/`, // post:data
        vetyfy: `${this.payments}/verify`, // get
        deactivePlan: `${this.payments}/dpay/`,   // put:data
    };
    public static publicApi = {
        getSettings: `/api/settings`,
        getMenus: `/api/menus/`, // ?location=menuLocation
    };
    public static projactsApi = {
        getAll: `${this.projacts}/all`,
        details: `${this.projacts}/details/`, // +/:id
        create: `${this.projacts}/new`,
        edit: `${this.projacts}/edit/`,   // +/:id
        delete: `${this.projacts}/delete/`    // +/:id
    };
}
