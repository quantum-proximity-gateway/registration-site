'use client'

import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import  {Button, Text, Box} from "@chakra-ui/react";

const RegisterFace = () => {
    const searchParams = useSearchParams();
    const mac_address = searchParams.get('mac_address'); // Read mac_address from URL parameters
    const videoRef = useRef<HTMLVideoElement>(null);
    const [countdown, setCountdown] = useState(0);
    const [record, setRecord] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

    useEffect(() => {
        if (!record) return;

        const getVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (event) => {
              chunks.push(event.data);
            };
            recorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              setVideoBlob(blob);
              stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();

            setMediaRecorder(recorder);

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

    const handleSubmit = async () => {
        if (!videoBlob) return;
  
        const formData = new FormData();
        formData.append('video', videoBlob, 'recorded-video.webm');
        formData.append('mac_address', mac_address as string);
    
        try {
          const response = await fetch('YOUR_SERVER_URL', {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            console.log('Video uploaded successfully');
          } else {
            console.error('Failed to upload video');
          }
        } catch (error) {
          console.error('Error uploading video:', error);
        }
    };

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
              onClick={handleSubmit}
              colorScheme="teal" 
              color="green.300"
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
        <video style={{ borderRadius: '10px', marginBottom: '16px' }} ref={videoRef} autoPlay />
      )}
      {countdown > 0 ? <Text as="h2" fontSize="xl">{countdown}</Text> : null}
    </Box>
    );
    };

    export default RegisterFace;