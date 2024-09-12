export async function createBlobFromImageUrl(imageUrl) {
    try {
      // Fetch the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok)
        throw new customError("Error fetching Gmail photo URL", response);
  
      // Convert the response to a Blob
      const blob = await response.blob();
  
      // You now have a Blob object you can use (e.g., upload, download, etc.)
      return { status: "success", blob: blob };
    } catch (error) {
      return { error, status: "error" };
    }
  }