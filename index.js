var port = process.env.PORT || 8080

var FTP = require("jsftp")
var Dat = require('dat')
var timr = require('timr')

var dat = new Dat('./data', function ready(err) {
  dat.init(function(err) {
    if (err) console.error(err)
    dat.serve({port: port}, function() {
      setInterval(fetch, 60000 * 60 * 6) // fetch every 6 hours
    })
  })  
})

function fetch() {
  console.log(JSON.stringify({"starting": new Date()}))
  
  var ftp = new FTP({
    host: "crimewatchdata.oaklandnet.com"
  })

  ftp.get('crimePublicData.csv', function(err, socket) {
    if (err) console.log(err)
    
    var writeStream = dat.createWriteStream({
      csv: true,
      primary: ['CaseNumber', 'Description', 'PoliceBeat', 'CrimeType'],
      hash: true
    })
    
    socket.pipe(writeStream).on('data', function(c) {
      if (!c.existed) console.log(c)
    })
    
    writeStream.on('error', function(e) {
      console.log('Error', e)
    })
    
    writeStream.on('close', function() {
      console.log(JSON.stringify({"finished": new Date()}))
    })
    
    socket.resume()
    
  })
}
