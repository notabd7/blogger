import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  background-color: #070e12;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Input = styled.input`
  width: 300px;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #0e1b25;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;


const FileList = styled.ul`
  list-style-type: none;
  padding-left: 20px;
`;

const FileItem = styled.li`
  margin: 5px 0;
`;

const FileContent = styled.pre`
  background-color: #000000;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;
const BlogPost = styled.div`
  background-color: #000000;
  padding: 20px;
  border-radius: 4px;
  margin-top: 20px;
`;

function FileTree({ files, onFileClick }) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <FileList>
      {files.map((file, index) => (
        <FileItem key={index}>
        {file.type === 'file' ? (
          <span onClick={() => onFileClick(file)}>📄 {file.name}</span>
        ) : (
          <>
            📁 {file.name}
            {file.contents && <FileTree files={file.contents} onFileClick={onFileClick} />}
          </>
        )}
      </FileItem>
     
      ))}
    </FileList>
  );
}

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [blogPost, setBlogPost] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFiles([]);
    setSelectedFile(null);
    setBlogPost('');
    try {
      const response = await axios.post('http://localhost:5000/analyze-repo', { repoUrl });
      setFiles(response.data.files);
      setBlogPost(response.data.blogPost);
    } catch (err) {
      setError('Failed to analyze repo. Please check the URL and try again.');
      console.error(err);
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  return (
    <AppContainer>
      <h1>Bro, Log...</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repo URL"
        />
        <Button type="submit">Analyze Repo</Button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex' }}>
        {files.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2>Repository Structure:</h2>
            <FileTree files={files} onFileClick={handleFileClick} />
          </div>
        )}
        {selectedFile && (
          <div style={{ flex: 2, marginLeft: '20px' }}>
            <h2>File Content: {selectedFile.name}</h2>
            <FileContent>{selectedFile.content}</FileContent>
          </div>
        )}
      </div>
      {blogPost && (
        <BlogPost>
          <h2>Generated Blog Post:</h2>
          <p>{blogPost}</p>
        </BlogPost>
      )}
    </AppContainer>
  );
}


export default App;