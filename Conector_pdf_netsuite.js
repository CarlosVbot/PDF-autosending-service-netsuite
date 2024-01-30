const fs = require('fs');
const nsrestlet = require('nsrestlet');

function vigilarDirectorio(config) {
    try {
        console.log(`Vigilando el directorio: ${config.Directorio}`);

        fs.watch(config.Directorio, (evento, nombreArchivo) => {
            delayPromise().then(() => {
                if (evento === 'rename') {
                    console.log(`Nuevo archivo detectado: ${nombreArchivo}`);
                    var rutaArchivo = config.Directorio +'/'+ nombreArchivo
                    console.log('rutaArchivo '+rutaArchivo)
                    var contenidoPDF = leerPDFyCodificarBase64(rutaArchivo);
                    console.log('contenidoPDF '+contenidoPDF)
                    if(contenidoPDF){
                        conectarNS(contenidoPDF,nombreArchivo,config);
                    }
                }
              });
        });
    } catch (error) {
        console.log('Error al revisar el directorio')
    }
}

try {
    var config
    fs.readFile('configuracion.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo de configuración:', err);
          return;
        }
        config = JSON.parse(data);
      
        console.log('Configuración leída:', config);
        vigilarDirectorio(config);
      });

} catch (error) {
    console.log('Error> '+error)
}


function leerPDFyCodificarBase64(rutaPDF) {
    try{
        const contenidoPDF = fs.readFileSync(rutaPDF);
        const base64PDF = contenidoPDF.toString('base64');
        return base64PDF;
    }catch(e){
        console.log('Error> no es posible leer el contenido')
        return false
    }

}


function conectarNS(contenidoPDF,nombreArchivo,config){
    var accountSettings = config.Netsuite_acceso;
    var urlSettings = {
        url: config.url
    }

    var myInvoices = nsrestlet.createLink(accountSettings, urlSettings)
    var data = {
        "encoding": "UTF-8",
        "function": "fileCreate",
        "folderID": 969,
        "contents": contenidoPDF,
        "isOnline": true,
        "description": "XD",
        "name": nombreArchivo,
        "fileType": "PDF"
      }
    myInvoices.post(data).then(function(body) {
        console.log(body);
    })
    .catch(function(error) {
        console.log(error);
    });

    
}

function delayPromise() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(); 
      }, 5000);
    });
  }
