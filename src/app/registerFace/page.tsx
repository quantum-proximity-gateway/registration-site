'use client'

import React, { useRef, useEffect, useState } from 'react';
import  {Button, Text, Box} from "@chakra-ui/react";


const RegisterFace = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [countdown, setCountdown] = useState(0);
    const [record, setRecord] = useState(false);
    const [recorded, setRecorded] = useState(false);

    useEffect(() => {
        if (!record) return;

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
                    setRecord(false);
                    setRecorded(true);
                }
                return prevCountdown - 1;
                });
            }, 1000);
        } catch (err) {
            console.error("Error accessing webcam: ", err);
        }
        };

        getVideo();
    }, [record]);

    return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" fontFamily="IBM Plex Sans, sans-serif">
      {!record ? (
        <>
          <Text as="h1" fontSize="4xl" mb={4}>Face Registration</Text>
          <Text as="h2" fontSize="xl" mb={4}>Look into the camera for 5 seconds</Text>
          <Button 
            onClick={() => {setRecord(true); setCountdown(5);}} 
            colorScheme="teal" 
            size="lg" 
            mb={4}
            borderRadius="md"
            boxShadow="md"
            px="8"
          >
            Record
          </Button>
          {recorded ? (
            <>
            <Button 
            colorScheme="teal" 
            size="lg" 
            mb={4}
            borderRadius="md"
            boxShadow="md"
            px="8"
          >
            Submit face registration
          </Button>
          </>
          ) : <></>}
        </>
      ) : (
        <Box as="video" borderRadius="10px" ref={videoRef} autoPlay mb={4} />
      )}
      {countdown > 0 ? <Text as="h2" fontSize="xl">{countdown}</Text> : null}
      
     
    </Box>
    );
    };

    export default RegisterFace;