// EXPRESS
const express = require('express');
const app = express();
const server = require('dgram').createSocket('udp4');
let http = require('http').Server(app);
let io = require('socket.io')(http);
app.use(express.static('public'));
let port = process.env.PORT || 8080;
let udpPort = 41234;
let udpAddress = '192.168.10.4';
// DATA A ESCRIBIR - MAXIMO 50 CARACTERES
let udpDataSend = 'probando envío de string UDP PLC SEW MOVITOOLS';

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});
server.on('message', (msg, rinfo) => {
  udpFromPLC(msg, readParameters, vEstatico);
  sendToPLC(udpDataSend, 'string', udpAddress, udpPort);
  console.log(vEstatico);
  console.log(`Recibido: ${msg.length} bytes de ${rinfo.address}: ${rinfo.port}`,);
});
server.on('listening', () => {
  const address = server.address();
  address.address = udpAddress;
  console.log(`server listening ${address.address}:${address.port}`);
});
server.bind(udpPort);

http.listen(port, function() {
  // http.listen(port, '192.168.0.106', function () {
  console.log(`Escuchando en puerto ${port}`);
});

// SOCKET
let gSocket;
io.on('connection', function(socket) {
  console.log(`Usuario conectado con el ID: ${socket.id}`);
  gSocket = socket;

  gSocket.on('disconnect', function() {
    console.log(`Usuario ${gSocket.id} desconectado...`);
  });
  gSocket.on('test', function(data) {
    console.log(data);
  });
});

setInterval(() => {
  if (gSocket) {
    // gSocket.emit("test", Math.random() * 100);
    gSocket.emit('fromPLC', fromPLC);
  }
}, 50);

//COMUNICACION PLC//
const udpFromPLC = (msg, readParameters, vEstatico) => {
  let values = Object.values(vEstatico);
  let offset = 0;
  let aux = null;

  aux = parseInt(readParameters.bits);
  bitRead(msg, aux, values);
  let msgPosicion = aux / 8;
  offset = parseInt(offset + aux);

  aux = parseInt(readParameters.int);
  for (let i = 0; i < aux; i++) {
    intRead(msg, offset, msgPosicion, values);
    msgPosicion = msgPosicion + 2;
    offset = offset + 1;
  }
  aux = parseInt(readParameters.word);
  for (let i = 0; i < aux; i++) {
    wordRead(msg, offset, msgPosicion, values);
    msgPosicion = msgPosicion + 2;
    offset = offset + 1;
  }
  aux = parseInt(readParameters.dint);
  for (let i = 0; i < aux; i++) {
    dintRead(msg, offset, msgPosicion, values);
    msgPosicion = msgPosicion + 4;
    offset = offset + 1;
  }
  aux = parseInt(readParameters.dword);
  for (let i = 0; i < aux; i++) {
    dwordRead(msg, offset, msgPosicion, values);
    msgPosicion = msgPosicion + 4;
    offset = offset + 1;
  }
  aux = parseInt(readParameters.string);
  for (let i = 0; i < aux; i++) {
    strRead(msg, offset, msgPosicion, values);
    msgPosicion = msgPosicion + 50;
    offset = offset + 1;
  }
  // socket.emit(vEstatico, vEstatico)
};
const sendToPLC = (msg, format, address, port) => {
  let tam = null;
  let arreglo = [];
  switch (format) {
    case 'bit':
      let bin2hex = Buffer.from(msg.toString(10));
      let bu = Buffer.alloc(48);
      tam = bin2hex.length + 64;
      m = Buffer.concat([bin2hex, bu], tam);
      break;
    case 'string':
      tam = msg.length;
      let emptyB = Buffer.alloc(48);
      for (let i = 0; i < tam; i++) {
        arreglo.push(msg.charCodeAt(i));
      }
      tam = tam + 48;
      let buff = Buffer.from(arreglo);
      m = Buffer.concat([buff, emptyB], tam);
      console.log(`BAFFER M: ${m}`);
      break;
  }
  server.send(m, 0, m.length, port, address, function(err, bytes) {
    if (err) throw err;
    console.log(`Se han escrito ${bytes} bytes en ${address}:${port}`);
  });
};

