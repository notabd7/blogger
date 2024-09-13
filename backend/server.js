const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GITHUB_API_URL = 'https://api.github.com';

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

async function fetchFileContent(url) {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    });
    return response.data;
  }

async function fetchRepoContents(owner, repo, path = '') {
    const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  
    let files = [];
  
    for (const item of response.data) {
      if (item.type === 'file') {
        const content = await fetchFileContent(item.download_url);
        files.push({
          name: item.name,
          path: item.path,
          type: 'file',
          content: content
        });
      } else if (item.type === 'dir') {
        const subFiles = await fetchRepoContents(owner, repo, item.path);
        files.push({
          name: item.name,
          path: item.path,
          type: 'dir',
          contents: subFiles
        });
      }
    }
  
    return files;
  }


  async function generateBlogPost(files) {
    let fileContents = files.map(file => {
      if (file.type === 'file') {
        return `File: ${file.path}\n\nContent:\n${file.content}\n\n`;
      } else {
        return `Directory: ${file.path}\n`;
      }
    }).join('\n');
  
    const prompt = `Based on the following GitHub repository structure and file contents, write a blog post about the project, focus on 
    being reflective about learning and the project. :\n\n${fileContents}\n\nBlog post:`;
  
    try {
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
        },
      });
  
      return response.generated_text;
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw new Error('Failed to generate blog post');
    }
  }

  app.get('/test-huggingface', async (req, res) => {
    try {
      const response = await hf.textGeneration({
        model: 'gpt2',
        inputs: 'Hello, my name is',
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
        },
      });
  
      res.json({ generatedText: response.generated_text });
    } catch (error) {
      console.error('Error testing Hugging Face:', error);
      res.status(500).json({ error: 'Failed to connect to Hugging Face API' });
    }
  });
  

  app.post('/analyze-repo', async (req, res) => {
    const { repoUrl } = req.body;
    
    try {
      const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      const files = await fetchRepoContents(owner, repo);
      const blogPost = await generateBlogPost(files);
      res.json({ files });
    } catch (error) {
      console.error('Error analyzing repo:', error.message);
      res.status(500).json({ error: 'Failed to analyze repo' });
    }
  });
  
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });