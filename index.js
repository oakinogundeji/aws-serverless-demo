'use strict';
/**
 * Dependencies
 */
const 
    Mongoose = require('mongoose'),
    DataObjects = require('./models/dataObjects');

/**
 * Variables
 */

const {dBURL} = process.env;

/**
 * Config Mongoose
 */
Mongoose.set('strictQuery', true);

/**
 * MongoDB Connector function
 */

async function main() {
    try {
      await Mongoose.connect(dBURL);
      console.log(`mongodb connection up: ${dBURL}`);
      return Promise.resolve(true);
    }
    catch (err) {
      console.error('There was a db connection error - from main()');
      console.error(err.message);
      return Promise.reject(false);
    }
}

/**
 * Event handlers
 */
exports.getData = async function (ev, ctx) {
    let objID;
    let resp;
    if(!!(ev.queryStringParameters && ev.queryStringParameters.id)) {
        objID = ev.queryStringParameters.id;
    }
    else {
        resp = {
            statusCode: 404,
            body: JSON.stringify({
                msg: 'there was an error retrieving the data, please ensure that the "id" attribute is present. Thank you'
            })
        }
        return resp;  
    }
    const dbUP = main();
    if(!!dbUP) {        
        try {
            const dataObj = await DataObjects.findOne({id: objID}, {_id: 0, __v: 0});            
            if(!dataObj) {
                resp = {
                    statusCode: 404,
                    body: JSON.stringify({
                        msg: `data with id: ${objID} does NOT exist, please confirm the correct ID. Thank you.`,
                        data: ''
                    })
                }
                return resp;
    
            }
            resp = {
                statusCode: 200,
                body: JSON.stringify({
                    msg: 'retrieve success',
                    data: dataObj
                })
            }
            return resp;
        }
        catch (err) {
            resp = {
                statusCode: 500,
                body: JSON.stringify({
                    msg: 'there was an internal server error retrieving the data, please try again later or contact the service provider. Thank you',
                    data: err
                })
            }
            return resp;
        }
    }
    else {
        return {
            statusCode: 500,
            body: JSON.stringify(`there was a dbase connection error, please try again`)
        }
    }
}

exports.saveData = async function (ev, ctx) {
    const dbUP = main();
    if(!!dbUP) {
        let data = ev.body;
        data = JSON.parse(data);
        let resp;
        if(!data.id) {
            resp = {
                statusCode: 404,
                body: JSON.stringify({
                    msg: 'there was an error saving the data, please ensure that the "id" attribute is present. Thank you'
                })
            }
            return resp;    
        }
        const dataProps = Object.keys(data);
        const NewDataObjectDoc = new DataObjects({});
        dataProps.forEach(val => {
            NewDataObjectDoc[val] = data[val];
        });
        try {
            await NewDataObjectDoc.save();
            resp = {
                statusCode: 200,
                body: JSON.stringify({
                    msg: 'save success',
                    data: NewDataObjectDoc.id
                })
            }
            return resp;
        }
        catch (err) {
            console.log('err saving data', err);
            resp = {
                statusCode: 404,
                body: JSON.stringify({
                    msg: 'there was an error saving the data, please ensure all field values are of the correct data type, or ensure that the "id" attribute is unique. Thank you',
                    data: err
                })
            }
            return resp;
        }        
    }
    else {
        return {
            statusCode: 500,
            body: JSON.stringify(`there was a dbase connection error, please try again`)
        }
    }
}