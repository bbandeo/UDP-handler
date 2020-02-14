// EXPRESS
const express = require("express");
const app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http);
app.use(express.static("public"));
let port = process.env.PORT || 8080;
let udpPort = 41234;
let udpAddress = '192.168.10.4';

//******* BUFFER *******//
const server = require("dgram").createSocket("udp4");

server.on("error", err => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  console.log(Date.now());
  let data = {
    message: Buffer.from(msg, "hex")
  };


  // ESCRIBE JSON CON PRIMERAS 7 BOOLEANAS DE ESTADO SEW //
  bool1 = createBinaryString(data.message[0]).slice(24);
  bool2 = createBinaryString(data.message[1]).slice(24);
 
  for(let i=0, d=7;i<7;i++){
    fromPLC[index[i]].value = parseInt(bool1[d]);
    d--;
  }
  
  fromPLC.SEW_CargaActual.value = dintRead(2,data);
  dintRead

  send('hola',udpAddress,udpPort);
  
  res.send('somethingCalculatedWithUDPResponse');

  console.log(fromPLC);

});

server.on("listening", () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(udpPort);

http.listen(port, function() {
  // http.listen(port, '192.168.0.106', function () {
  console.log(`Escuchando en puerto ${port}`);
});

// SOCKET
let gSocket;
io.on("connection", function(socket) {
  console.log(`Usuario conectado con el ID: ${socket.id}`);
  gSocket = socket;

  gSocket.on("disconnect", function() {
    console.log(`Usuario ${gSocket.id} desconectado...`);
  });
  gSocket.on("test", function(data) {
    console.log(data);
  });
});

setInterval(() => {
  if (gSocket) {
    // gSocket.emit("test", Math.random() * 100);
    gSocket.emit("fromPLC", fromPLC);
  }
}, 50);

const udpFromPLC = () => {
  fromPLC.SEW_AlmacenandoOrden.value = 0;
};


let fromPLC = {
  SEW_OrdenAceptada: {
    type: "BOOL",
    value: 0
  },
  SEW_OrdenPendiente: {
    type: "BOOL",
    value: 0
  },
  SEW_AlmacenandoOrden: {
    type: "BOOL",
    value: 0
  },
  SEW_ErrorOrden: {
    type: "BOOL",
    value: 0
  },
  SEW_Falla: {
    type: "BOOL",
    value: 0
  },
  SEW_CargarBaterias: {
    type: "BOOL",
    value: 0
  },
  SEW_ProbarFrenos: {
    type: "BOOL",
    value: 0
  },
  SEW_CargaActual: {
    type: "INT",
    value: 0
  },
  SEW_DestinoActual: {
    type: "INT",
    value: 0
  },
  SEW_EstadoActual: {
    type: "WORD",
    value: 0
  },
  SEW_VelocidadActual: {
    type: "WORD",
    value: 0
  },
};

// Indexo JSON para recorrerlo //
let index = [];
for (let x in fromPLC) {
index.push(x);
}

const send = (msg,address,port) => {
  let m = new Buffer(msg);
  server.send(m, 0, m.length, port, address, function(err, bytes) {
      if (err) throw err;
      console.log('Buffer UDP enviado a ' + address +':'+ port);
  });
}


// ***** FUNCIONES LECTURA DE DATOS DEL BUFFER ***** //

const dintRead = (l,d) => {
  let aux = (d.message[l+1] << 24) + (d.message[l] << 16) + (d.message[l+3] << 8) + (d.message[l+2]);
  return aux;
}

const wordRead = (lug,data) => {
  let aux = (data.message[lug] << 8) + data.message[lug-1];
  return aux;
};

const intRead = (lug,data) => {
  let aux = (data.message[lug] << 8) + data.message[lug-1];
  if (aux > 32767) {  aux = aux - 65536;  }
  return aux;
};

function createBinaryString(nMask) {
  for (
    var nFlag = 0, nShifted = nMask, sMask = "";
    nFlag < 32;
    nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
  );
  return sMask;
}

// Soft_InsertarOrden;
// Soft_Origen;
// Soft_Destino;
// Soft_Prioridad;