document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('videoPlayer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  let currentInterval = null;
  let isTracking = false;
  let isSeeking = false;
  let lastPlayTime = 0;
  let lastSeekTime = 0;
  let isContinuousSeek = false;
  const SEEK_DEBOUNCE = 1000; // 1 second threshold for continuous seeking
  
  // Setting initial video position
  video.currentTime = LAST_POSITION;
  lastPlayTime = LAST_POSITION;
  
  // Function to merge overlapping intervals
  function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    
    intervals.sort((a, b) => a.start - b.start);
    const merged = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      const previous = merged[merged.length - 1];
      
      if (current.start <= previous.end) {
        previous.end = Math.max(previous.end, current.end);
      } else {
        merged.push(current);
      }
    }
    
    return merged;
  }
  
  //total watched duration from intervals
  function calculateWatchedDuration(intervals) {
    return intervals.reduce((total, interval) => {
      return total + (interval.end - interval.start);
    }, 0);
  }
  
  // checking if current time is within any existing interval
  function isTimeInExistingInterval(time) {
    return watchedIntervals.some(interval => 
      time >= interval.start && time <= interval.end
    );
  }
  
  
  function updateProgress() {
    const mergedIntervals = mergeIntervals(watchedIntervals);
    const totalWatched = calculateWatchedDuration(mergedIntervals);
    const progressPercentage = (totalWatched / VIDEO_DURATION) * 100;
    
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${Math.round(progressPercentage)}%`;
  }
  
  
  async function saveProgress() {
    try {
      const response = await fetch('/video/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          videoId: VIDEO_ID,
          intervals: watchedIntervals,
          lastPosition: video.currentTime
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      const data = await response.json();
      watchedIntervals.length = 0;
      watchedIntervals.push(...data.intervals);
      updateProgress();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
  
  //tracking a new interval
  function startTracking() {
    if (!isTracking && !isSeeking && !isContinuousSeek) {
      // starting tracking only if we're not in a watched section
      if (!isTimeInExistingInterval(video.currentTime)) {
        currentInterval = {
          start: video.currentTime,
          end: video.currentTime
        };
        isTracking = true;
        lastPlayTime = video.currentTime;
      }
    }
  }
  
  
  function endTracking(saveInterval = true) {
    if (isTracking && currentInterval) {
      currentInterval.end = video.currentTime;
      
      //saving if the interval is meaningful and not during continuous seek
      if (saveInterval && !isContinuousSeek && currentInterval.end - currentInterval.start >= 1) {
        watchedIntervals.push(currentInterval);
        saveProgress();
      }
      
      isTracking = false;
      currentInterval = null;
    }
  }
  
  // Event Listeners for real-time tracking
  video.addEventListener('play', startTracking);
  video.addEventListener('pause', () => endTracking(true));
  video.addEventListener('ended', () => endTracking(true));
  
  // Tracking timeupdate for continuous progress
  video.addEventListener('timeupdate', () => {
    if (isTracking && currentInterval && !isSeeking && !isContinuousSeek) {
     
      if (video.currentTime > lastPlayTime) {
      
        if (isTimeInExistingInterval(video.currentTime)) {
          endTracking(true);
        } else {
          currentInterval.end = video.currentTime;
          lastPlayTime = video.currentTime;
        }
      }
    }
  });
  
  // If user is seeking
  video.addEventListener('seeking', () => {
    const now = Date.now();
    isSeeking = true;
    
    // Detecting continuous seeking
    if (now - lastSeekTime < SEEK_DEBOUNCE) {
      isContinuousSeek = true;
    } else {
      isContinuousSeek = false;
    }
    lastSeekTime = now;
    
    // Ending current tracking without saving if user is continuously seeking
    endTracking(!isContinuousSeek);
  });
  
  video.addEventListener('seeked', () => {
    isSeeking = false;
    lastPlayTime = video.currentTime;
    
    // Resetting continuous seek flag after debounce period
    setTimeout(() => {
      isContinuousSeek = false;
    }, SEEK_DEBOUNCE);
    
    // Start new tracking if not in watched content
    if (!isTimeInExistingInterval(video.currentTime)) {
      startTracking();
    }
  });


  updateProgress();
  
  // Auto-save progress every 30 seconds
  setInterval(saveProgress, 30000);
});