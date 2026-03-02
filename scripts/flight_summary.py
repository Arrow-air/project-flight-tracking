#!/usr/bin/env python3
"""
flight_summary.py — Headless flight log analyzer for Arrow flight tracking platform.
Adapted from ArduPilotIntegrityApp by ZeynepB.

Usage:
    python flight_summary.py <log.bin>
    python flight_summary.py <log.bin> --output summary.json
    python flight_summary.py <log.bin> --upload --log-id <uuid> --supabase-url <url> --supabase-key <key>
"""

import argparse, datetime, json, os, subprocess, sys, tempfile
import numpy as np
import pandas as pd

COPTER_MODES = {
    0:'STABILIZE',1:'ACRO',2:'ALTHOLD',3:'AUTO',4:'GUIDED',5:'LOITER',
    6:'RTL',7:'CIRCLE',9:'LAND',11:'DRIFT',14:'FLIP',15:'AUTOTUNE',
    16:'POSHOLD',17:'BRAKE',18:'THROW',19:'AVOID_ADSB',20:'GUIDED_NOGPS',
    21:'SMART_RTL',22:'FLOWHOLD',23:'FOLLOW',24:'ZIGZAG',25:'SYSTEMID',
    26:'AUTOROTATE',27:'AUTO_RTL'
}

def get_log_section(log_path, types):
    for t in types:
        with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix=".csv") as tmp:
            subprocess.run(['mavlogdump.py','--format','csv','--types',t,log_path],
                           stdout=tmp, stderr=subprocess.DEVNULL)
            tmp_path = tmp.name
        try:
            df = pd.read_csv(tmp_path, on_bad_lines='warn')
            os.remove(tmp_path)
            if not df.empty:
                if 'TimeUS' in df.columns:
                    df['TimeS'] = df['TimeUS'] / 1_000_000
                return df
        except Exception:
            try: os.remove(tmp_path)
            except: pass
    return pd.DataFrame()

