import { useState, useEffect } from "react";
import io from "socket.io-client";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import logo from "./logo.svg";
import "./App.css";

var socket = io.connect(process.env.REACT_APP_API_URI, {
  reconnect: true,
});

function App() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    console.log(socket);
    try {
      console.log("Trying to establish Connection");
      socket.on("connect", () => {
        console.log(
          "Connected! Please CTRL+C and restart if you see this messsage more than twice"
        );
        console.log("disconnecting and reconnecting can take upto a minute");
        console.log(".......");
        socket.emit("login", {
          userKey: provider.env.REACT_APP_TRADE_MADE_STREAMING_API_KEY,
        });
      });

      socket.on("disconnect", (msg) => {
        console.log(msg);
      });

      socket.on("handshake", (msg) => {
        console.log(msg);
        setIsSocketConnected(true);
        socket.emit("symbolSub", { symbol: "USDJPY" });
        socket.emit("symbolSub", { symbol: "GBPUSD" });
        socket.emit("symbolSub", { symbol: "EURUSD" });
      });

      socket.on("subResponse", (msg) => {
        console.log(msg);
      });

      socket.on("message", (msg) => {
        console.log(msg);
      });

      socket.on("price", (message) => {
        var data = message.split(" ");
        console.log(
          data[0] +
            " " +
            data[1] +
            " " +
            data[2] +
            " " +
            data[3] +
            " " +
            parseDate(data[4])
        );
      });
    } catch (error) {
      console.log("Error encountered");
      console.log(error);
    }
  }, []);

  const parseDate = (dateString) => {
    var reggie = /(\d{4})(\d{2})(\d{2})-(\d{2}):(\d{2}):(\d{2}).(\d{3})/;
    var dateArray = reggie.exec(dateString);
    var dateObject = new Date(
      +dateArray[1],
      +dateArray[2] - 1, // Careful, month starts at 0!
      +dateArray[3],
      +dateArray[4],
      +dateArray[5],
      +dateArray[6]
    );
    return dateObject;
  };

  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(result, credential, token, user);
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        console.log(errorCode, errorMessage, email, credential);
      });
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => signIn()}>Login with Google</button>
      </header>
    </div>
  );
}

export default App;
