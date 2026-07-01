/**
 * useAnalytics Hook
 *
 * React hook for tracking analytics events
 */

import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import analyticsService from "../services/analytics/analyticsService.js";

export function useAnalytics() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location.pathname]);

  // Track feature usage
  const trackFeature = useCallback((feature, action, metadata = {}) => {
    analyticsService.trackFeature(feature, action, metadata);
  }, []);

  // Track custom event
  const trackEvent = useCallback((eventType, eventCategory, metadata = {}) => {
    analyticsService.track(eventType, eventCategory, metadata);
  }, []);

  // Track action
  const trackAction = useCallback(
    (action, category = "engagement", metadata = {}) => {
      analyticsService.trackAction(action, category, metadata);
    },
    [],
  );

  // Track error
  const trackError = useCallback((error, context = {}) => {
    analyticsService.trackError(error, context);
  }, []);

  return {
    trackFeature,
    trackEvent,
    trackAction,
    trackError,
  };
}

// Hook for tracking component mount/unmount
export function usePageTracking(pageName, metadata = {}) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const startTime = Date.now();

    trackEvent("page_view", "navigation", {
      page: pageName,
      ...metadata,
    });

    return () => {
      const duration = Date.now() - startTime;
      trackEvent("page_exit", "navigation", {
        page: pageName,
        duration,
        ...metadata,
      });
    };
  }, [pageName, trackEvent]);
}

// Hook for tracking feature usage
export function useFeatureTracking(featureName) {
  const { trackFeature } = useAnalytics();

  useEffect(() => {
    trackFeature(featureName, "viewed");
  }, [featureName, trackFeature]);

  const trackUsage = useCallback(
    (action, metadata = {}) => {
      trackFeature(featureName, action, metadata);
    },
    [featureName, trackFeature],
  );

  return { trackUsage };
}