def analyze(log_path):
    df_mode    = get_log_section(log_path, ['MODE'])
    df_gps     = get_log_section(log_path, ['GPS'])
    df_bat     = get_log_section(log_path, ['BATT','BAT'])
    df_att     = get_log_section(log_path, ['ATT'])
    df_vibe    = get_log_section(log_path, ['VIBE'])
    df_imu     = get_log_section(log_path, ['IMU'])
    df_rcou    = get_log_section(log_path, ['RCOU'])
    df_msg     = get_log_section(log_path, ['MSG','ERR','EV'])
    df_ekf_var = get_log_section(log_path, ['XKF4','NKF4'])
    df_mag     = get_log_section(log_path, ['MAG'])
    df_stat    = get_log_section(log_path, ['STAT'])

    score = 100
    anomalies = []

    # Duration
    duration_s = None
    duration_str = "Unknown"
    if not df_stat.empty and 'FltTime' in df_stat.columns:
        duration_s = int(df_stat['FltTime'].max())
        duration_str = str(datetime.timedelta(seconds=duration_s))
    elif not df_att.empty:
        duration_s = int(df_att['TimeS'].max() - df_att['TimeS'].min())
        duration_str = str(datetime.timedelta(seconds=duration_s)) + " (derived)"

    # Modes
    modes_used = []
    if not df_mode.empty:
        mode_col = 'Mode' if 'Mode' in df_mode.columns else 'ModeNum'
        modes_used = [COPTER_MODES.get(int(m), f"Mode {m}") for m in df_mode[mode_col].unique()]

    # Battery
    min_volt = max_volt = max_curr = 0.0
    if not df_bat.empty:
        df_p = df_bat[df_bat['Instance']==0] if 'Instance' in df_bat.columns else df_bat
        vc = next((c for c in ['Volt','Volts','V'] if c in df_p.columns), None)
        ic = next((c for c in ['Curr','Current','I'] if c in df_p.columns), None)
        if vc: min_volt,max_volt = float(df_p[vc].min()), float(df_p[vc].max())
        if ic: max_curr = float(df_p[ic].max())

    # Vibrations
    max_vibe = 0.0
    if not df_vibe.empty:
        vc = [c for c in ['VibeX','VibeY','VibeZ'] if c in df_vibe.columns]
        if vc: max_vibe = float(df_vibe[vc].max().max())
    if max_vibe > 30: score -= 25; vibe_status = "fail"
    elif max_vibe > 15: score -= 5; vibe_status = "warn"
    else: vibe_status = "good"

    # IMU clips
    clips = 0
    if not df_imu.empty:
        cc = [c for c in df_imu.columns if 'Clip' in c]
        if cc: clips = int(df_imu[cc].sum().sum())
    if clips > 0: score -= 10

    # Power sag
    sag_pct = (max_volt - min_volt) / max_volt if max_volt > 0 else 0.0
    if sag_pct > 0.20: score -= 15; power_status = "fail"
    elif sag_pct > 0.12: score -= 5; power_status = "warn"
    else: power_status = "good"

    # EKF variance
    max_ekf_var = 0.0; ekf_status = "good"
    if not df_ekf_var.empty:
        vc = [c for c in ['SV','SP','SH'] if c in df_ekf_var.columns]
        if vc: max_ekf_var = float(df_ekf_var[vc].max().max())
    if max_ekf_var > 0.8: score -= 20; ekf_status = "fail"

    # Motors
    motors = ['C1','C2','C3','C4']
    motor_delta = motor_saturation = 0; motor_status = "good"
    if not df_rcou.empty and all(m in df_rcou.columns for m in motors):
        avg = df_rcou[motors].mean()
        motor_delta = float(avg.max() - avg.min())
        motor_saturation = int((df_rcou[motors] > 1900).sum().sum())
        if motor_delta > 150: score -= 15; motor_status = "warn"
        if motor_saturation > 0: score -= 10; motor_status = "fail"

    # Compass
    compass_stddev = 0.0; compass_status = "good"
    if not df_mag.empty and all(c in df_mag.columns for c in ['MagX','MagY','MagZ']):
        field = np.sqrt(df_mag['MagX']**2 + df_mag['MagY']**2 + df_mag['MagZ']**2)
        compass_stddev = float(field.std())
        if compass_stddev > 200: compass_status = "warn"

    # Anomalies
    if not df_msg.empty:
        for _, row in df_msg.iterrows():
            msg = str(row.get('Message',''))
            if any(k in msg.upper() for k in ['ERR','FAILSAFE','LANE','LOSS','CRASH','EKF']):
                t = str(datetime.timedelta(seconds=int(row.get('TimeS',0))))
                anomalies.append({"time": t, "message": msg})

    return {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "health_score": max(0, score),
        "summary": {
            "duration": duration_str,
            "duration_s": duration_s,
            "modes_used": modes_used,
            "max_current_a": round(max_curr, 1),
            "min_voltage_v": round(min_volt, 2),
            "max_voltage_v": round(max_volt, 2),
        },
        "checks": {
            "vibrations":     {"value_m_s2": round(max_vibe,1), "status": vibe_status, "threshold_warn":15,"threshold_fail":30},
            "imu_clips":      {"value": clips, "status": "fail" if clips>0 else "good"},
            "power_sag":      {"sag_pct": round(sag_pct*100,1), "min_voltage_v": round(min_volt,2), "status": power_status},
            "ekf_variance":   {"max_value": round(max_ekf_var,3), "status": ekf_status, "threshold_fail":0.8},
            "motor_symmetry": {"delta_pwm": round(motor_delta,1), "saturation_count": motor_saturation, "status": motor_status},
            "compass":        {"field_stddev": round(compass_stddev,1), "status": compass_status},
        },
        "anomalies": anomalies
    }

def upload_summary(summary, log_id, supabase_url, supabase_key):
    import urllib.request
    payload = json.dumps({"summary": summary}).encode()
    url = f"{supabase_url}/rest/v1/flight_leg_logs?id=eq.{log_id}"
    req = urllib.request.Request(url, data=payload, method='PATCH')
    req.add_header('Content-Type', 'application/json')
    req.add_header('apikey', supabase_key)
    req.add_header('Authorization', f'Bearer {supabase_key}')
    req.add_header('Prefer', 'return=minimal')
    with urllib.request.urlopen(req) as resp:
        print(f"Uploaded summary for log {log_id} — HTTP {resp.status}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description="Generate JSON flight summary from ArduPilot .bin log")
    parser.add_argument("log")
    parser.add_argument("--output", help="Write JSON to file instead of stdout")
    parser.add_argument("--upload", action="store_true")
    parser.add_argument("--log-id")
    parser.add_argument("--supabase-url")
    parser.add_argument("--supabase-key")
    args = parser.parse_args()

    if not os.path.exists(args.log):
        print(f"Error: file not found: {args.log}", file=sys.stderr); sys.exit(1)

    print(f"Analyzing {args.log}...", file=sys.stderr)
    summary = analyze(args.log)
    result = json.dumps(summary, indent=2)

    if args.output:
        with open(args.output, 'w') as f: f.write(result)
        print(f"Saved to {args.output}", file=sys.stderr)
    else:
        print(result)

    if args.upload:
        if not all([args.log_id, args.supabase_url, args.supabase_key]):
            print("Error: --upload requires --log-id, --supabase-url, --supabase-key", file=sys.stderr); sys.exit(1)
        upload_summary(summary, args.log_id, args.supabase_url, args.supabase_key)

if __name__ == "__main__":
    main()
