require('dotenv').config();
const axios = require("axios");
const ytdl = require("ytdl-core");
const moment = require("moment");
const yup = require("yup");

/**
 * Class CobaltAPI (Node.js YTDL Library)
 *
 * This class handles the configuration and sending of requests to a video downloading API.
 * It allows you to set various parameters for downloading videos or audio, such as video quality,
 * codec, audio format, and filename pattern. The class provides methods to enable or disable specific
 * features like audio-only downloads, full audio from TikTok videos, and metadata options.
 *
 * This library relies on Cobalt’s free API.
 *
 * Sources:
 * - Cobalt Code: https://github.com/imputnet/cobalt
 * - Cobalt Site: https://cobalt.tools
 * - Cobalt API Docs: https://github.com/imputnet/cobalt/blob/current/docs/api.md
 *
 * @version 1.0.0
 * @license MIT License
 * @link https://github.com/code3-dev/ytdl-node
 * @api https://github.com/imputnet/cobalt
 */

class CobaltAPI {
  /**
   * Constructor initializes the class with a URL.
   *
   * @param {string} url The URL to be used in requests.
   */
  constructor(url) {
    if (!process.env.API_URL) {
      console.log('API_URL', process.env.API_URL);
      throw new Error("API_URL env variable is missing, Media downloader api can't start.");
    }
	if (!process.env.API_KEY) {
      console.log('API_KEY', process.env.API_KEY);
      throw new Error("API_KEY env variable is missing, Media downloader api can't start.");
    }
    this.url = url;
    this.vCodec = "h264";
    this.vQuality = "720";
    this.aFormat = "mp3";
    this.filenamePattern = "classic";
    this.isAudioOnly = false;
    this.isVideoOnly = false;
    this.isTTFullAudio = false;
    this.isAudioMuted = false;
    this.dubLang = false;
    this.disableMetadata = false;
    this.twitterGif = false;
    this.tiktokH265 = false;
    this.acceptLanguage = null;
	this.startTime = null;
	this.endTime = null;
	this.watermark = null;
  }

  /**
   * Sets the video quality for downloads.
   *
   * @param {string} quality The desired video quality (e.g., 144, 720, max).
   * @throws {Error} If the provided quality is not valid.
   */
  setQuality(quality) {
    const allowedQualities = [
      "max",
      "2160",
      "1440",
      "1080",
      "720",
      "480",
      "360",
      "240",
      "144",
    ];
    if (!allowedQualities.includes(quality)) {
      throw new Error("Invalid video quality");
    }
    this.vQuality = quality;
  }

  /**
   * Sets the filename pattern for downloaded files.
   *
   * Available patterns:
   * - classic: Standard naming for files.
   * - basic: Simplistic naming for files.
   * - pretty: More descriptive naming for files.
   * - nerdy: Detailed naming for files including additional metadata.
   *
   * @param {string} pattern The desired filename pattern.
   * @throws {Error} If the provided pattern is not valid.
   */
  setFilenamePattern(pattern) {
    const allowedPatterns = ["classic", "pretty", "basic", "nerdy"];
    if (!allowedPatterns.includes(pattern)) {
      throw new Error("Invalid filename pattern");
    }
    this.filenamePattern = pattern;
  }

  /**
   * Sets the video codec for downloads.
   *
   * @param {string} codec The desired video codec (e.g., h264, av1, vp9).
   * @throws {Error} If the provided codec is not valid.
   */
  setVCodec(codec) {
    const allowedCodecs = ["h264", "av1", "vp9"];
    if (!allowedCodecs.includes(codec)) {
      throw new Error("Invalid video codec");
    }
    this.vCodec = codec;
  }

  /**
   * Sets the audio format for downloads.
   *
   * @param {string} format The desired audio format (e.g., mp3, ogg, wav).
   * @throws {Error} If the provided format is not valid.
   */
  setAFormat(format) {
    const allowedFormats = ["best", "mp3", "ogg", "wav", "opus"];
    if (!allowedFormats.includes(format)) {
      throw new Error("Invalid audio format");
    }
    this.aFormat = format;
  }

  /**
   * Sets the custom Accept-Language header value for requests.
   *
   * @param {string} language The custom Accept-Language header value.
   */
  setAcceptLanguage(language) {
    this.acceptLanguage = language;
  }
  
  /**
   * Sets the start time for downloads.
   *
   * @param {string} format The desired start time in hh:mm:ss format or in ms.
   * @throws {Error} If the provided format is not valid.
   */
  setStartTime(time) {
    const allowedFormats = ["HH:mm:ss", "x"];
    if (!moment(time, allowedFormats, true).isValid()) {
      throw new Error("Invalid start time format");
    }
    this.startTime = time;
  }
  
