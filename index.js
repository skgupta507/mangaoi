import API from "./src/main.js";
// Listen to requests
API.listen(8080, () => console.log("Listening..."));