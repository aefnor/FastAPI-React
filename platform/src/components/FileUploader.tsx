// import React, { useCallback, useState } from "react";
// import { useDropzone } from "react-dropzone";
// import axios, { CancelTokenSource } from "axios";
// // import @tanstack/react-query
// import { useQuery } from "@tanstack/react-query";

// interface UploadedFile {
//   id: string;
//   name: string;
//   progress: number;
//   completed: boolean; // Add completed property
// }

// const instance = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   timeout: 1000,
// });

// const fetchTaskStatus = async (taskId: string) => {
//   const response = await instance.get(`/task/${taskId}`);
//   return response.data;
// };

// const FileUpload: React.FC = () => {
//   const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
//   // Assuming taskId is defined somewhere in your component
//   const [taskId, setTaskId] = useState("some-task-id");
//   const { data, error, isLoading, refetch } = useQuery({
//     queryKey: ["taskStatus", taskId],
//     queryFn: () => fetchTaskStatus(taskId),
//   });
//   console.log(data, error, isLoading);
//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     const filesWithProgress = acceptedFiles.map((file) => ({
//       id: String(Math.random()), // You might want to use a more reliable ID generation method
//       name: file.name,
//       progress: 0,
//       completed: false, // Initialize completed as false
//     }));

//     setUploadedFiles((prevFiles) => [...prevFiles, ...filesWithProgress]);

//     const uploadPromises = filesWithProgress.map(async (fileWithProgress) => {
//       const source = axios.CancelToken.source();

//       try {
//         const formData = new FormData();
//         formData.append("file", acceptedFiles[0]);

//         let res = await instance.post("/upload", formData, {
//           onUploadProgress: (progressEvent) => {
//             const progress = Math.round(
//               (progressEvent.loaded * 100) / (progressEvent.total || 1)
//             );
//             setUploadedFiles((prevFiles) =>
//               prevFiles.map((file) =>
//                 file.id === fileWithProgress.id
//                   ? { ...file, progress, completed: progress === 100 }
//                   : file
//               )
//             );
//           },
//           cancelToken: source.token,
//         });
//         console.log(res.data);
//         setTaskId(res.data.task_id);
//         refetch();
//       } catch (error) {
//         // Handle upload error
//       }
//     });

//     await Promise.all(uploadPromises);
//   }, []);

//   const onDelete = (id: string) => {
//     // Implement delete functionality here
//     setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
//   };

//   const { getRootProps, getInputProps } = useDropzone({ onDrop });

//   return (
//     <div>
//       <div {...getRootProps()} style={dropzoneStyles}>
//         <input {...getInputProps()} />
//         <p>Drag & drop some files here, or click to select files</p>
//       </div>
//       <div>
//         {uploadedFiles.map((file) => {
//           console.log(file);
//           return (
//             <div key={file.id}>
//               <p>{file.name}</p>
//               {file.completed ? (
//                 <span style={{ color: "green" }}>✔</span>
//               ) : (
//                 <progress value={file.progress} max={100} />
//               )}
//               <button onClick={() => onDelete(file.id)}>Delete</button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const dropzoneStyles: React.CSSProperties = {
//   border: "2px dashed #cccccc",
//   borderRadius: "4px",
//   padding: "20px",
//   textAlign: "center",
//   cursor: "pointer",
// };

// export default FileUpload;

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle } from "@mui/icons-material";

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  completed: boolean;
}

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 1000,
});

const fetchTaskStatus = async (taskId: string) => {
  const response = await instance.get(`/task/${taskId}`);
  return response.data;
};

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [taskId, setTaskId] = useState("some-task-id");

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["taskStatus", taskId],
    queryFn: () => fetchTaskStatus(taskId),
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const filesWithProgress = acceptedFiles.map((file) => ({
        id: String(Math.random()),
        name: file.name,
        progress: 0,
        completed: false,
      }));

      setUploadedFiles((prevFiles) => [...prevFiles, ...filesWithProgress]);

      const uploadPromises = filesWithProgress.map(async (fileWithProgress) => {
        const formData = new FormData();
        formData.append("file", acceptedFiles[0]);

        try {
          const res = await instance.post("/upload", formData, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setUploadedFiles((prevFiles) =>
                prevFiles.map((file) =>
                  file.id === fileWithProgress.id
                    ? { ...file, progress, completed: progress === 100 }
                    : file
                )
              );
            },
          });
          setTaskId(res.data.task_id);
          refetch();
        } catch (error) {
          console.error("Upload failed", error);
        }
      });

      await Promise.all(uploadPromises);
    },
    [refetch]
  );

  const onDelete = (id: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box sx={{ width: "100%", maxWidth: 500, margin: "auto", mt: 4 }}>
      <Paper
        {...getRootProps()}
        sx={{
          padding: 3,
          textAlign: "center",
          border: "2px dashed #ccc",
          borderRadius: 2,
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 40, color: "#1976d2" }} />
        <Typography variant="h6">
          Drag & drop files here, or click to select files
        </Typography>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {uploadedFiles.map((file) => (
          <Paper
            key={file.id}
            sx={{ display: "flex", alignItems: "center", padding: 2, mb: 2 }}
          >
            <Typography sx={{ flexGrow: 1 }}>{file.name}</Typography>
            {file.completed ? (
              <CheckCircle sx={{ color: "green" }} />
            ) : (
              <Box sx={{ width: "100px", mr: 2 }}>
                <LinearProgress variant="determinate" value={file.progress} />
              </Box>
            )}
            <IconButton onClick={() => onDelete(file.id)}>
              <Delete color="error" />
            </IconButton>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FileUpload;
