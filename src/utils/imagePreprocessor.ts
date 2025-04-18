export async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas size
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Center the image
      const offsetX = (size - img.width) / 2;
      const offsetY = (size - img.height) / 2;

      // Fill background with white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);

      // Draw original image centered
      ctx.drawImage(img, offsetX, offsetY);

      // Get image data
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      // Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        // Weighted grayscale conversion
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Apply adaptive thresholding
      const blockSize = 15;
      const threshold = 10;
      
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let sum = 0;
          let count = 0;
          
          // Calculate local mean
          for (let dy = -blockSize; dy <= blockSize; dy++) {
            for (let dx = -blockSize; dx <= blockSize; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                sum += data[(ny * size + nx) * 4];
                count++;
              }
            }
          }
          
          const mean = sum / count;
          const idx = (y * size + x) * 4;
          const value = data[idx] < mean - threshold ? 0 : 255;
          
          data[idx] = value;
          data[idx + 1] = value;
          data[idx + 2] = value;
        }
      }

      // Apply sharpening
      const sharpenKernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];
      
      const tempData = new Uint8ClampedArray(data);
      
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * size + (x + kx)) * 4 + c;
                sum += tempData[idx] * sharpenKernel[(ky + 1) * 3 + (kx + 1)];
              }
            }
            data[(y * size + x) * 4 + c] = Math.max(0, Math.min(255, sum));
          }
        }
      }

      // Put processed image back
      ctx.putImageData(imageData, 0, 0);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}