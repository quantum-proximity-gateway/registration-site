'use client'

import React, { useRef, useEffect, useState } from 'react';
import  {Text} from "@chakra-ui/react";


const RegisterFace = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState(5); // 5 seconds of recording

  

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const countdownInterval = setInterval(() => {
            setCountdown(prevCountdown => {
              if (prevCountdown <= 1) {
                clearInterval(countdownInterval);
                stream.getTracks().forEach(track => track.stop());
              }
              return prevCountdown - 1;
            });
          }, 1000);
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    getVideo();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection:'column',justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        <h1>User Registration</h1>
        <video style={{borderRadius:'10px'}}ref={videoRef} autoPlay />
        <h2>{countdown}</h2>
    </div>
  );
};

export default RegisterFace;