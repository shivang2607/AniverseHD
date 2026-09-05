import retryAsync from "./retryAsync";

class customError extends Error {
  constructor(message, response = null) {
    super(message); // Call the parent class constructor to set the message
    if (response != null) this.response = response; // Add the custom property (response)
  }
}
export default async function createBlobFromImageUrl(imageUrl) {
    try {
      // Fetch the image from the URL (with a retry for transient failures)
      const response = await retryAsync(() => fetch(imageUrl), 2);
      if (!response.ok)
        throw new customError("Error fetching photo URL", response);
  
      // Convert the response to a Blob
  
      // You now have a Blob object you can use (e.g. upload, download, etc.)
      const blob = await response.blob();
      return { status: "success", response: blob };
    } catch (error) {
      return { response:error, status: "error" };
    }
  }
