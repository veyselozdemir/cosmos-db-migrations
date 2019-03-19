const scriptUtils = require('./index');
const Confirm = require('prompt-confirm'); 

runOnceInernal = async (scriptId, scriptMainFunction) => {
    console.log(`----------------------------------------------------------------`); 
    console.log(`Starting script ${scriptId}`); 
    console.log(`----------------------------------------------------------------`); 

    scriptUtils.printConnectionInfo(); 
    const db = scriptUtils.connectToDb(); 
    let scriptRunData = await scriptUtils.getRunData(scriptId, db); 
    if (scriptRunData && scriptRunData.isRunStarted) {
        console.log(`Script ${scriptId} is already run. Will exit.`); 
        if (scriptRunData.isRunFailed) {
            console.error(`Script ${scriptId} had failed in the last run. Exiting again with the same error...`);
            console.error(`If you fixed the error and want to re-run, remove the script run entry from the database and try re-running then.`); 
            throw scriptRunData.error; 
        }
        return; 
    }
        
    let runData = await scriptUtils.registerRunStarted(scriptId, db); 
    console.log(runData); 

    // Run the script function 
    try {
        await scriptMainFunction(db); 
        await scriptUtils.registerRunCompleted(runData.id, db); 
    }
    catch (err){
        await scriptUtils.registerRunFailed(runData.id, db, err); 
        throw err; 
    }
} 

runOnce = async (scriptId, scriptMainFunction) => {
    try {
        await runOnceInernal(scriptId, scriptMainFunction); 
    } catch (error) {
        process.exitCode = 1; 
        console.error(`Script ${scriptId} is failed to complete.`, error); 
        console.log(` `); 
    }
}
exports.runOnce = runOnce; 



runWithoutRegistering = async (scriptId, scriptMainFunction) => {
    try {
        console.log(`----------------------------------------------------------------`); 
        console.log(`Starting script ${scriptId}`); 
        console.log(`----------------------------------------------------------------`); 

        scriptUtils.printConnectionInfo(); 

        const prompt = new Confirm('This method is intended ONLY FOR DEVELOPMENT. Are you sure to run without registering?');
        prompt.ask(async (isConfirmed) => {
            if (!isConfirmed) {
                console.log(`Script cancelled`); 
                return; 
            }
            
            const db = scriptUtils.connectToDb(); 

            // Run the script function 
            await scriptMainFunction(db); 
        
        })

        
        
    } catch (error) {
        process.exitCode = 1; 
        console.error(`Script ${scriptId} is failed to complete.`, error); 
        console.log(` `); 
    }
}
exports.runWithoutRegistering = runWithoutRegistering; 

