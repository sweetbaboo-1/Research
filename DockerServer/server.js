const http = require("http");
const fs = require("fs");
const path = require("path");
const { createLogger, transports, format } = require("winston");
const cors = require("cors");
const corsMiddleware = cors();

const hostname = "0.0.0.0";
const port = 3000;

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.File({ filename: "server.log" })],
});

const getUploadedFiles = () => {
  const uploadFolder = path.join(__dirname, "uploads");
  try {
    return fs.readdirSync(uploadFolder);
  } catch (err) {
    console.error("Error reading upload directory:", err);
    return [];
  }
};

const server = http.createServer((req, res) => {
  // Apply CORS middleware to all requests
  corsMiddleware(req, res, () => {
    if (req.url === "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("Hello, World!\n");
    } else if (req.url === "/upload" && req.method === "POST") {
      let filesUploaded = 0;
      let filenames = [];

      const saveFile = (filename, body) => {
        const uploadFolder = path.join(__dirname, "uploads");
        const filePath = path.join(uploadFolder, filename);

        fs.mkdirSync(uploadFolder, { recursive: true });

        fs.writeFile(filePath, body, (err) => {
          if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end("Error saving file");
            logger.error(`Failed to save file '${filename}'`);
          } else {
            filesUploaded++;
            filenames.push(filename);
            if (filesUploaded === 2) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/plain");
              res.end(`Files uploaded successfully: ${filenames.join(", ")}`);
              logger.info(
                `Files uploaded successfully: ${filenames.join(", ")}`
              );
            }
          }
        });
      };

      req.on("data", (chunk) => {
        const boundary = req.headers["content-type"]
          .split("; ")[1]
          .split("=")[1];
        const parts = chunk.toString().split(`--${boundary}`);
        parts.forEach((part) => {
          if (part.includes("filename")) {
            const match = /filename="(.*?)"/.exec(part);
            if (match) {
              const filename = match[1];
              const content = part.split("\r\n\r\n")[1];
              saveFile(filename, content);
            }
          }
        });
      });
    } else if (req.url === "/files" && req.method === "GET") {
      const files = getUploadedFiles();

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");

      // Generate HTML markup for file links
      let fileListHTML = "<ul>";
      if (files.length > 0) {
        files.forEach((file) => {
          const fileURL = `http://localhost:3000/uploads/${file}`;
          console.log(fileURL);

          fileListHTML += `<li><a href="${fileURL}" download>${file}</a></li>`;
        });
      } else {
        fileListHTML += "<li>No files available</li>";
      }
      fileListHTML += "</ul>";

      res.end(fileListHTML);
    } else if (req.url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, req.url);
      fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
          // File does not exist or is not readable
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("404 - File Not Found\n");
        } else {
          // File exists and is readable, stream it to the client
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("404 - Not Found\n");
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
