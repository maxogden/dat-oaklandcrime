var port = process.env.PORT || 8080

var FTP = require("jsftp")
var Dat = require('dat')

var dat = new Dat('./data', function ready(err) {
  if (err) return console.error('err', err)  
  dat.listen(port, function(err) {
    console.log('listening on', port)
    setInterval(fetch, 60000 * 60 * 6) // fetch every 6 hours
    fetch()
    
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
    
    socket.pipe(writeStream)
    
    dat.progressLog(writeStream, 'Wrote', 'Write finished.')
    
    writeStream.on('error', function(e) {
      console.log('Error', e, e.stack)
    })
    
    writeStream.on('end', function() {
      console.log(JSON.stringify({"finished": new Date()}))
      ftp.destroy()
    })
    
    socket.resume()
  })
}
