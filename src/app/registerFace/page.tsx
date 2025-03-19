'use client'

import { useRef, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Text, Box } from "@chakra-ui/react";
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create a separate component that uses useSearchParams
const RegisterFaceContent = () => {
  const searchParams = useSearchParams();
  const mac_address = searchParams.get('mac_address'); // Read mac_address from URL parameters
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState(0);
  const [record, setRecord] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  // Final animation
  const [showGoodbye, setShowGoodbye] = useState(false);

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

    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoBlob, 'recorded-video.webm');
    formData.append('mac_address', mac_address as string);

    try {
      const response = await axios.post('http://127.0.0.1:8000/register/face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        console.log('Video uploaded successfully');
        setUploading(false);
        setShowGoodbye(true);
      } else {
        console.error('Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" fontFamily="IBM Plex Sans, sans-serif">

      {showGoodbye && (
        <div
        className={`flex flex-col items-center justify-center min-h-screen py-2 fadeIn`}
        style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          <Text as="h1" fontSize="3xl" mb={2}>Thank you for registering!</Text>
          <Text as="h2" fontSize="2xl">You may now approach any QPG enabled device with your key.</Text>
        </div>
      )}
      {!record && !showGoodbye ? (
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
          {uploading ? (
            <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mb-2"></div>
              <Text>Uploading video...</Text>
            </Box>
          ): null}
        </>
      ) : (
        <video style={{ borderRadius: '10px', marginBottom: '16px' }} ref={videoRef} autoPlay />
      )}
      {countdown > 0 ? <Text as="h2" fontSize="xl">{countdown}</Text> : null}
    </Box>
  );
};

// Main component that wraps the content in Suspense
const RegisterFace = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterFaceContent />
    </Suspense>
  );
};

export default RegisterFace;