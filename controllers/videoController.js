const Progress = require("../models/Progress");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
const path = require("path");

ffmpeg.setFfprobePath(ffprobe.path);

exports.getLecturePage = async (req, res, overrides = {}) => {
  const userId = overrides.userId || req.query.userId;
  const videoId = overrides.videoId || req.query.videoId;
  const videoFilePath = path.join(__dirname, "..", "public", "videos", "sample.mp4");

  try {
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoFilePath, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    const videoDuration = Math.floor(metadata.format.duration); // duration of lecture
     console.log(videoDuration);
    const progress = await Progress.findOne({ userId, videoId });
    const intervals = progress?.intervals || [];
    const lastPosition = progress?.lastPosition || 0;

    res.render("lecture", {
  userId,
  videoId,
  lastPosition: progress?.lastPosition || 0,
  VIDEO_DURATION: videoDuration || 0,
  intervals: progress?.intervals || [],
});

  } catch (err) {
    console.error("Error in getLecturePage:", err);
    res.status(500).send("Failed to load video");
  }
};

exports.saveProgress = async (req, res) => {
  const { userId, videoId, intervals, lastPosition } = req.body;

  if (!userId || !videoId || !intervals) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    let progress = await Progress.findOne({ userId, videoId });

    // Validating and filtering intervals
    const validIntervals = intervals.filter(interval => 
      interval && 
      typeof interval === 'object' && 
      typeof interval.start === 'number' && 
      typeof interval.end === 'number' &&
      interval.start >= 0 &&
      interval.end > interval.start
    );

    if (!progress) {
      progress = new Progress({ 
        userId, 
        videoId, 
        intervals: validIntervals, 
        lastPosition 
      });
    } else {
      // Filtering existing intervals as well
      const validExistingIntervals = progress.intervals.filter(interval => 
        interval && 
        typeof interval === 'object' && 
        typeof interval.start === 'number' && 
        typeof interval.end === 'number' &&
        interval.start >= 0 &&
        interval.end > interval.start
      );

      const allIntervals = [...validExistingIntervals, ...validIntervals];
      
      if (allIntervals.length > 0) {
        allIntervals.sort((a, b) => a.start - b.start);

        const merged = [allIntervals[0]];
        for (let i = 1; i < allIntervals.length; i++) {
          const previous = merged[merged.length - 1];
          const current = allIntervals[i];

          if (current.start <= previous.end) {
            previous.end = Math.max(previous.end, current.end);
          } else {
            merged.push(current);
          }
        }

        progress.intervals = merged;
      } else {
        progress.intervals = [];
      }
      
      progress.lastPosition = lastPosition;
    }

    await progress.save();
    res.json({ message: "Progress saved", intervals: progress.intervals });
  } catch (err) {
    console.error("Error saving progress:", err);
    res.status(500).json({ error: "Server error" });
  }
};
