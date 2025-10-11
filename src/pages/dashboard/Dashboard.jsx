import React, { useState } from 'react'
import './Dashboard.scss'
import TranscriptDetails from '../../components/transcript_details/TranscriptDetails'
import { uploadDocumentsToServer } from '../../services/customerService'

const Dashboard = () => {
  const [transcriptFileDetails, setTranscriptFileDetails] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUploadTranscript = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp,";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          // Using hardcoded user_uuid from chatService as reference
          const user_uuid = "d3c92895-27dc-41af-9b1b-b29cdc4d8719";
          
          const response = await uploadDocumentsToServer(user_uuid, file);
          setTranscriptFileDetails(response);
          setIsUploading(false);
          
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload file. Please try again.');
          setIsUploading(false);
        }
      }
    };
    fileInput.click();
  };

  // Dot animation component
  const DotAnimation = () => (
    <span className="dot-animation">
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );



  return (
    <div className='dashboard'>
      {transcriptFileDetails ? (
        <TranscriptDetails transcriptData={transcriptFileDetails?.analysis} />
      ) : (
        <div className='upload-btn'>
          <button 
            onClick={handleUploadTranscript} 
            disabled={isUploading || isAnalyzing}
            className={`upload-button ${isUploading ? 'uploading' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
          >
            {isUploading && (
              <>
                Analyzing in progress
                <DotAnimation />
              </>
            )}
            {isAnalyzing && (
              <>
                Analyzing
                <DotAnimation />
              </>
            )}
            {!isUploading && !isAnalyzing && '+ Upload New Transcript'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard