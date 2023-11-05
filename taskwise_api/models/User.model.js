const mongoose = require('mongoose');
const mongodb = require('../config/db');
const bcrypt = require('bcrypt');
const { roles } = require('../constants');

// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */
const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    role: {
        type: String,
        //* Validate the "role" field can only have 3 specific values
        enum: 
        [
            roles.manager,
            roles.engineer,
            roles.client
        ],
        required: true
    },
    phone: {
        type: String,
        required: false,
    },
    profile: {
        cloudinary_id: String,
        profile_url: String,
    },
    //? To check whether the current user is online
    //* isOnline == true IF user login successfully
    //* isOnline == false IF user logout / Tab closed / Wi-Fi disconnection / window closed / system shutdown
    isOnline: {
        type: Boolean,
        default: false
    },
    //? For "ENGINEER" / "MANAGER"
    joining_date: {
        // Format: YYYY-MM--DD
        type: Date,
        required: false
    },
    firstLogin: {
        type: Boolean,
        default: true
    },
    currentWorkingHour: {
        type: Number,
        required: false,
        default: 0,
    },
    //? For "CLIENT"
    company_name: {
        type: String,
        required: false
    },
    //? For "Engineer"
    Age: {
        type: Number,
        required: false
    },
    Gender:{
        type: String,
        required: false
    },
    EducationBackground: {
        type: String,
        required: false
    },
    MaritalStatus: {
        type: String,
        required: false
    },
    EmpDepartment: {
        type: String,
        required: false
    },
    EmpJobRole: {
        type: String,
        required: false
    },
    BusinessTravelFrequency: {
        type: String,
        required: false
    },	
    DistanceFromHome: {
        type: Number,
        required: false
    },	
    EmpEducationLevel: {
        type: String,
        required: false
    },	
    EmpEnvironmentSatisfaction: {
        type: String,
        required: false
    },		
    EmpHourlyRate: {
        type: Number,
        required: false
    },	
    EmpJobInvolvement: {
        type: String,
        required: false
    },	
    EmpJobLevel: {
        type: String,
        required: false
    },	
    EmpJobSatisfaction: {
        type: String,
        required: false
    },	
    NumCompaniesWorked: {
        type: Number,
        required: false
    },	
    OverTime: {
        type: String,
        required: false
    },	
    EmpLastSalaryHikePercent: {
        type: Number,
        required: false
    },	
    EmpRelationshipSatisfaction: {
        type: String,
        required: false
    },	
    TotalWorkExperienceInYears: {
        type: Number,
        required: false
    },	
    TrainingTimesLastYear: {
        type: Number,
        required: false
    },	
    EmpWorkLifeBalance: {
        type: String,
        required: false
    },	
    ExperienceYearsAtThisCompany: {
        type: Number,
        required: false
    },	
    ExperienceYearsInCurrentRole: {
        type: Number,
        required: false
    },	
    YearsSinceLastPromotion: {
        type: Number,
        required: false
    },	
    YearsWithCurrManager: {
        type: Number,
        required: false
    },	
    Attrition: {
        type: String,
        required: false
    },	
    PerformanceRating: {
        type: Number,
        required: false
    },
});

/*
 * "Pre-save" hook function => Automatically execute every time before ".save()" is executed
 * Before saving the current "Employee" object (this) into MongoDB, its password is hashed using "bcrypt"
 */
userSchema.pre("save", async function() {
    try {
        var user = this;
        if(user.$locals.isUpdateWorkingHour){ user.$locals.isUpdateWorkingHour = undefined; }
        //? Avoid running this script if the database is updating the "engineer" working hour
        else{
            const salt = await bcrypt.genSalt(10);
            const hashPass = await bcrypt.hash(user.password, salt);
            user.password = hashPass;
            //? Remove the `currentWorkingHour` field if the user's role is "CLIENT" || "MANAGER"
            if(user.role == roles.client) user.joining_date = undefined; 
            if(user.role !== roles.engineer) user.currentWorkingHour = undefined;
            //? Remove the `company_name` field if the user's role is not "CLIENT"
            if(user.role !== roles.client) user.company_name = undefined;
        }
    } catch (error) {
        throw error;
    }
});

// Define a custom method instance (employeeSchema.methods) to be used by every single "employeeSchema" object
// * Key => comparePassword, value => functions that implement the method
//! Using "arrow function" rather than "normal function" X work => "arrow function" X preserve the object from "this" keyword (object that invoke this function)
//! Hence, using "this.password" in "arrow function" will result in "undefined"
userSchema.methods.comparePassword = async function(userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

//* Create an "employee" collection which conforms to the "employeeSchema" in MongoDB
const userCollection = mongoose.model('user', userSchema);

module.exports = userCollection;