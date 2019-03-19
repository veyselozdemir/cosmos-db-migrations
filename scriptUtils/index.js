const cosmos = require('@azure/cosmos'); 
const CosmosClient = cosmos.CosmosClient; 
const config = require('../config'); 
const util = require('util'); 


exports.runAsync = (fn) => {
    fn().catch(err => {
        console.log(err); 
    })
}

exports.printConnectionInfo = () => {
    console.log(`endpoint: ${config.connection.endpoint}`); 
    // console.log(`accessKey: ${config.connection.accessKey}`); 
}


connectToDb = (dbName) => {
    if(!dbName) {
        dbName = config.connection.dbName; 
    }
    const endpoint = config.connection.endpoint; 
    const accessKey = config.connection.accessKey;

    const client = new CosmosClient({endpoint, auth: { masterKey: accessKey}, connectionPolicy: { DisableSSLVerification: true }}); 
    const  db = client.database(dbName); 
    return db; 
}
exports.connectToDb = connectToDb;


exports.getContainer = (db, containerName) => {
    const fixtures = db.container(containerName); 
    return fixtures; 
}

getMigrationScriptsContainerAsync = async (db) => {
    await db.containers.createIfNotExists({id: config.connection.migrationScriptsContainerName}); 
    const container = db.container(config.connection.migrationScriptsContainerName); 
    return container; 
}
exports.getMigrationScriptsContainerAsync = getMigrationScriptsContainerAsync; 


exports.getRunData = async (scriptId, db) => {
    const container = await getMigrationScriptsContainerAsync(db);  
    const querySpec = {
        query: 'select * from c where c.id = @scriptId', 
        parameters: [
            {
                name: '@scriptId', 
                value: scriptId
            }
        ]
    };

    let {result: results} = await container.items.query(querySpec).toArray(); 
    
    if (results.length === 0) {
        return null; 
    }
    const scriptRunData = results[0]; 
    console.log(`run data for ${scriptId}`, scriptRunData); 

    return scriptRunData; 
}


exports.registerRunStarted = async (scriptId, db) => {
    const container = await getMigrationScriptsContainerAsync(db); 
    const scriptRunData = {
        id: scriptId, 
        isRunStarted: true, 
        runStartTime: new Date().toISOString(), 
    };
    let {body: runData } = await container.items.create(scriptRunData); 
    return runData; 
}


exports.registerRunCompleted = async (scriptId, db) => {
    const container = await getMigrationScriptsContainerAsync(db); 
    const runItem = container.item(scriptId); 
    const {body: run} = await runItem.read(); 

    run.isRunCompleted = true; 
    run.runEndTime = new Date().toISOString(); 

    const updateResult = await runItem.replace(run); 
    return updateResult; 
}

exports.registerRunFailed = async (scriptId, db, err) => {
    const container = await getMigrationScriptsContainerAsync(db); 
    const runItem = container.item(scriptId); 
    const {body: run} = await runItem.read(); 

    run.isRunCompleted = false; 
    run.isRunFailed = true; 
    run.error = util.inspect(err);
    run.runEndTime = new Date().toISOString(); 

    const updateResult = await runItem.replace(run); 
    return updateResult; 
}

