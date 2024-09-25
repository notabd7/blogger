import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  background-color: #070e12;
  color: white;
  min-height: 100vh;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  position: relative;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60%;  /* Set the width for the left content */
`;

const RightContainer = styled.div`
  width: ${(props) => (props.isMaximized ? '35%' : '0px')};  /* Small or large size */
  height: ${(props) => (props.isMaximized ? 'auto' : '0px')};
  margin-left: 10px;
  marign-right:10px;
  overflow: hidden;
  transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;  /* Smooth transition */
  cursor: pointer;

  &:hover {
    transform: ${(props) => (props.isMaximized ? 'none' : 'scale(1.2)')};  /* Slight zoom-in effect only for small view */
  }
`;

const IconButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
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

const QuestionContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const QuestionText = styled.p`
  font-size: 16px;
  margin-bottom: 10px;
`;

const AnswerInput = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  resize: none;
`;

const SubmitButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const FileList = styled.ul`
  list-style-type: none;
  padding-left: 20px;
  font-size: 10px;
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
  position: relative;
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
  //const [blogPost, setBlogPost] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);  // State to control the maximization
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const questions = [
    "Q1: 3 technical challenges you faced and how you solved them? Keep it short and sweet.",
    "Q2: Describe the architecture/how it works as if I am a 10 year old. Again, short and sweet",
    "Q3: Paste two of your favorite code snippets from your project and why they're your favorite."
  ];


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFiles([]);
    setCurrentQuestion(0);
    setAnswers({ q1: '', q2: '', q3: '' });
    setCurrentAnswer('');
    setSelectedFile(null);
    //setBlogPost('');
    try {
      const response = await axios.post('http://localhost:5000/analyze-repo', { repoUrl });
      setFiles(response.data.files);
      //setBlogPost(response.data.blogPost);
    } catch (err) {
      setError('Failed to analyze repo. Please check the URL and try again.');
      console.error(err);
    }
  };

  const handleAnswerSubmit = () => {
    if (currentAnswer.trim().length > 0) {
      const newAnswers = { ...answers };
      newAnswers[`q${currentQuestion}`] = currentAnswer;
      setAnswers(newAnswers);
      console.log(`Q${currentQuestion}: ${questions[currentQuestion - 1]}`);
      console.log(`A${currentQuestion}: ${currentAnswer}`);
      setCurrentAnswer('');
      if (currentQuestion < 3) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCurrentQuestion(0);
      }
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);  // Toggle between maximized and small views
  };

  return (
    <AppContainer>
      <LeftContainer>
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
        {currentQuestion > 0 && currentQuestion <=3 && (
          <QuestionContainer>
            <QuestionText>{questions[currentQuestion - 1]}</QuestionText> 
            <AnswerInput
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value.slice(0, 150))}
            placeholder="Enter your answer (max 150 words)"
         />
        <SubmitButton onClick={handleAnswerSubmit}>➡️</SubmitButton>
        </QuestionContainer>
)}
        
        
        
        
        {selectedFile && (
          <div>
            <h2>File Content: {selectedFile.name}</h2>
            <FileContent>{selectedFile.content}</FileContent>
          </div>
        )}
        {/* {blogPost && ( */}
          <BlogPost>
            <h2>Generated Blog Post:</h2>
            <p>blogPost</p>
          </BlogPost>
        {/* )} */}
      </LeftContainer>

      {files.length > 0 && (
        <RightContainer isMaximized={isMaximized}>
          <h2>Repository Structure:</h2>
          <FileTree files={files} onFileClick={handleFileClick} />
        </RightContainer>
      )}

      <IconButton onClick={toggleMaximize}>
        {isMaximized ? '➖' : '➕'}  {/* Icon changes depending on the state */}
      </IconButton>
    </AppContainer>
  );
}

export default App;
