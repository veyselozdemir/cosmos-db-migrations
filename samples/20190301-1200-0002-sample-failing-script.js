const scriptRunner = require('../scriptUtils/scriptRunner'); 

const scriptId = '20190301-1200-0002-sample-failing-script'; 

async function mainFunction(db) {
    console.log(`this script will throw an exception in a while...`);
    throw new Error(`this error is intentional`); 
}


scriptRunner.runOnce(scriptId, mainFunction); 
