"use client";
declare global {
  interface Navigator {
    serial: any;
  }
}
import { Button, Input, Stack } from "@chakra-ui/react";
import { Alert } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import '@fontsource/ibm-plex-sans';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function connectSerial() { // Connect to ESP32 (cu.wchuusbserial)
  console.log("connectSerial called");
  const log = document.getElementById('target');

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    
    const decoder = new TextDecoderStream(); // Decodes incoming data from ESP32
    port.readable.pipeTo(decoder.writable);

    const reader = decoder.readable.getReader();
    let macAddress = "";

    while (true) {
      const { value, done } = await reader.read();
      
      if (value) {
        console.log('[readLoop] value:', value, "length:", value.length);
        if (value.length == 19) { // MAC Address are 17 characters long + 2 newlines
          macAddress = value;
          reader.releaseLock();
          break;
        }
      } else {
        console.log('[readLoop] value: N/A length: N/A');
      }

      if (done) {
        console.log('[readLoop] DONE', done);
        reader.releaseLock();
        break;
      } else {
        console.log('[readLoop] NOT DONE', done);
      }
    }

    return macAddress;

  } catch (error) {
    console.error('There was an error reading the data:', error);
  }
}

export default function Home() {
  const [mac_address, setMacAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connected, setConnected] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [currentAlert, setCurrentAlert] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setShowWelcome(false);
      }, 1000); // match fadeOut duration
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleRegister() {
    axios.post(`${API_URL}/register`, {
      mac_address,
      username,
      password
    }).then((res) => {
      alert("Device registered successfully");
    }).catch((err) => {
      if (err.response.status == 409) {
        setCurrentAlert("Device already registered");
      } else {
        setCurrentAlert("Error registering device");
      }
      setTimeout(() => {
        setCurrentAlert("");
      }, 2000);
    });
  }

  function handleConnect() {
    console.log("handleConnect called");
    console.log("navigator.serial", navigator.serial);
    if (navigator.serial) {
      connectSerial().then(address => {
        if (address) {
          setMacAddress(address);
          setConnected(true);
        }
      });
    } else {
      alert("Web Serial API not supported in this browser, install the latest version of Chrome or Edge");
    }
  }

  return (
    <>
      <style jsx>{`
        .fadeIn {
          animation: fadeIn 1s ease-in forwards;
        }
        .fadeOut {
          animation: fadeOut 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      {showWelcome && (
        <div
          className={`flex flex-col items-center justify-center min-h-screen py-2 ${
            isFading ? 'fadeOut' : 'fadeIn'
          }`}
          style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          <h1 className="text-4xl">Quantum Proximity Gateway - Registration</h1>
        </div>
      )}
      {!showWelcome && (
      <div className="flex flex-col items-center justify-center relative" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {currentAlert && (
          <div style={{ width: '50%', padding: '1rem', position: 'absolute', top: '1rem' }}>
            <Alert
              status="error"
              title={currentAlert}
            />
          </div>
        )}
      <div className="flex flex-col items-center justify-center min-h-screen py-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>

      
      <h1 className="text-4xl">Device Registration</h1>
      <Stack className="sm:p-20">
        {/* MAC address is read-only, so we can turn off autocomplete */}
        <Input
          id="macAddress"
          name="macAddress"
          placeholder="MAC Address"
          variant="flushed"
          autoComplete="off"
          value={mac_address}
          readOnly
        />
        {!connected && (
          <Button variant="surface" width="100%" onClick={handleConnect}>
            Connect to device
          </Button>
        )}
        {/* Username: let browser autofill using autoComplete="username" */}
        <Input
          id="username"
          name="username"
          placeholder="Username"
          variant="flushed"
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        {/* Password: let browser autofill using autoComplete="current-password" (or "new-password" if appropriate) */}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          variant="flushed"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="surface"
          className="mt-4"
          width="100%"
          onClick={handleRegister}
        >
          Register
        </Button>
      </Stack>
    </div>
    </div>
    )}
    </>
  );
}
