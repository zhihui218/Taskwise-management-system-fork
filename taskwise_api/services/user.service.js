// CRUD of "User" to MongoDB
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const { roles } = require('../constants');

class UserService {

    static async registerUser(user_data) {
        try {

            // const createUser = joining_date ? new UserModel({ email, name, password, role, joining_date }) : new UserModel({ email, name, password, role });

            return await UserModel.create(user_data);

        } catch (error) {
            throw error;
        }
    }

    //* "static" => Available to the single "User" model, not the single instance / document of "User"
    //* With "static", we can access the entire "User" model to find an "user" document with the specific email
    static async checkUser(email, _id) {
        try {
            if(email) return await UserModel.findOne({ email });
            if(_id) return await UserModel.findById(_id);

        } catch (error) {
            throw error;
        }
    }

    static async checkUserById(email) {
        try {
            // Return the user with "email"
            return await UserModel.findOne({ email });

        } catch (error) {
            throw error;
        }
    }

    //? Check whether the specific user is online / offline
    static async checkUserStatus(user_id){
        try{
            return await UserModel.findById(user_id, { isOnline: 1, _id: 0 })
        }catch(error){
            throw error;
        }
    }

    static async generateToken(tokenData, secretKey, jwt_expire) {
        return jwt.sign(tokenData, secretKey, { expiresIn: jwt_expire });
    }

    static async getUserInfo(_id) {
        try {
            const user = await UserModel.findById(_id);

            return user;

        } catch (error) {
            throw error;
        }
    }

    //? General profile of an user || Information needed for the performance prediction (EMPLOYEE)
    static async updateUserInfo(_id, user) {
        try {
            // Check whether the "update" is done / not (Avoid updating if the field is empty)
            return await UserModel.findByIdAndUpdate(_id, user, { new: true });

        } catch (error) {
            throw error;
        }
    }

    static async markUserOnlineStatus(_id, status){
        try{
            await UserModel.findByIdAndUpdate(_id, { isOnline: status });
        }catch(error){
            throw error;
        }
    }

    static async updateUserPassword(_id, password) {
        try{
            return await UserModel.findByIdAndUpdate(_id, { password: password }, { new: true })
        }catch(error){
            throw error;
        }
    }

    static async getEngineers() {
        return await UserModel.find({ role: roles.engineer }, { _id: 1, email: 1, profile: 1, name: 1,  currentWorkingHour: 1 });
    }

    static async getClients() {
        return await UserModel.find({ role: roles.client }, { _id: 1, email: 1, profile: 1, name: 1 });
    }

    //? 
    static async getManagers(){
        return await UserModel.find({ role: roles.manager }, { _id: 1 });
    }

    static async getUserById(_id){
        return await UserModel.findById(_id, 
            { 
                _id: 1, 
                email: 1, 
                profile: 1, 
                name: 1, 
                role: 1, 
                currentWorkingHour: 1, 
                company_name: 1, 
                joining_date: 1, 
                phone: 1,
                EmpDepartment: 1,
                EmpJobRole: 1,
                BusinessTravelFrequency: 1,
                EmpHourlyRate: 1,
                EmpJobInvolvement: 1,
                EmpJobLevel: 1,
                EmpLastSalaryHikePercent: 1,
                TrainingTimesLastYear: 1,
                YearsSinceLastPromotion: 1,
                YearsWithCurrManager: 1,
                PerformanceRating: 1,
            });
    }
}

module.exports = UserService;