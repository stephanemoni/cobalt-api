const CobaltAPI = require("cobalt-api");

const cobalt = new CobaltAPI("https://www.youtube.com/watch?v=OAr6AIvH9VY");

cobalt
  .sendRequest()
  .then((response) => {
    if (response.status) {
      console.log("Download successful", response.data);
    } else {
      console.log("Download failed", response.text);
    }
  })
  .catch((error) => console.error("Error:", error));