//PARAMETROS//
let readParameters = {
  bits: 16,
  int: 3,
  word: 2,
  dint: 2,
  dword: 2,
  string: 6,
};
let vEstatico = {
  bit0: { value: null, comment: 'bit0' },
  bit1: { value: null, comment: 'bit1' },
  bit2: { value: null, comment: 'bit2' },
  bit3: { value: null, comment: 'bit3' },
  bit4: { value: null, comment: 'bit4' },
  bit5: { value: null, comment: 'bit5' },
  bit6: { value: null, comment: 'bit6' },
  bit7: { value: null, comment: 'bit7' },
  bit8: { value: null, comment: 'bit8' },
  bit9: { value: null, comment: 'bit9' },
  bit10: { value: null, comment: 'bit10' },
  bit11: { value: null, comment: 'bit11' },
  bit12: { value: 555, comment: 'bit12' },
  bit13: { value: null, comment: 'bit13' },
  bit14: { value: null, comment: 'bit14' },
  bit15: { value: null, comment: 'bit15' },
  int0: { value: null, comment: 'int0' },
  int1: { value: null, comment: 'int1' },
  int2: { value: null, comment: 'int2' },
  word0: { value: null, comment: 'word0' },
  word1: { value: null, comment: 'word1' },
  dint0: { value: null, comment: 'dint0' },
  dint1: { value: null, comment: 'dint1' },
  dword0: { value: null, comment: 'dword0' },
  dword1: { value: null, comment: 'dword1' },
  string0: { value: null, comment: 'string0' },
  string1: { value: null, comment: 'string1' },
  string2: { value: null, comment: 'string2' },
  string3: { value: null, comment: 'string3' },
  string4: { value: null, comment: 'string4' },
  string5: { value: null, comment: 'string5' },
};

//FUNCIONES DE LECTURA DE DATOS//
const bitRead = (data, iterations, values) => {
  iterations = iterations / 8;
  for (it = 0; it < iterations; it++) {
    let d = 0;
    let bool = createBinaryString(data[it]);
    for (let i = 0 + it * 8; i < 8 * (it + 1); d++, i++) {
      values[i].value = parseInt(bool[d]);
    }
  }
  return;
};
createBinaryString = (nMask) => {
  for (
    var nFlag = 0, nShifted = nMask, sMask = '';
    nFlag < 32;
    nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
  );
  sMask = sMask.slice(24);
  var x = sMask.length;
  var binaryNumber = '';
  while (x >= 0) {
    binaryNumber = binaryNumber + sMask.charAt(x);
    x--;
  }
  return binaryNumber;
};
const intRead = (data, offset, msgPosicion, values) => {
  let aux = (data[msgPosicion + 1] << 8) + data[msgPosicion];
  if (aux > 32767) aux = aux - 65536;
  values[offset].value = parseInt(aux);
};
const wordRead = (data, offset, msgPosicion, values) => {
  let aux = (data[msgPosicion + 1] << 8) + data[msgPosicion];
  values[offset].value = parseInt(aux);
};
const dintRead = (data, offset, msgPos, values) => {
  let aux =
    (data[msgPos + 1] << 24) +
    (data[msgPos] << 16) +
    (data[msgPos + 3] << 8) +
    data[msgPos + 2];
  values[offset].value = parseInt(aux);
};
const dwordRead = (data, offset, msgPos, values) => {
  let aux =
    (data[msgPos + 1] << 24) +
    (data[msgPos] << 16) +
    (data[msgPos + 3] << 8) +
    data[msgPos + 2];
  if (aux < 0) {
    aux = aux + 4294967296;
  }
  values[offset].value = parseInt(aux);
};
const strRead = (data, offset, msgPos, values) => {
  let str1 = '';
  let n = null;
  let x = msgPos + 50;
  for (let i = msgPos; i < x; i++) {
    str1 = `${str1}${data.toString('ascii', i, i + 1)}`;
  }
  n = str1.search('\u0000');
  values[offset].value = str1.slice(0, n);
};
