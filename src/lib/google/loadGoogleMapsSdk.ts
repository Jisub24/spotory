let googleMapsSdkPromise: Promise<void> | null = null;

export function loadGoogleMapsSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("loadGoogleMapsSdk는 브라우저에서만 호출할 수 있습니다.")
    );
  }

  if (typeof google !== "undefined" && google.maps) {
    return Promise.resolve();
  }

  if (googleMapsSdkPromise) {
    return googleMapsSdkPromise;
  }

  googleMapsSdkPromise = new Promise((resolve, reject) => {
    const callbackName = "__googleMapsSdkLoaded";
    (window as unknown as Record<string, () => void>)[callbackName] = () =>
      resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&loading=async&libraries=places,marker&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      googleMapsSdkPromise = null;
      reject(new Error("구글 지도 SDK를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return googleMapsSdkPromise;
}
