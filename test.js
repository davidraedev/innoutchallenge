var d = require( "./app/db" )
var c = require( "./controller/receipt" );

d.connect().then(()=>{
c.findReceipts({})
.then((r)=>{console.log("r >> ",r)})
});
