// LandingPage.tsx
import React from 'react';
import FileList from './FilesList';
import FileUploader from '../components/FileUploader';

const LandingPage: React.FC = () => {
  // Example list of files
  const files = ['file1.txt', 'file2.pdf', 'file3.jpg'];

  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <div>
        <FileUploader />
      </div>
      <FileList files={files} />
    </div>
  );
};

export default LandingPage;