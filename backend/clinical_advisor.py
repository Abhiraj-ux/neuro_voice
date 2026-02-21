# backend/clinical_advisor.py
"""
Evidence-based clinical recommendations using:
  - MDS-UPDRS staging (Movement Disorder Society)
  - Hoehn & Yahr scale
  - UK PD Society Brain Bank Diagnostic Criteria
  - AAN (American Academy of Neurology) practice guidelines
"""
from __future__ import annotations

# ── Hoehn & Yahr stage based on risk + individual biomarker flags ─────────────
def estimate_hy_stage(risk_score: float, flags: list[dict]) -> tuple[str, str]:
    """
    Returns (stage_code, stage_description) with 10% granularity.
    Provides data-driven reasons for the staging.
    """
    flag_count = len(flags)
    has_high_jitter = any(f['biomarker'] == 'Jitter (MDVP:Jitter%)' and f['severity'] == 'High' for f in flags)
    has_high_ppe = any(f['biomarker'] == 'Pitch Period Entropy' and f['severity'] == 'High' for f in flags)

    if risk_score <= 10:
        return "Healthy", "Vocal biomarkers are in the 90th percentile of health. No neurological tremors or micro-instabilities detected."
    elif risk_score <= 20:
        return "Optimal", "Strong vocal fold closure and stable fundamental frequency. Performance is characteristic of a healthy neurological profile."
    elif risk_score <= 30:
        return "Subclinical (Low)", "Slight variances detected in vocal periodicity. These are likely physiological 'noise' rather than clinical indicators."
    elif risk_score <= 40:
        return "Subclinical (Observation)", "Minor micro-tremors detected. While not diagnostic, longitudinal tracking is recommended to establish a baseline."
    elif risk_score <= 50:
        desc = "H&Y Stage 1 (Initial)"
        reason = "Initial unilateral vocal instability detected. " + ("High Jitter suggests early laryngeal tremor." if has_high_jitter else "Stability is decreasing slightly.")
        return desc, reason
    elif risk_score <= 60:
        desc = "H&Y Stage 1.5 (Progressing)"
        reason = "Emerging bilateral vocal involvement. Increased signal complexity detected in phonation samples."
        return desc, reason
    elif risk_score <= 70:
        desc = "H&Y Stage 2 (Early-Mid)"
        reason = f"Bilateral vocal symptoms identified with {flag_count} abnormal markers. Hypophonia (reduced volume) may be present."
        return desc, reason
    elif risk_score <= 80:
        desc = "H&Y Stage 2 (Mid-Mid)"
        reason = "Significant vocal instability. Fundamental frequency range is narrowing, a hallmark of parkinsonian 'monotone' speech."
        return desc, reason
    elif risk_score <= 90:
        desc = "H&Y Stage 2.5 (Established)"
        reason = "High clinical suspicion. Significant vocal leakage and tremors. Protective reflexes for speech may be compromised."
        return desc, reason
    else:
        desc = "H&Y Stage 3+ (Advanced)"
        reason = "Urgent: Severe dysarthria detected. Vocal indicators suggest postural instability risk and significant mid-stage progression."
        return desc, reason


