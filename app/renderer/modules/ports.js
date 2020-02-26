import { setSerialPorts, getDataPort } from "../actions/catwan-actions";

import store from "../store";
import SerialPort from "serialport";
import Readline from "@serialport/parser-readline";
import { userInfo } from "os";

import fs from "fs";

let logFileName;
if (process.platform == "darwin") {
  console.log(userInfo().username);
  logFileName = `/Users/${
    userInfo().username
  }/Documents/electroniccats-trackingcat`;
} else if (process.platform == "win32") {
  console.log(userInfo().username);
  logFileName = `C:\\Users\\${
    userInfo().username
  }\\Documents\\electroniccats-trackingcat`;
} else if (process.platform == "linux") {
  console.log(userInfo().username);
  logFileName = `/home/electroniccats-trackingcat`;
}

fs.mkdir(`${logFileName}`, { recursive: true }, function(err) {
  if (err) {
    return console.error(err);
  }
  console.log("Directory created successfully!");
});
console.log(logFileName);
var parser = new Readline();

let _state = store.getState();
console.log(_state);

export const getters = {
  async LIST_PORTS() {
    console.log("LIST_PORTS()");
    console.log(_state.activePort);
    let all_ports = [];
    await SerialPort.list().then(ports => {
      ports.forEach(function(port) {
        console.log(port.path);
        console.log(port.pnpId);
        console.log(port.manufacturer);
        all_ports.push(port.comName);
      });
    });

    store.dispatch(setSerialPorts(all_ports));
  },
  __SET_PORT() {
    var connection = this.connection;
    var port = this.port;
    console.log(port);

    function* closePort() {
      var sp = new SerialPort(port, { baudRate: 9600, autoOpen: true });

      while (true) {
        if (connection) {
          sp.update();
          yield parser;
        } else {
          parser.resume();
          sp.pipe(parser);

          yield sp;
        }
      }
    }
    return closePort().next().value;
  }
};

export const actions = {
  CONNECT_TO_SERIALPORT(port, __url, __urlPort, connection) {
    const state = { port, __url, __urlPort, connection };
    const sp = getters.__SET_PORT.call(state);
    console.table(state);
    sp.on("close", function(err) {
      console.error("close port!", err);
    });

    sp.on("error", function(err) {
      console.log(err);
    });

    let timeDate = "init";
    let log;

    parser.on("data", function(data) {
      let date = new Date();

      console.log("Send data port!");
      console.log(data.split(","));
      let parser = data.split(","); //* Parser data ,
      store.dispatch(getDataPort(parser));
      log = data + "\n";

      fs.appendFile(`${logFileName}/log.txt`, log + timeDate + ":   ", function(
        error
      ) {
        if (error) throw error; // Handle the error just in case
      });

      timeDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}, hr: ${date.getHours()} min: ${date.getMinutes()} sec: ${date.getSeconds()}`;
    });
  }
};
