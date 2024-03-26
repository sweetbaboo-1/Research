# Use the official Node.js image as base
FROM node:14

# Set working directory in the container
WORKDIR /usr

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install multer
RUN npm install winston

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
