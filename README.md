# BuildMyResume - AI-Powered Resume Builder & ATS Optimizer

BuildMyResume is a premium, AI-driven application designed to help users create, audit, and optimize their resumes for Applicant Tracking Systems (ATS).

## 🚀 Key Features

- **AI Resume Audit**: Get professional feedback on your resume content.
- **ATS Scanner**: Compare your resume against job descriptions with a 100% match goal.
- **Side-by-Side Live Preview**: See AI improvements in real-time with a comparison modal before applying them.
- **Cloud Storage**: Securely store and sync your resumes using MongoDB Atlas.
- **Modern UI**: A sleek, dark-themed interface built with React and Tailwind CSS.

## 🛠 Project Structure

The project is divided into two main parts:

- **/project**: The frontend application (React + Vite + TypeScript).
- **/backend**: The server-side API (Node.js + Express + MongoDB).

## 🔧 Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the project directory:
   ```bash
   cd project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 🔐 Security Note
The project uses `.gitignore` to protect sensitive information. **Never upload your `.env` files to GitHub.**

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
