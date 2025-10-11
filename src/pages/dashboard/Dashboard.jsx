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
          
          // Simulate upload time (short period)
          setTimeout(async () => {
            const response = await uploadDocumentsToServer(user_uuid, file);
            
            // Start analyzing phase (longer period)
            setIsUploading(false);
            setIsAnalyzing(true);
            
            // Simulate analysis time (longer delay for analyzing)
            setTimeout(() => {
              setTranscriptFileDetails(response);
              setIsAnalyzing(false);
              console.log('File uploaded successfully:', response);
            }, 4000); // 4 second delay for analyzing
            
          }, 800); // 800ms for uploading phase
          
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload file. Please try again.');
          setIsUploading(false);
          setIsAnalyzing(false);
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
        <TranscriptDetails transcriptData={transcriptFileDetails} />
      ) : (
        <div className='upload-btn'>
          <button 
            onClick={handleUploadTranscript} 
            disabled={isUploading || isAnalyzing}
            className={`upload-button ${isUploading ? 'uploading' : ''} ${isAnalyzing ? 'analyzing' : ''}`}
          >
            {isUploading && (
              <>
                Uploading
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