var request = require('request-promise');
const { GENDER, EDUCATION_BACKGROUND, MARITAL_STATUS, EMP_DEPARTMENT, EMP_JOB_ROLE, BUSINESS_TRAVEL_FREQUENCY, EMP_EDUCATION_LEVEL, EMP_ENVIRONMENT_SATISFACTION, EMP_JOB_INVOLVEMENT, EMP_JOB_LEVEL, EMP_JOB_SATISFACTION, OVERTIME, EMP_RELATIONSHIP_SATISFACTION, EMP_WORKLIFE_BALANCE, ATTRITION } = require('../constants');

// Access environment variables
require('dotenv').config()

//? Employee Performance Prediction (Python Server)
exports.makePrediction = async(data) => {
    try{
        const formattedData = transformData(data);
        //* 1. Define the parameters required to send the request
        const options = { 
            method: 'POST', 
            uri: `${process.env.PYTHON_SERVER_URL}/predict-performance`, 
            body: formattedData, 
            json: true
        };
        //* 2. Send and retrieve the result of the prediction
        const performance_rating = await request(options);
        return performance_rating;
    }catch(error){
        console.log(error);
        return undefined;
    }
}

//! Make sure the data sent to the Python Server has the equivalent format as the "Prediction Model"
function transformData(data){
    let formattedData = {};
    formattedData.EmpNumber = data._id;
    formattedData.Age = data.Age;
    formattedData.Gender = GENDER[data.Gender];
    formattedData.EducationBackground = EDUCATION_BACKGROUND[data.EducationBackground];
    formattedData.MaritalStatus = MARITAL_STATUS[data.MaritalStatus];
    formattedData.EmpDepartment = EMP_DEPARTMENT[data.EmpDepartment];
    formattedData.EmpJobRole = EMP_JOB_ROLE[data.EmpJobRole];
    formattedData.BusinessTravelFrequency = BUSINESS_TRAVEL_FREQUENCY[data.BusinessTravelFrequency];
    formattedData.DistanceFromHome = data.DistanceFromHome;
    formattedData.EmpEducationLevel = EMP_EDUCATION_LEVEL[data.EmpEducationLevel];
    formattedData.EmpEnvironmentSatisfaction = EMP_ENVIRONMENT_SATISFACTION[data.EmpEnvironmentSatisfaction];
    formattedData.EmpHourlyRate = data.EmpHourlyRate;
    formattedData.EmpJobInvolvement = EMP_JOB_INVOLVEMENT[data.EmpJobInvolvement];
    formattedData.EmpJobLevel = EMP_JOB_LEVEL[data.EmpJobLevel];
    formattedData.EmpJobSatisfaction = EMP_JOB_SATISFACTION[data.EmpJobSatisfaction];
    formattedData.NumCompaniesWorked = data.NumCompaniesWorked;
    formattedData.OverTime = OVERTIME[data.OverTime];
    formattedData.EmpLastSalaryHikePercent = data.EmpLastSalaryHikePercent;
    formattedData.EmpRelationshipSatisfaction = EMP_RELATIONSHIP_SATISFACTION[data.EmpRelationshipSatisfaction];
    formattedData.TotalWorkExperienceInYears = data.TotalWorkExperienceInYears;
    formattedData.TrainingTimesLastYear = data.TrainingTimesLastYear;
    formattedData.EmpWorkLifeBalance = EMP_WORKLIFE_BALANCE[data.EmpWorkLifeBalance];
    //? Instead of storing in the database, calculate it automatically whenever a prediction is made
    formattedData.ExperienceYearsAtThisCompany = calculateYearOfExperience(data.joining_date);
    formattedData.ExperienceYearsInCurrentRole = data.ExperienceYearsInCurrentRole;
    formattedData.YearsSinceLastPromotion = data.YearsSinceLastPromotion;
    formattedData.YearsWithCurrManager = data.YearsWithCurrManager;
    formattedData.Attrition = ATTRITION[data.Attrition];
    return formattedData;
}

//? Calculate the number of year the engineer working in the company
function calculateYearOfExperience(joining_date){
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - new Date(joining_date).getTime();
    const yearsOfExperience = timeDifference / (365 * 24 * 60 * 60 * 1000); // Calculate years
    return parseFloat(yearsOfExperience.toFixed(1));
}


