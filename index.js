const axios = require("axios");
const ytdl = require("ytdl-core");

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
    this.url = url;
    this.vCodec = "h264";
    this.vQuality = "720";
    this.aFormat = "mp3";
    this.filenamePattern = "classic";
    this.isAudioOnly = false;
    this.isTTFullAudio = false;
    this.isAudioMuted = false;
    this.dubLang = false;
    this.disableMetadata = false;
    this.twitterGif = false;
    this.tiktokH265 = false;
    this.acceptLanguage = null;
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
    };

    if (this.acceptLanguage !== null) {
      headers["Accept-Language"] = this.acceptLanguage;
    }

    const data = {
      url: this.url,
      vQuality: this.vQuality,
      filenamePattern: this.filenamePattern,
      isAudioOnly: this.isAudioOnly,
      isTTFullAudio: this.isTTFullAudio,
      isAudioMuted: this.isAudioMuted,
      dubLang: this.dubLang,
      disableMetadata: this.disableMetadata,
      twitterGif: this.twitterGif,
      tiktokH265: this.tiktokH265,
      vCodec: this.vCodec,
      aFormat: this.aFormat,
    };

    try {
      const response = await axios.post(
        "https://api.cobalt.tools/api/json",
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
