
# 🎥 Video Progress Tracker

A web application to track and resume video playback progress for users. Built using Node.js, Express, MongoDB (via Mongoose), and frontend JavaScript.

## 🚀 Features

- ✅ Resumes video from last watched timestamp
- ✅ Stores watched intervals and calculates % progress
- ✅ Accurately tracks progress only for sections the user has fully watched, ignoring portions that were simply seeked or skipped through
- ✅ Merges overlapping intervals
- ✅ Dynamic progress bar UI


Note: The sample.mp4 file located in public/videos/ is a trimmed version of the original lecture video due to size constraints. As a result, you may observe a significant increase in progress even after watching just a few seconds of the lecture. This behaviour is expected and does not indicate any issue with the tracking logic or application functionality. 

**REFER TO RECORDED DEMO VIDEO FOR DETAILED WALKTHROUGH OF PROJECT**

## 🛠️ Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Frontend: Vanilla JS + EJS templates + Tailwind CSS
- Video processing: `fluent-ffmpeg`
- Containerization: Docker
---

## 📦 Setup Instructions

### Clone the repository

```bash
git clone https://github.com/shelby-garrison/Lecture-Tracking.git
cd Lecture-Tracking
````

### Set up environment

Create a `.env` file in the root:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourdbname
          mongodb://host.docker.internal:27017/yourdbname (IF USING DOCKER)
```

###  Run MongoDB

Make sure MongoDB is running on your machine

**RUNNING WITHOUT DOCKER**:
  
### Install dependencies

```bash
npm install
```


### Run the server

```bash
node app.js
```
The service would be live on port 3000


**RUNNING WITH DOCKER**:

## Building Docker Image

```bash
docker build -t image-name .
```

## Running Docker Image

```bash
docker run -p 3000:3000 --env-file .env image-name
```

The service would be live on port 3000






