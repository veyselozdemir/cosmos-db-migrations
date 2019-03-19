# General Information 
This folder contains scripts for cosmos db data migrations during releases.  

A script is a file, identified by a script id. 
The entry point is a call to following method: 
    scriptRunner.runOnce(scriptId, mainFunction);

scriptId: A string. Unique identifier of your script. Using the file name is a good idea. See Script Naming Convention section in this document. 
mainFunction: A function in your script. Name does not have to be mainFunction, it can be any name. 
This function must be an async function that takes a db parameter of type <Database> (https://docs.microsoft.com/en-us/javascript/api/%40azure/cosmos/database?view=azure-node-latest). 
An example is as follows:  
    async function mainFunction(db) {
        ... 
    }


Please see `samples/20180101-1100-0001-sample-successful-script.js` file for a sample script. 
The connection parameters are read from config.js file, and script run information is kept in `migrationscripts` container in cosmos db. 
The name of the migration scripts container is configurable in config.js by `migrationScriptsContainerName` 
If the `migrationscripts` container is not found it is created automatically.  

# Important Files  
**config.js**
This file contains connection parameters. 
'endpoint' and 'accessKey' are by default read from environment variables: process.env.COSMOS_ENDPOINT and process.env.COSMOS_ACCESSKEY respectively. 

**/scriptUtils/index.js**
This module contains various utility functions to connect to database, get a reference to a container, check if a script is  already run etc.  

**/scriptUtils/scriptRunner.js**
This module contains a utility function to ensure a script is run only once per database.  

# Script Naming Convention 
File names should follow the format: <yyyymmdd-hhmm>-<work item id>-<descriptive text>.js
A sample name is as follows:  
20180101-1200-0002-improved-this-and-that
 \____  ____/ \  / \_________  _________/
      \/       \/            \/
    Ordinal TicketId    Descriptive Text

Ordinal is basically a datetime string. And it is there to ensure sorted execution at all times. 
TicketId is the id of work item related to the script. 

# Quick Start 
1. Check config parameters
Check the `config.js` for connection parameters. endpoint and accessKey should point to your database. If you are using the local emulator default values will work.  

2. Create a sample database
Create a database named `sampleDb` (to match the dbName in `config.js`)

3. Run a script manually  
To run a sample script run the following commands:  
    yarn install
    node .\samples\20190301-1000-9999-create-sample-data.js 

It will execute a simple count(1) query and print the result: 
    ----------------------------------------------------------------
    Starting script 20190301-1000-9999-create-sample-data
    ----------------------------------------------------------------
    endpoint: https://localhost:8081/
    { id: '20190301-1000-9999-create-sample-data',
      ... }
    **150 items are now in sampleData container** 

You can now check the `migrationscripts` container. It will have a document for this script run. 

Note: If it is run before it will print the run information and return. To be able to run again, delete the entry with *'20190301-1000-9999-create-sample-data'* from the `migrationscripts` container 

4. Celanup for next steps 
Delete all the documents from the `migrationscripts` container manually for the next step.  

5. Running multiple scripts at once 
Copy two sample scripts from `samples` directory to `scriptsToRun` directory
    copy samples\20190301-1000-9999-create-sample-data.js scriptsToRun\20190301-1000-9999-create-sample-data.js 
    copy samples\20190301-1100-9876-sample-successful-script.js scriptsToRun\20190301-1100-9876-sample-successful-script.js 

Execute the `run.ps1` to run all the scripts in `scriptsToRun` directory 
    .\run.ps1 

The result will be similar to the following: 
    Scripts found to run : 20190301-1000-9999-create-sample-data.js 20190301-1100-9876-sample-successful-script.js
    ----------------------------------------------------------------
    Starting script 20190301-1000-9999-create-sample-data
    ----------------------------------------------------------------
    endpoint: https://localhost:8081/
    { id: '20190301-1000-9999-create-sample-data',
      ... }
    150 items are now in sampleData container
    Execution result code is: 0
    ----------------------------------------------------------------
    Starting script 20190301-1100-9876-sample-successful-script
    ----------------------------------------------------------------
    endpoint: https://localhost:8081/
    { id: '20190301-1100-9876-sample-successful-script',
      ... }
    [ 150 ]
    Execution result code is: 0

6. Verify that reruns are skipped 
Execute the `.\run.ps1` again to run all scripts. Since all the scripts are already run before, they will not be executed again and the output will be as below:  
    Scripts found to run : 20190301-1000-9999-create-sample-data.js 20190301-1100-9876-sample-successful-script.js
    ----------------------------------------------------------------
    Starting script 20190301-1000-9999-create-sample-data
    ----------------------------------------------------------------
    endpoint: https://localhost:8081/
    run data for 20190301-1000-9999-create-sample-data { id: '20190301-1000-9999-create-sample-data',
      ... }
    **Script 20190301-1000-9999-create-sample-data is already run. Will exit.**
    Execution result code is: 0
    ----------------------------------------------------------------
    Starting script 20190301-1100-9876-sample-successful-script
    ----------------------------------------------------------------
    endpoint: https://localhost:8081/
    run data for 20190301-1100-9876-sample-successful-script { id: '20190301-1100-9876-sample-successful-script',
      ... }
    **Script 20190301-1100-9876-sample-successful-script is already run. Will exit.**
    Execution result code is: 0

# What if There is an Error? 
If a script has an error when running (for any reason) the error is captured and recorded. 
You will need to correct the cause of the error and delete the corresponding data from `migrationscripts` container to run again. 

Try running the following command and then look at the document with id: in the `migrationscripts` container: 
    node .\samples\20190301-1200-0002-sample-failing-script.js

`run.ps1` will stop if there is a failing script, due to the possibility of remaining scripts being dependent on the failing script's successful completion. 
You will need to fix the cause of the error manually and rerun the scripts. 

# Resources 
JavaScript and Node.js library for Azure Cosmos DB. Especially samples are very useful.  
https://github.com/Azure/azure-cosmos-js
https://github.com/Azure/azure-cosmos-js/tree/master/samples

API documentation for azure/cosmos package 
https://docs.microsoft.com/en-gb/javascript/api/%40azure/cosmos/?view=azure-node-latest

