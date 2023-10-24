
export class addPropertyModel {
    // public name:String;   
    public kindOfProperty: String;
    public propertyType: String;
    public contactNo:String;
    public locationDetails: {
        city:String;
        society:String;
        locality:string;
        houseNo:String;
    };
    // public apartmentType: String;
    public roomDetails:{
        noOfBedRooms: String;
        noOfBalconies: String;
        noOfBathRooms:String;
    };
   
    public areaDetails: {
        carpet:String;
        builtUp:String;
        superBuiltUp:String;
    
    };
    public otherRooms : String;
    public furnishedDetails : String;
    public parkingDetails:{
        covered:Number;
        open:Number;
    };
    public floorDetails : {
        total:String;
        propertyOnFloor:String;
    };
    public availabilityStatus: String;
    public expectedTimeOfPossesion:string;
    public photos:{
        photoName:String;
        photoSize:String;
    }
}