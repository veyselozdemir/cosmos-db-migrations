const scriptUtils = require('../scriptUtils'); 
const scriptRunner = require('../scriptUtils/scriptRunner'); 

const scriptId = '20190301-1100-9876-sample-successful-script'; 

async function mainFunction(db) {
    await doStuff(db); 
}

async function doStuff(db) {
    const querySpec = {
        query: "select value count(1) from c"
    };

    const collection = scriptUtils.getContainer(db, 'sampleData'); 
    let { result } = await collection.items.query(querySpec).toArray(); 
    console.log(result); 
}
 
scriptRunner.runOnce(scriptId, mainFunction); 
