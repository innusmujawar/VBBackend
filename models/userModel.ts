
export class User {
    public _id:String;
    public firstName: String;
    public lastName: String;
    public email: String;
    public password: String;
    public contactNo: Number;
    public businessAddress = {
        adr_address: String,
        url: String,
        id: String,
        name: String,
        lng: Number,
        lat: Number
    };
    public companyName: String;
    public businessInfo:String;
    public pic:Object = {
        url: String,
        uploaded:Boolean
    };
    public createdAt: String;
    public updatedAt: String;
}