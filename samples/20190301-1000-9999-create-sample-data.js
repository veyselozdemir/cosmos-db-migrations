const scriptUtils = require('../scriptUtils'); 
const scriptRunner = require('../scriptUtils/scriptRunner'); 

const scriptId = '20190301-1000-9999-create-sample-data'; 

async function mainFunction(db) {
    await doStuff(db); 
}

async function doStuff(db) {
    await db.containers.createIfNotExists({id: 'sampleData'}); 
    const container = scriptUtils.getContainer(db, 'sampleData'); 
    for (let i = 0; i < 150; i++) {
        const sampleDocument = {
            name: `Peter Pan ${i}`, 
            age: 12, 
            createTime: new Date()
        }; 

        await container.items.create(sampleDocument)

        // console.log('created ' + (i + 1) + ' records');
    }

    let { result } = await container.items.query({
        query: "select value count(1) from c"
    }).toArray(); 
    console.log(`${result} items are now in sampleData container`); 
}

scriptRunner.runOnce(scriptId, mainFunction); 
