// FileList.tsx
import React from 'react';

interface FileListProps {
  files: string[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  return (
    <div>
      <h1>List of Files</h1>
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;