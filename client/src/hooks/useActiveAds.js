import { useEffect, useState } from "react";
import { advertisementService } from "../services/advertisementService";

export function useActiveAds(position, brand) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    advertisementService
      .findActive(position, brand)
      .then((data) => {
        if (!cancelled) setAds(data);
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [position, brand]);

  return { ads, loading, hasAds: ads.length > 0 };
}
