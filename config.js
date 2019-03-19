connection = {
    endpoint: process.env.COSMOS_ENDPOINT || "https://localhost:8081/",
    accessKey:
      process.env.COSMOS_ACCESSKEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",  
    dbName: process.env.COSMOS_DBNAME || "sampleDb", 
    migrationScriptsContainerName: process.env.COSMOS_MIGRATION_SCRIPTS_CONTAINER || "migrationscripts"
};

// // ANOTHER ENV 
// connection.endpoint = "https://<yourdb>.documents.azure.com:443/"
// connection.accessKey = "<accesskey>"

exports.connection = connection; 
