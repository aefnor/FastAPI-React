import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
}

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 1000,
  });

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesWithProgress = acceptedFiles.map((file) => ({
      id: String(Math.random()), // You might want to use a more reliable ID generation method
      name: file.name,
      progress: 0,
    }));

    setUploadedFiles((prevFiles) => [...prevFiles, ...filesWithProgress]);

    const uploadPromises = filesWithProgress.map(async (fileWithProgress) => {
      const source = axios.CancelToken.source();

      try {
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        
        await instance.post('/upload', formData, {
          onUploadProgress: (progressEvent) => {
            progressEvent.total = 1;
            const progress = (progressEvent.loaded / progressEvent?.total) * 100;
            setUploadedFiles((prevFiles) =>
              prevFiles.map((file) =>
                file.id === fileWithProgress.id ? { ...file, progress } : file
              )
            );
          },
          cancelToken: source.token,
        });
      } catch (error) {
        // Handle upload error
      }
    });

    await Promise.all(uploadPromises);
  }, []);

  const onDelete = (id: string) => {
    // Implement delete functionality here
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        <p>Drag & drop some files here, or click to select files</p>
      </div>
      <div>
        {uploadedFiles.map((file) => (
          <div key={file.id}>
            <p>{file.name}</p>
            <progress value={file.progress} max={100} />
            <button onClick={() => onDelete(file.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const dropzoneStyles: React.CSSProperties = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default FileUpload;
