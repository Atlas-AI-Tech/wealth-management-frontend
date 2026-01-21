import React, { useMemo, useState } from "react";
import "./Dashboard.scss";
import TranscriptDetails from "../../components/transcript_details/TranscriptDetails";
import {
  uploadAudioToServer,
  uploadDocumentsToServer,
} from "../../services/customerService";

const USER_UUID = "d3c92895-27dc-41af-9b1b-b29cdc4d8719"; // TODO: replace with real user

const Dashboard = () => {
  const [result, setResult] = useState(null); // holds analysis + optional audio/meta
  const [isUploading, setIsUploading] = useState(false);
  const [activeUpload, setActiveUpload] = useState(null); // "text" | "audio" | null

  const filePicker = (accept, onPick) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) onPick(file);
    };
    input.click();
  };

  const startUpload = (type) => {
    if (isUploading) return;

    const accept =
      type === "audio"
        ? "audio/*"
        : ".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp";

    filePicker(accept, async (file) => {
      setIsUploading(true);
      setActiveUpload(type);

      try {
        const response =
          type === "audio"
            ? await uploadAudioToServer(USER_UUID, file)
            : await uploadDocumentsToServer(USER_UUID, file);

        setResult({ ...response, uploadType: type });
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
        setActiveUpload(null);
      }
    });
  };

  const DotAnimation = () => (
    <span className="dot-animation">
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );

  const buttonLabel = useMemo(() => {
    if (!isUploading) return "+ Upload New File";
    const label =
      activeUpload === "audio"
        ? "Processing audio"
        : "Analyzing transcript";
    return (
      <>
        {label} <DotAnimation />
      </>
    );
  }, [isUploading, activeUpload]);

  return (
    <div className="dashboard">
      {!result ? (
        <div className="upload-panel">
          <div
            className={`upload-card ${
              activeUpload === "text" ? "active" : ""
            }`}
          >
            <div className="card-head">
              <p className="eyebrow">Transcript</p>
              <h3>Upload text transcript</h3>
              <p className="helper">
                PDF, DOC, images supported. We will extract and analyze the
                conversation for you.
              </p>
            </div>
            <button
              onClick={() => startUpload("text")}
              disabled={isUploading}
              className={`cta ${isUploading ? "busy" : ""}`}
            >
              {activeUpload === "text" && isUploading ? (
                buttonLabel
              ) : (
                "+ Upload Transcript"
              )}
            </button>
          </div>

          <div
            className={`upload-card ${
              activeUpload === "audio" ? "active" : ""
            }`}
          >
            <div className="card-head">
              <p className="eyebrow">Audio</p>
              <h3>Upload call recording</h3>
              <p className="helper">
                MP3 audio format. We transcribe, analyze, and
                give you playback plus transcript links.
              </p>
            </div>
            <button
              onClick={() => startUpload("audio")}
              disabled={isUploading}
              className={`cta ${isUploading ? "busy" : ""}`}
            >
              {activeUpload === "audio" && isUploading ? (
                buttonLabel
              ) : (
                "+ Upload Audio File"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="results-view">
          <div className="result-actions">
            <div className="summary-chip">
              {result.uploadType === "audio" ? "Audio analysis" : "Transcript analysis"}
            </div>
            <button
              className="ghost-btn"
              onClick={() => setResult(null)}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  Preparing <DotAnimation />
                </>
              ) : (
                "Upload another"
              )}
            </button>
          </div>

          {(result?.audio_url || result?.transcript_url) && (
            <div className="audio-meta">
              {result?.audio_url && (
                <div className="audio-player">
                  <p className="eyebrow">Playback</p>
                  <audio controls src={result.audio_url}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              {result?.transcript_url && (
                <div className="transcript-link">
                  <p className="eyebrow">Transcript file</p>
                  <a
                    href={result.transcript_url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-btn"
                  >
                    View transcript
                  </a>
                </div>
              )}
            </div>
          )}

          <TranscriptDetails transcriptData={result?.analysis} />

         
        </div>
      )}
    </div>
  );
};

export default Dashboard;