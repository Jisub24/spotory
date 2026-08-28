// 사진을 원본 그대로 업로드하면 여러 장 첨부 시 전송 용량이 너무 커져서,
// 업로드 전에 브라우저에서 미리 리사이즈 + 재인코딩해 용량을 줄인다.
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.8
): Promise<File> {
  try {
    // EXIF 방향 정보를 반영해서 불러오지 않으면, 세로로 찍은 사진이
    // 캔버스에 그려질 때 옆으로 누워버릴 수 있다.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
      type: "image/jpeg",
    });
  } catch {
    // 압축이 실패하면(지원 안 하는 형식 등) 원본을 그대로 사용한다.
    return file;
  }
}
