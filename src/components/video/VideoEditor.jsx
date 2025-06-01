import React, { useEffect, useRef, useState } from 'react';
import { Edit, Canvas, Controls } from '@shotstack/shotstack-studio';

const VideoEditor = ({ timelineVideos }) => {
  const canvasRef = useRef(null);
  const [shotstackEdit, setShotstackEdit] = useState(null);
  const [shotstackCanvas, setShotstackCanvas] = useState(null);
  const [shotstackControls, setShotstackControls] = useState(null);
  const [isLoadingEditor, setIsLoadingEditor] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!timelineVideos || timelineVideos.length === 0) {
      // setError("No videos provided to the editor.");
      // setIsLoadingEditor(false);
      // console.log("VideoEditor: No timeline videos provided yet.");
      return; // Wait for videos
    }
    if (!canvasRef.current) {
      // setError("Canvas element not available.");
      // setIsLoadingEditor(false);
      // console.log("VideoEditor: Canvas ref not available yet.");
      return; // Wait for canvas ref
    }

    const initEditor = async () => {
      setIsLoadingEditor(true);
      setError(null);
      try {
        // 1. Initialize the edit with dimensions and background color
        //    Using a common 16:9 aspect ratio, e.g., 1280x720
        const editInstance = new Edit({ width: 1280, height: 720 }, '#000000');
        await editInstance.load();
        setShotstackEdit(editInstance);

        // 2. Create a canvas to display the edit
        //    The SDK will look for an element with data-shotstack-studio attribute
        //    or we can pass the element directly if the API supports it.
        //    For now, ensure the div below has the attribute.
        const canvasInstance = new Canvas(editInstance.size, editInstance, canvasRef.current);
        await canvasInstance.load();
        setShotstackCanvas(canvasInstance);
        
        // Center the edit on the canvas
        canvasInstance.centerEdit();
        canvasInstance.zoomToFit();


        // 3. Load video clips from timelineVideos
        let cumulativeDuration = 0;
        for (const videoItem of timelineVideos) {
          if (videoItem.isVideo && videoItem.url) {
            // Need to get video duration. This is a bit tricky.
            // For now, let's assume a default duration or fetch it.
            // This is a placeholder, actual duration fetching is needed.
            const videoDuration = await getVideoDuration(videoItem.url); // Implement this function

            editInstance.addClip(0, { // Add all to track 0 for now
              asset: {
                type: 'video',
                src: videoItem.url,
              },
              start: cumulativeDuration,
              length: videoDuration, // in seconds
            });
            cumulativeDuration += videoDuration;
          }
        }
        
        // If no clips were added, reflect that the timeline is empty or has no videos
        if (editInstance.totalDuration === 0) {
            console.log("VideoEditor: No video clips loaded into Shotstack Edit. Timeline might be empty or contain no processable videos.");
        }


        // 4. Add keyboard controls
        const controlsInstance = new Controls(editInstance);
        await controlsInstance.load();
        setShotstackControls(controlsInstance);

        console.log("Shotstack Editor initialized successfully.");

      } catch (err) {
        console.error("Failed to initialize Shotstack editor:", err);
        setError(`Failed to initialize editor: ${err.message}`);
      } finally {
        setIsLoadingEditor(false);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      shotstackCanvas?.dispose();
      // shotstackControls?.dispose(); // If Controls has a dispose method
      // shotstackEdit?.dispose(); // If Edit has a dispose method
      console.log("Shotstack Editor cleaned up.");
    };
  }, [timelineVideos]); // Re-initialize if timelineVideos change

  // Helper function to get video duration (needs proper implementation)
  const getVideoDuration = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        resolve(videoElement.duration); // duration is in seconds
      };
      videoElement.onerror = (err) => {
        console.error("Error loading video metadata for duration:", videoUrl, err);
        reject(new Error(`Could not get duration for ${videoUrl}`));
        // Fallback to a default duration if needed, e.g., resolve(5) for 5 seconds
      };
      videoElement.src = videoUrl;
    });
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Ensure the canvas container div is rendered before initEditor tries to use its ref
  // The Shotstack Canvas typically appends its own canvas element into the provided container
  return (
    <div className="shotstack-editor-container w-full h-[400px] bg-gray-100 relative">
      {isLoadingEditor && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <p>Loading Video Editor...</p> {/* Replace with a proper loader icon */}
        </div>
      )}
      <div ref={canvasRef} data-shotstack-studio className="w-full h-full">
        {/* Shotstack Canvas will render here */}
      </div>
      {shotstackEdit && !isLoadingEditor && (
        <div className="controls p-2 flex gap-2 justify-center bg-gray-200">
          <button onClick={() => shotstackEdit.play()} className="px-3 py-1 bg-blue-500 text-white rounded">Play</button>
          <button onClick={() => shotstackEdit.pause()} className="px-3 py-1 bg-blue-500 text-white rounded">Pause</button>
          <button onClick={() => shotstackEdit.stop()} className="px-3 py-1 bg-blue-500 text-white rounded">Stop</button>
          {/* Add more custom controls as needed */}
        </div>
      )}
    </div>
  );
};

export default VideoEditor;
