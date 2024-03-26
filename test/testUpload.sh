#!/bin/bash

# Define the URL and file path
url="http://localhost:3000/upload"
file="test.txt"

# Send the POST request with file upload
curl -X POST -F "file=@$file" $url