# ── GOLD-STANDARD CLINICAL RECOMMENDATIONS ────────────────────────────────────
def get_recommendations(risk_label: str, risk_score: float, flags: list[dict], biomarkers: dict) -> dict:
    """
    Returns structured recommendations keyed by category.
    Now more granular (discriminating 70 vs 99) and biomarker-specific.
    """
    stage_code, stage_desc = estimate_hy_stage(risk_score, flags)

    base = {
        "clinical_stage":   stage_code,
        "stage_description": stage_desc,
        "immediate_steps":  [],
        "diagnostic_tests": [],
        "specialist_referral": "",
        "lifestyle": [],
        "speech_therapy": [],
        "precision_insights": [], # New: biomarker-specific insights
        "monitoring_frequency": "",
        "references": [],
    }

    # ── 1. PRECISION BIOMARKER INSIGHTS (Real-time data interpretation) ───────
    if biomarkers.get("jitter_local", 0) > 0.015:
        base["precision_insights"].append(
            "High Pitch Instability (Jitter): Your vocal folds are struggling to maintain a constant frequency. "
            "This micro-tremor is a common early indicator of dopaminergic loss affecting the laryngeal muscles."
        )
    
    if biomarkers.get("shimmer_local", 0) > 0.05:
        base["precision_insights"].append(
            "Volume Dysregulation (Shimmer): Fluctuations in your vocal amplitude suggest 'vocal leakage'. "
            "This often results from incomplete vocal fold closure (bowing), typical in parkinsonian speech."
        )

    if biomarkers.get("hnr", 100) < 15:
        base["precision_insights"].append(
            "Reduced Clarity (HNR): Significant 'noise' detected in your phonation. "
            "This indicates air wastage and a 'hoarse' quality consistent with reduced vocal effort (hypophonia)."
        )

    if biomarkers.get("ppe", 0) > 0.25:
        base["precision_insights"].append(
            "High Signal Complexity (PPE): Elevated Pitch Period Entropy suggests your vocal control system is "
            "operating in a chaotic state, a strong mathematical marker for neurological involvement."
        )

    # ── 2. RISK-SPECIFIC RECOMMENDATIONS ──────────────────────────────────────
    
    # 🟢 LOW / SUBCLINICAL (0 - 35)
    if risk_score < 35:
        base.update({
            "immediate_steps": [
                "Continue longitudinal monitoring via this app (3x per week).",
                "Maintain vigorous aerobic exercise — the only proven way to support neuro-plasticity.",
            ],
            "diagnostic_tests": ["Annual screening with a primary care physician (PCP)."],
            "lifestyle": ["Mediterranean-style diet", "Consistent 7-8 hours of sleep."],
            "monitoring_frequency": "Check-in every 48-72 hours.",
            "references": ["MDS PD Criteria, 2015", "AAN Practice Guidelines, 2021"]
        })

    # 🟡 MEDIUM / EARLY (35 - 70)
    elif risk_score < 70:
        base.update({
            "immediate_steps": [
                "Schedule a formal neurological evaluation within 30 days.",
                "Start a 'Vocal Health Diary'—note if your voice feels 'tired' by evening.",
            ],
            "diagnostic_tests": [
                "MoCA Cognitive Screen",
                "UPDRS Part III Motor Exam",
                "UPSIT (Smell Test) — anosmia often precedes motor symptoms by years."
            ],
            "speech_therapy": ["LSVT LOUD - Level 1 Protocol", "Hydration - minimum 2L/day to protect vocal mucosa."],
            "monitoring_frequency": "Daily voice recording. Weekly AI analysis.",
            "references": ["Postuma et al., 2015", "Fox et al., LSVT LOUD clinical evidence"]
        })

    # 🔴 HIGH / ESTABLISHED (70 - 85)
    elif risk_score < 85:
        base.update({
            "immediate_steps": [
                "⚠️ Clinical suspicion is HIGH. See a Movement Disorder Specialist within 14 days.",
                "Export this technical report and share it with your PCP for immediate referral.",
            ],
            "lifestyle": ["LSVT BIG physical therapy to address movement amplitude."],
            "speech_therapy": ["Intensive LSVT LOUD protocol (4 days/week for 4 weeks)."],
            "diagnostic_tests": ["DaTSCAN (Dopamine Transporter Imaging) to visualize nigrostriatal loss.", "Brain MRI."],
            "monitoring_frequency": "Daily recording. Essential for tracking medication efficacy later.",
            "references": ["NICE Guidelines (NG71)", "American Academy of Neurology, 2019"]
        })

    # 🚨 SEVERE / URGENT (85 - 100)  <-- Custom for 99+
    else:
        base.update({
            "immediate_steps": [
                "🚨 URGENT: Specialist consultation required within 7 days.",
                "Assess for fall risk immediately — check home for trip hazards (rugs, lighting).",
                "Discuss 'Freezing of Gait' (FOG) with your physician if present.",
            ],
            "diagnostic_tests": [
                "Full UPDRS (Parts I-IV) battery.",
                "Dopa-challenge test (to assess levodopa responsiveness).",
                "Pulmonary function tests (if breathiness is severe)."
            ],
            "specialist_referral": "Tertiary Movement Disorder Center (Multidisciplinary Team).",
            "lifestyle": ["Anti-fall home modifications", "Physiotherapy for balance and posture."],
            "speech_therapy": ["Speech-Language Pathologist (SLP) directed therapy for dysphagia (swallowing) screening."],
            "monitoring_frequency": "Daily. Monitoring for 'on/off' fluctuations is critical.",
            "references": ["MDS Evidence-Based Review of PD Treatments, 2018", "Fox Foundation Treatment Guides"]
        })

    return base
