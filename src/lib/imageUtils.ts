/**
 * 브라우저 캔버스를 이용해 고해상도 이미지를 웹 최적화 크기(최대 800px, 0.75 퀄리티)로 리사이징 및 압축합니다.
 * 스마트폰/PC의 대용량 이미지(10MB~20MB)도 50KB~150KB 내외로 줄여 Firestore 문서 크기 한도(1MB)를 초과하지 않게 합니다.
 */
export async function compressImageFile(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("캔버스 컨텍스트를 생성할 수 없습니다."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 포맷으로 압축
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
