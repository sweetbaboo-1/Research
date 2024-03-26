function uploadFiles() {
  const file1 = document.getElementById("xmlFile1").files[0];
  const file2 = document.getElementById("xmlFile2").files[0];

  if (!file1 || !file2) {
    alert("Please select both XML files.");
    return;
  }

  const formData = new FormData();
  formData.append("xmlFile1", file1);
  formData.append("xmlFile2", file2);

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((result) => {
      document.getElementById("result").innerText = result;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("result").innerText =
        "An error occurred while uploading files." + error;
    });
}

function viewFiles() {
  fetch("http://localhost:3000/files")
    .then((response) => response.text())
    .then((html) => {
      const filesList = document.getElementById("filesList");
      filesList.innerHTML = html;

      // Add event listeners to dynamically added links
      const fileLinks = filesList.getElementsByTagName("a");
      for (let i = 0; i < fileLinks.length; i++) {
        fileLinks[i].addEventListener("click", function (event) {
          // Prevent default behavior (following the link)
          event.preventDefault();
          // Extract the file URL
          const fileURL = this.getAttribute("href");
          // Create a temporary link element
          const link = document.createElement("a");
          link.href = fileURL;
          // Set target attribute to "_blank" to open in a new tab
          link.setAttribute("target", "_blank");
          // Trigger a click event on the link
          link.click();
        });
      }
    })
    .catch((error) => console.error("Error fetching files:", error));
}

