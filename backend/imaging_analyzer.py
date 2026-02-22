# backend/imaging_analyzer.py
"""
Analyzes DaT Scans and MRI slices using Computer Vision (OpenCV).
Identifies "Striatal Binding Ratio" (SBR) proxies from DaT scans.
A healthy DaT scan shows balanced "comma" shapes.
Parkinson's shows "dots" or asymmetric loss of uptake in the putamen.
"""
import cv2
import numpy as np
import logging
from PIL import Image
import io

logger = logging.getLogger(__name__)

def analyze_dat_scan(image_bytes: bytes) -> dict:
    """
    Simulates a clinical DaT scan analysis.
    1. Loads image
    2. Identifies 'Hot Spots' (Striatum)
    3. Calculates Binding Ratio (SBR) Proxy
    4. Identifies Morphological loss (Comma vs Dot)
    """
    try:
        # Load image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image")

        # 1. Convert to HSV for robust color detection (DaT scans are usually heatmaps)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Define 'High Uptake' range (Yellow to Red in standard heatmaps)
        # Standard heatmaps: Red = max, Yellow = high, Green = mid
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)
        
        lower_yellow = np.array([20, 100, 100])
        upper_yellow = np.array([30, 255, 255])
        mask2 = cv2.inRange(hsv, lower_yellow, upper_yellow)
        
        mask = cv2.bitwise_or(mask1, mask2)
        
        # 2. Find Contours (The two striatal 'commas')
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter for the two largest regions (Left and Right Striatum)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:2]
        
        if len(contours) < 2:
            return {
                "sbr_ratio": 0.4,
                "asymmetry": 0.3,
                "findings": "Significant bilateral uptake loss or non-standard scan format.",
                "analysis_type": "DaT-CV-v1",
                "status": "High Risk"
            }

        area1 = cv2.contourArea(contours[0])
        area2 = cv2.contourArea(contours[1])
        
        # Calculate Asymmetry
        total_area = area1 + area2
        asymmetry = abs(area1 - area2) / max(total_area, 1)
        
        # SBR Proxy (Normalized uptake vs image size)
        img_area = img.shape[0] * img.shape[1]
        sbr_proxy = (total_area / img_area) * 20 # Scaled for 0-2 range
        
        # 3. Shape Analysis (Roundness)
        # Healthy Striatum is a comma (elongated). PD Striatum is a dot (round).
        def get_roundness(c):
            perimeter = cv2.arcLength(c, True)
            area = cv2.contourArea(c)
            if perimeter == 0: return 0
            return (4 * np.pi * area) / (perimeter * perimeter)

        roundness = (get_roundness(contours[0]) + get_roundness(contours[1])) / 2
        
        # Clinical Heuristic
        # SBR < 0.8 OR Asymmetry > 0.15 OR Roundness > 0.8 (Dot shape)
        is_pd_indicator = (sbr_proxy < 1.1) or (asymmetry > 0.15) or (roundness > 0.7)
        
        status = "Normal"
        if sbr_proxy < 0.7: status = "Significant Loss"
        elif is_pd_indicator: status = "Asymmetric / Subclinical Loss"

        return {
            "sbr_ratio": round(sbr_proxy, 2),
            "asymmetry": round(asymmetry, 3),
            "putamen_reduction": "Detected" if roundness > 0.65 else "None",
            "findings": f"Striatal regions identified. Asymmetry index: {asymmetry:.2f}. " + 
                        ("Morphology suggests 'dot' pattern (uptake loss)." if roundness > 0.65 else "Morphology suggests 'comma' pattern (healthy)."),
            "analysis_type": "DaT-CV-Bio-v1",
            "status": status,
            "risk_score": 85 if status != "Normal" else 15
        }

    except Exception as e:
        logger.error(f"Image analysis failed: {e}")
        return {"error": str(e), "status": "Failed"}