  /**
   * Sets the end time for downloads.
   *
   * @param {string} format The desired end time in hh:mm:ss format or in ms.
   * @throws {Error} If the provided format is not valid.
   */
  setEndTime(time) {
    const allowedFormats = ["HH:mm:ss", "x"];
    if (!moment(time, allowedFormats, true).isValid()) {
      throw new Error("Invalid end time format");
    }
    this.endTime = time;
  }
  
  /**
   * Sets the watermark/logo for downloads.
   *
   * @param {array} format The desired watermark ["URL","position","scale","opacity"].
   * @throws {Error} If the provided format is not valid.
   */
  async setWatermark(watermarkArray) {
	
	let schema = yup.object({
		url: yup.string().url().required("Enter watermark URL"), //watermark URL required
		position: yup.string("Enter watermark position in x:y format or among the predefined list").default('topLeft').matches(/(topLeft|topRight|bottomLeft|bottomRight|center|[\d:\d])/),
		scale: yup.number().positive(),
		opacity: yup.number().min(0).max(1)
	});
	
	try {
		const watermarkObject = Object.assign({}, JSON.parse(watermarkArray));
		const isValid = schema.isValidSync(watermarkObject);
		
		if (!isValid) {
			console.log('default schema', schema.default());
			console.log('watermarkObject', watermarkObject);
			
			// parse and assert validity
			let watermarkValidation = await schema.validate(watermarkObject);				
		}
	} catch (error) {
		throw new Error("Failed to validate watermark array values:" + error.message);
	}
    this.watermark = watermarkArray;
  }

  /**
   * Enables downloading only video.
   */
  enableVideoOnly() {
    this.isVideoOnly = true;
  }

  /**
   * Enables downloading only audio.
   */
  enableAudioOnly() {
    this.isAudioOnly = true;
  }

  /**
   * Enables downloading the original sound from a TikTok video.
   */
  enableTTFullAudio() {
    this.isTTFullAudio = true;
  }

  /**
   * Enables muting the audio track in video downloads.
   */
  enableAudioMuted() {
    this.isAudioMuted = true;
  }

  /**
   * Enables using the Accept-Language header for YouTube video audio tracks.
   */
  enableDubLang() {
    this.dubLang = true;
  }

  /**
   * Enables disabling file metadata.
   */
  enableDisableMetadata() {
    this.disableMetadata = true;
  }

  /**
   * Enables converting Twitter gifs to .gif format.
   */
  enableTwitterGif() {
    this.twitterGif = true;
  }

  /**
   * Enables preferring 1080p h265 videos for TikTok.
   */
  enableTiktokH265() {
    this.tiktokH265 = true;
  }

  /**
   * Sends the configured request to the API and returns the response.
   *
   * @returns {Promise<Object>} A promise that resolves to an object containing the status and data of the response.
   */
  async sendRequest() {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
	  "Authorization": "Api-Key " + process.env.API_KEY,
    };

    const data = {
      url: this.url,
      videoQuality: this.vQuality,
      filenameStyle: this.filenamePattern,
      // isAudioOnly: this.isAudioOnly,
      // isTTFullAudio: this.isTTFullAudio,
      // isAudioMuted: this.isAudioMuted,
      disableMetadata: this.disableMetadata,
      twitterGif: this.twitterGif,
      tiktokH265: this.tiktokH265,
      youtubeVideoCodec: this.vCodec,
      audioFormat: this.aFormat,
    };

    if (this.acceptLanguage !== null) {
      data["youtubeDubLang"] = this.acceptLanguage;
    }
	
	if (this.startTime !== null) {
      data["startTime"] = this.startTime;
    }
	
	if (this.endTime !== null) {
      data["endTime"] = this.endTime;
    }

    if (this.isAudioOnly !== false) {
      data["downloadMode"] = 'audio';
    }
    else if (this.isVideoOnly !== false) {
      data["downloadMode"] = 'video';
    }

    try {
      const response = await axios.post(
        process.env.API_URL,
        data,
        { headers }
      );
      const statusCode = response.status;
      const responseData = response.data;

      if (statusCode === 200 && responseData.status !== "error") {
        return { status: true, data: responseData };
      } else {
        return {
          status: false,
          text: responseData.text || "An error occurred",
        };
      }
    } catch (error) {
      return {
        status: false,
        text: error.response ? error.response.data : error.message,
      };
    }
  }

  /**
   * Fetches the available video qualities for a YouTube URL.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of available video qualities.
   */
  async getAvailableQualities() {
    if (!ytdl.validateURL(this.url)) {
      throw new Error("Invalid YouTube URL");
    }

    try {
      const info = await ytdl.getInfo(this.url);
      const formats = ytdl.filterFormats(info.formats, "video");
      const qualities = formats
        .map((format) =>
          format.qualityLabel.replace("p60", "").replace("p", "")
        )
        .filter((v, i, a) => a.indexOf(v) === i);
      return qualities;
    } catch (error) {
      throw new Error("Failed to fetch video qualities");
    }
  }
}

module.exports = CobaltAPI;
