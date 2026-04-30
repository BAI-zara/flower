import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult
} from "@mediapipe/tasks-vision";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useGrowth, type GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "../../components/scene/SceneContext";

export type { GrowthState };

type AppState = "idle" | "loading" | "ready" | "error";

const CENTER_THRESHOLD_X = 0.2;
const CENTER_THRESHOLD_Y = 0.18;
const GAZE_DEBOUNCE_MS = 300;

const LEFT_EYE = {
  left: 33,
  right: 133,
  top: 159,
  bottom: 145,
  iris: 468
};

const RIGHT_EYE = {
  left: 362,
  right: 263,
  top: 386,
  bottom: 374,
  iris: 473
};

function eyeRatio(
  landmarks: FaceLandmarkerResult["faceLandmarks"][number],
  eye: typeof LEFT_EYE
) {
  const outer = landmarks[eye.left];
  const inner = landmarks[eye.right];
  const top = landmarks[eye.top];
  const bottom = landmarks[eye.bottom];
  const iris = landmarks[eye.iris];

  if (!outer || !inner || !top || !bottom || !iris) {
    return null;
  }

  const minX = Math.min(outer.x, inner.x);
  const maxX = Math.max(outer.x, inner.x);
  const minY = Math.min(top.y, bottom.y);
  const maxY = Math.max(top.y, bottom.y);
  const width = Math.max(maxX - minX, 0.001);
  const height = Math.max(maxY - minY, 0.001);

  return {
    x: (iris.x - minX) / width,
    y: (iris.y - minY) / height
  };
}

function estimateLookingAtCenter(result: FaceLandmarkerResult) {
  const landmarks = result.faceLandmarks[0];

  if (!landmarks) {
    return false;
  }

  const left = eyeRatio(landmarks, LEFT_EYE);
  const right = eyeRatio(landmarks, RIGHT_EYE);

  if (!left || !right) {
    return false;
  }

  const gazeX = (left.x + right.x) / 2;
  const gazeY = (left.y + right.y) / 2;

  return (
    Math.abs(gazeX - 0.5) < CENTER_THRESHOLD_X &&
    Math.abs(gazeY - 0.5) < CENTER_THRESHOLD_Y
  );
}

function messageForStage(stage: GrowthState) {
  if (stage === "mature") {
    return "它正在盛放…";
  }

  if (stage === "giant") {
    return "它为你长成了一片奇迹 🌸";
  }

  if (stage === "flower") {
    return "它为你开了 🌸";
  }

  return "继续看着…";
}

export function useGaze(videoRef: RefObject<HTMLVideoElement>, sceneMode: SceneMode = "day") {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const rawFocusedRef = useRef(false);
  const rawChangedAtRef = useRef(0);
  const stableFocusedRef = useRef(false);
  const lastUiUpdateRef = useRef(0);

  const { growthState, focusedSeconds, reset, update } = useGrowth(sceneMode === "rain" ? 1.1 : 1);
  const [appState, setAppState] = useState<AppState>("idle");
  const [isLooking, setIsLooking] = useState(false);
  const [message, setMessage] = useState("看着它，它会长大 🌱");

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const resetFocus = useCallback((now: number) => {
    rawFocusedRef.current = false;
    rawChangedAtRef.current = now;
    stableFocusedRef.current = false;
  }, []);

  const updateStableFocus = useCallback((rawFocused: boolean, now: number) => {
    if (rawFocused !== rawFocusedRef.current) {
      rawFocusedRef.current = rawFocused;
      rawChangedAtRef.current = now;
    }

    if (
      stableFocusedRef.current !== rawFocusedRef.current &&
      now - rawChangedAtRef.current >= GAZE_DEBOUNCE_MS
    ) {
      stableFocusedRef.current = rawFocusedRef.current;
    }

    return stableFocusedRef.current;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const now = performance.now();

    if (!video || !landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }

    const result = landmarker.detectForVideo(video, now);
    const focused = updateStableFocus(estimateLookingAtCenter(result), now);
    const shouldUpdateUi = now - lastUiUpdateRef.current > 80;
    const growth = update(focused, now, shouldUpdateUi);

    if (shouldUpdateUi) {
      setIsLooking(focused);
      setMessage(focused ? messageForStage(growth.state) : "它在等你回来");
      lastUiUpdateRef.current = now;
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [update, updateStableFocus, videoRef]);

  const start = async () => {
    stopCamera();
    setAppState("loading");
    reset("idle");
    setMessage("正在唤醒摄像头");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("当前浏览器不支持摄像头访问。");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("视频元素还没有准备好。");
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMessage("正在加载眼睛检测");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );

      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: "VIDEO",
        numFaces: 1
      });

      resetFocus(performance.now());
      reset("idle");
      setAppState("ready");
      setIsLooking(false);
      setMessage("看着它，它会长大 🌱");
      frameRef.current = requestAnimationFrame(tick);
    } catch (error) {
      stopCamera();
      setAppState("error");
      reset("wilt");
      setIsLooking(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "摄像头不可用或权限被拒绝，请允许浏览器访问摄像头后再试。"
      );
    }
  };

  return {
    appState,
    growthState,
    focusedSeconds,
    isLooking,
    message,
    start
  };
}
